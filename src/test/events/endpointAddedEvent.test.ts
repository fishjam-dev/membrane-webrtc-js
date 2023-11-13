import { mockRTCPeerConnection } from "../mocks";
import { WebRTCEndpoint } from "../../webRTCEndpoint";
import {
    createConnectedEvent,
    createConnectedEventWithOneEndpoint,
    createEndpointAdded,
    endpointId
} from "../fixtures";


test('Add endpoint to empty state', () => {
    // Given
    mockRTCPeerConnection();
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEvent()))

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

    // When
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createEndpointAdded(endpointId)))

    // Then
    const endpoints = webRTCEndpoint.getRemoteEndpoints()
    expect(Object.values(endpoints).length).toBe(2)
});
