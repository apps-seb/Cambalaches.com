# CanjeApp - Local Development

## Important Note on Push Notifications

Modern web browsers require web applications to be run from a secure environment (like `https://` or `http://localhost`) in order to enable features like push notifications. This applies to both desktop and mobile browsers.

When you open the `index.html` file directly in your browser, it is loaded from a `file:///` address. This is considered an insecure origin, and the browser will automatically disable push notifications.

### The Solution

To get push notifications working, you need to serve the application files from a simple local web server on your computer and then access that server from your mobile phone. We have provided easy-to-use scripts to make this process simple.

### How to Run the App Locally

1.  **Unzip the project files** into a folder on your computer.
2.  **Connect your computer and your mobile phone to the same Wi-Fi network.** This is essential.
3.  **Open your terminal or command prompt** on your computer.
4.  **Navigate to the project folder.**
5.  Follow the instructions for your operating system:

    *   **On macOS or Linux:**
        ```bash
        ./serve.sh
        ```

    *   **On Windows:**
        ```bash
        ./serve.bat
        ```

6.  After running the script, your terminal will display one or more IP addresses. Look for an address that looks like `192.168.x.x` or `10.0.x.x`. It will be clearly marked.

7.  **On your mobile phone, open your web browser** (like Chrome or Safari) and type in the IP address and port number exactly as shown in the terminal. For example:
    ```
    http://192.168.1.5:8000
    ```

Now, the application will be running on your phone from a secure local environment, and you will be able to activate and receive push notifications. To test on your computer, you can also browse to `http://localhost:8000`.
