const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Aquí se agregarán las funciones para notificaciones.

/**
 * Cloud Function que se activa al crear una nueva oferta.
 * Envía una notificación push al dueño del artículo deseado.
 */
exports.sendOfferNotification = functions.firestore
    .document('offers/{offerId}')
    .onCreate(async (snap, context) => {
        const offerData = snap.data();

        // 1. Obtener los datos necesarios de la oferta
        const proposerName = offerData.proposerName;
        const targetOwnerId = offerData.targetItem.targetOwnerId;

        if (!targetOwnerId) {
            console.log("No se encontró el ID del dueño del artículo. No se puede enviar notificación.");
            return null;
        }

        // 2. Obtener el token de notificación del usuario destinatario
        const userDocRef = admin.firestore().collection('users').doc(targetOwnerId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            console.log(`No se encontró el documento del usuario: ${targetOwnerId}`);
            return null;
        }

        const fcmToken = userDoc.data().fcmToken;
        if (!fcmToken) {
            console.log(`El usuario ${targetOwnerId} no tiene un token de FCM. No se puede notificar.`);
            return null;
        }

        // 3. Construir la notificación
        const payload = {
            notification: {
                title: '¡Nueva Oferta Recibida!',
                body: `${proposerName} te ha hecho una oferta.`,
                icon: '/icons/icon-192x192.png'
            },
            data: {
                click_action: 'page-canjes' // Acción para que el frontend abra la página correcta
            }
        };

        // 4. Enviar la notificación
        try {
            console.log(`Enviando notificación a ${targetOwnerId} con token ${fcmToken}`);
            await admin.messaging().sendToDevice(fcmToken, payload);
            console.log('Notificación enviada con éxito.');
        } catch (error) {
            console.error('Error al enviar la notificación:', error);
        }

        return null;
    });

/**
 * Cloud Function que se activa al crear un nuevo mensaje en un chat.
 * Envía una notificación push al usuario receptor del mensaje.
 */
exports.sendMessageNotification = functions.firestore
    .document('chats/{chatId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
        const messageData = snap.data();
        const senderId = messageData.senderId;
        const chatId = context.params.chatId;

        // 1. Obtener el documento del chat para identificar al destinatario
        const chatDocRef = admin.firestore().collection('chats').doc(chatId);
        const chatDoc = await chatDocRef.get();

        if (!chatDoc.exists) {
            console.log(`No se encontró el chat: ${chatId}`);
            return null;
        }

        const chatData = chatDoc.data();
        const participants = chatData.participants || [];
        const recipientId = participants.find(p => p !== senderId);

        if (!recipientId) {
            console.log("No se pudo identificar al destinatario del mensaje.");
            return null;
        }

        // 2. Obtener el nombre del remitente y el token del destinatario
        const senderDoc = await admin.firestore().collection('users').doc(senderId).get();
        const recipientDoc = await admin.firestore().collection('users').doc(recipientId).get();

        if (!senderDoc.exists || !recipientDoc.exists) {
            console.log("No se encontró el remitente o el destinatario.");
            return null;
        }

        const senderName = senderDoc.data().name || 'Alguien';
        const fcmToken = recipientDoc.data().fcmToken;

        if (!fcmToken) {
            console.log(`El usuario ${recipientId} no tiene un token de FCM.`);
            return null;
        }

        // 3. Construir la notificación
        const messageText = messageData.type === 'image' ? '📷 Imagen' : messageData.text;
        const payload = {
            notification: {
                title: `Nuevo mensaje de ${senderName}`,
                body: messageText,
                icon: '/icons/icon-192x192.png'
            },
            data: {
                click_action: 'page-chat',
                chatId: chatId // Enviar el ID del chat para abrirlo directamente
            }
        };

        // 4. Enviar la notificación
        try {
            console.log(`Enviando notificación de mensaje a ${recipientId}`);
            await admin.messaging().sendToDevice(fcmToken, payload);
            console.log('Notificación de mensaje enviada con éxito.');
        } catch (error) {
            console.error('Error al enviar la notificación de mensaje:', error);
        }

        return null;
    });
