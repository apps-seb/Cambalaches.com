import asyncio
from playwright.async_api import async_playwright, expect
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Use a mobile viewport to verify the mobile header fix
        page = await browser.new_page(**p.devices['iPhone 13'])

        # Go to the local file
        file_path = f"file://{os.getcwd()}/index.html"
        await page.goto(file_path, wait_until='domcontentloaded')

        # Wait for the header to be stable and visible
        header_locator = page.locator("#main-content-wrapper > header")
        await expect(header_locator).to_be_visible()

        # Take a screenshot of the specific header to verify the color change
        await header_locator.screenshot(path="jules-scratch/verification/header_color_verification.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
