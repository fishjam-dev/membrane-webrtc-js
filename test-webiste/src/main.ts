import { Endpoint, WebRTCEndpoint } from "@jellyfish-dev/membrane-webrtc-js";

const webRTCEndpoint = new WebRTCEndpoint()
// @ts-ignore
window["webRTCEndpoint"] = webRTCEndpoint

// const connectedEvent = {
//     type: "connected",
//     data: {
//         id: '7b789673-8600-4c8b-8f45-476b86cb820d', // peerId
//         otherEndpoints: []
//     }
// }
//
// webRTCEndpoint.on("connected", (peerId: string, _peersInRoom: Endpoint[]) => {
//     console.log("Connected")
// });
//
// webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent))
