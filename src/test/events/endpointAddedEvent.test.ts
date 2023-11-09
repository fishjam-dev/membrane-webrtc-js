import { mockRTCPeerConnection } from "../mocks";
import { WebRTCEndpoint } from "../../webRTCEndpoint";
import { createConnectedEvent, createConnectedEventWithOneEndpoint } from "../fixtures";
import { EndpointAddedWebrtcEvent, EndpointAddedWebrtcEventSchema } from "../schema";


export const createEndpointAdded = (endpointId: string): EndpointAddedWebrtcEvent => EndpointAddedWebrtcEventSchema.parse({
    "data": {
        "id": endpointId,
        "metadata": {},
        "type": "webrtc"
    },
    "type": "endpointAdded"
})

test('Add endpoint to empty state', () => {
    // Given
    mockRTCPeerConnection();
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEvent()))

    const endpointId = "73d400f3-f599-4e6b-a133-28231345c83b"

    // When
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createEndpointAdded(endpointId)))

    // Then
    const endpoints = webRTCEndpoint.getRemoteEndpoints()
    expect(Object.values(endpoints).length).toBe(1)
});


test('Add another endpoint', () => {
    // Given
    mockRTCPeerConnection();
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()))

    const endpointId = "73d400f3-f599-4e6b-a133-28231345c83b"

    // When
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createEndpointAdded(endpointId)))

    // Then
    const endpoints = webRTCEndpoint.getRemoteEndpoints()
    expect(Object.values(endpoints).length).toBe(2)
});
