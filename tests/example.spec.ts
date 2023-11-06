import { test, expect, ConsoleMessage,} from '@playwright/test';
import { Endpoint, WebRTCEndpoint } from "../";

test.skip('has title', async ({ page }) => {
    // about:blank
    await page.goto('/');
    // await page.exposeFunction('abc', () => {
    //         console.log("hello from abc!")
    //         const webrtc = new WebRTCEndpoint()
    //         return "OK"
    //     }
    // );
    page.on('console', async (msg: ConsoleMessage) => {
        // expect(msg).toContain("Connected")
        const jsHandle = msg.args()[0] // there is only one parameter in console.log
        const props = await jsHandle.getProperties()
        const peerId = await props.get("peerId")?.jsonValue()

        // console.log({ jsHandle, props, args: msg.args(), text: msg.text() })
        console.log({ props, peerId})
    });

    await page.evaluate(async () => {
        // @ts-ignore
        const webRTCEndpoint: WebRTCEndpoint = window["webRTCEndpoint"]

        const connectedEvent = {
            type: "connected",
            data: {
                id: '7b789673-8600-4c8b-8f45-476b86cb820d', // peerId
                otherEndpoints: []
            }
        }

        webRTCEndpoint.on("connected", (peerId: string, _peersInRoom: Endpoint[]) => {
            console.log({ peerId, _peersInRoom })
        });

        webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent))
    })
});

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');
//
//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();
//
//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
