import { mockRTCPeerConnection } from "./mocks";
import { WebRTCEndpoint } from "../webRTCEndpoint";
import { createConnectedEventWithOneEndpoint } from "./fixtures";
import { FakeMediaStreamTrack } from "fake-mediastreamtrack";

const MediaStreamMock = jest.fn().mockImplementation(() => {
})


const endpointAdded = {
    "data": {
        "id": "73d400f3-f599-4e6b-a133-28231345c83b",
        "metadata": {
            "name": "73d400f3-f599-4e6b-a133-28231345c83b"
        },
        "type": "webrtc"
    },
    "type": "endpointAdded"
}

test('Connect to room and then add track, webrtc not connected -> negotiate', () => {
    // Given
    mockRTCPeerConnection();
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()))

    const track = new FakeMediaStreamTrack({ kind: 'video' });
    webRTCEndpoint.addTrack(track, new MediaStreamMock())

    // When
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()))


    // const localTrackIdToTrack = webRTCEndpoint["localTrackIdToTrack"]
    //
    // // this tracks will be added after renegotiation
    // expect(localTrackIdToTrack.size).toBe(1)
    //
    // const localEndpoint = webRTCEndpoint["localEndpoint"]
    // expect(localEndpoint.tracks.size).toBe(1)
});
