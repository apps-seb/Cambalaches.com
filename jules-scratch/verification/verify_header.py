import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        iphone_13 = p.devices['iPhone 13']
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            **iphone_13,
        )
        page = await context.new_page()

        # The application is a static site, so we can go to the file directly.
        # We need to construct the full file path.
        import os
        file_path = "file://" + os.path.abspath("index.html")

        await page.goto(file_path, wait_until='domcontentloaded')

        # The header is inside the #main-content-wrapper
        header = page.locator('#main-content-wrapper > header')

        # Take a screenshot of the header
        await header.screenshot(path="jules-scratch/verification/verification.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
