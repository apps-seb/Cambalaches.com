import os
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Context without notification permission to test the default state
        context = browser.new_context()
        page = context.new_page()

        file_path = os.path.abspath('index.html')
        file_url = f'file://{file_path}'

        page.goto(file_url, wait_until='domcontentloaded')

        # Use exposed functions to set up the UI correctly
        page.evaluate("""() => {
            // 1. Navigate to the profile page
            window.showPage('page-perfil');

            // 2. Simulate a logged-in state
            document.getElementById('perfil-auth-form').classList.add('hidden');
            document.getElementById('perfil-logged-in').classList.remove('hidden');

            // 3. Run the logic that shows/hides the notification button
            window.checkNotificationPermission();
        }""")

        # Assert that the button and the descriptive text are visible
        notification_button = page.get_by_role("button", name="Activar Notificaciones")
        status_text = page.get_by_text("Recibe alertas sobre tus canjes y ofertas importantes.")

        expect(notification_button).to_be_visible()
        expect(status_text).to_be_visible()

        # Take a screenshot of the relevant part of the page
        profile_section = page.locator("#perfil-logged-in")
        profile_section.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run()
