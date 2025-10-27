from playwright.sync_api import sync_playwright
import os

def run_verification():
    """
    This script verifies the new chat UI by directly opening the static index.html,
    making the chat page visible, injecting dummy data, and taking a screenshot.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Navigate to the local index.html file.
        file_path = os.path.abspath('index.html')
        page.goto(f'file://{file_path}')

        # Wait for a known element to ensure the page's JS has initialized.
        page.wait_for_selector('#page-explorar')

        # 2. Directly manipulate the DOM to show the chat page.
        # This is more robust than relying on a global showPage function.
        page.evaluate("""() => {
            // Hide all pages
            document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
            // Show the specific chat page
            const chatPage = document.getElementById('page-chat');
            if (chatPage) {
                chatPage.classList.remove('hidden');
            }
        }""")

        # 3. Populate the chat header with dummy data for a realistic screenshot.
        page.evaluate("""() => {
            const chatItemName = document.getElementById('chat-item-name');
            const chatWithName = document.getElementById('chat-with-name');
            const chatItemImage = document.getElementById('chat-item-image');
            if (chatItemName) chatItemName.textContent = 'Smartwatch en buen estado';
            if (chatWithName) chatWithName.textContent = 'Hablando con: Juan Pérez';
            if (chatItemImage) chatItemImage.src = 'https://placehold.co/100x100/E5E7EB/4B5563?text=Item';
        }""")

        # 4. Add dummy messages to simulate a conversation, including different states.
        page.evaluate("""() => {
            const chatMessages = document.getElementById('chat-messages');
            if (!chatMessages) return;

            const messageOther = `
                <div class="flex justify-start mb-4">
                    <div class="px-4 py-2 text-white bg-gray-400 rounded-lg max-w-xs shadow-sm">
                        <p class="text-sm">Hola, ¿todavía está disponible?</p>
                        <div class="text-right mt-1">
                           <span class="text-xs text-gray-200">10:30 AM</span>
                        </div>
                    </div>
                </div>
            `;

            const messageUser = `
                <div class="flex justify-end mb-4">
                    <div class="px-4 py-2 text-white bg-brand rounded-lg max-w-xs shadow-sm">
                        <p class="text-sm">¡Hola! Sí, todavía lo tengo. ¿Te interesa?</p>
                        <div class="text-right mt-1">
                           <span class="text-xs text-blue-100">10:31 AM</span>
                        </div>
                    </div>
                </div>
            `;

            const messageSending = `
                 <div class="flex justify-end mb-4" data-message-id="temp_12345">
                    <div class="px-4 py-2 text-white bg-brand rounded-lg max-w-xs shadow-sm">
                        <p class="text-sm">Perfecto, ¿qué ofreces a cambio?</p>
                        <div class="text-right mt-1">
                           <span class="text-xs text-blue-100">Enviando...</span>
                        </div>
                    </div>
                </div>
            `;

            chatMessages.innerHTML = messageOther + messageUser + messageSending;
        }""")

        # 5. Wait for the chat page to be fully visible before taking the screenshot.
        page.wait_for_selector('#page-chat:not(.hidden)')

        # 6. Take the screenshot.
        page.screenshot(path='jules-scratch/verification/chat_ui_verification.png')

        browser.close()

if __name__ == '__main__':
    run_verification()
