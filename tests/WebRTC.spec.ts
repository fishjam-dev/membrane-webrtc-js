// import { test, expect, ConsoleMessage } from '@playwright/test';
// import { Endpoint, WebRTCEndpoint } from "../";
// import { createConnectedEvent, createEmptyEndpoint, createSimulcastTrack } from "../src/test/fixtures";
// import { CustomOfferDataEvent, TracksAddedMediaEvent } from "../src/test/schema";
//
// test.skip('has title', async ({ page }) => {
//     await page.goto('/');
//
//     page.on('console', async (msg: ConsoleMessage) => {
//         // expect(msg).toContain("Connected")
//         // const jsHandle = msg.args()[0] // there is only one parameter in console.log
//         // const props = await jsHandle.getProperties()
//         // const peerId = await props.get("peerId")?.jsonValue()
//
//         // console.log({ jsHandle, props, args: msg.args(), text: msg.text() })
//         console.log({ text: msg.text()})
//     });
//
//     await page.evaluate(async () => {
//         // @ts-ignore
//         const webRTCEndpoint: WebRTCEndpoint = window["webRTCEndpoint"]
//
//         const connectedEvent = {
//             type: "connected",
//             data: {
//                 id: '7b789673-8600-4c8b-8f45-476b86cb820d', // peerId
//                 otherEndpoints: [
//                     {
//                         id: '210fdb82-80d2-4868-8c31-a45f54f6e3c9',
//                         // todo undefined metadata?
//                         metadata: { name: '210fdb82-80d2-4868-8c31-a45f54f6e3c9' },
//                         trackIdToMetadata: {},
//                         tracks: {},
//                         type: 'webrtc'
//                     }
//                 ]
//             }
//         }
//
//         webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent))
//
//         const trackId = "trackId"
//
//         const trackAddedEvent: TracksAddedMediaEvent = {
//             type: "tracksAdded",
//             data: {
//                 endpointId: connectedEvent.data.otherEndpoints[0].id,
//                 tracks: {
//                     [trackId]: {
//                         metadata: {},
//                         simulcastConfig: {
//                             enabled: true,
//                             activeEncodings: ["h", "m", "l"]
//                         }
//                     }
//                 },
//                 trackIdToMetadata: {
//                     [trackId]: {}
//                 }
//             }
//         }
//
//         webRTCEndpoint.receiveMediaEvent(JSON.stringify(trackAddedEvent))
//
//         const offerData: CustomOfferDataEvent = {
//             "data": {
//                 "data": {
//                     "integratedTurnServers": [
//                         {
//                             "password": "E9ck/2hJCkkuVSmPfFrNg2l1+JA=",
//                             "serverAddr": "192.168.1.95",
//                             "serverPort": 50018,
//                             "transport": "udp",
//                             "username": "1698997572:dedfa04f-b30a-433a-86d5-03336a828caa"
//                         }
//                     ],
//                     "tracksTypes": {
//                         "audio": 0,
//                         "video": 1
//                     }
//                 },
//                 "type": "offerData"
//             },
//             "type": "custom"
//         }
//
//         // When
//         webRTCEndpoint.receiveMediaEvent(JSON.stringify(offerData))
//
//         // Then
//         const rtcConfig = webRTCEndpoint["rtcConfig"]
//
//         console.log(rtcConfig.iceServers.length)
//         // expect( rtcConfig.iceServers?.length).toBe(1);
//     })
// });
