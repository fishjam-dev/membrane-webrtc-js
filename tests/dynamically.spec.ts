import { test, expect, ConsoleMessage, } from '@playwright/test';
import { Endpoint, WebRTCEndpoint } from "../";

[1, 2, 3].map((e) => {
    test(`has title + ${e}`, async ({ page }) => {
        await page.goto('about:blank');
    })
})
