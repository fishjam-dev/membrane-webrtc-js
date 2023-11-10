import { WebRTCEndpoint } from "../../webRTCEndpoint";
import {
    createConnectedEventWithOneEndpointWithOneTrack,
    createEncodingSwitchedEvent, endpointId, notExistingEndpointId, notExistingTrackId, trackId,
} from "../fixtures";


test('Change existing track encoding', () => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpointWithOneTrack(endpointId, trackId)))

    const initialTrackEncoding = webRTCEndpoint.getRemoteTracks()[trackId].encoding
    expect(initialTrackEncoding).toBe(undefined)

    // When
    const encodingUpdatedEvent = createEncodingSwitchedEvent(endpointId, trackId, "m")
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(encodingUpdatedEvent))

    // Then
    const finalTrackEncoding = webRTCEndpoint.getRemoteTracks()[trackId].encoding
    expect(finalTrackEncoding).toBe(encodingUpdatedEvent.data.data.encoding)
});

test('Changing track encoding when endpoint exist but track does not exist', () => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpointWithOneTrack(endpointId, trackId)))

    const initialTrackEncoding = webRTCEndpoint.getRemoteTracks()[trackId].encoding
    expect(initialTrackEncoding).toBe(undefined)

    // When
    expect(() => {
        const encodingUpdatedEvent = createEncodingSwitchedEvent(endpointId, notExistingTrackId, "m")
        webRTCEndpoint.receiveMediaEvent(JSON.stringify(encodingUpdatedEvent))

        // todo change this error in production code
    }).toThrow("Cannot set properties of undefined (setting 'encoding')");
});

test('Changing track encoding when endpoint does not exist but track exist in other endpoint', () => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpointWithOneTrack(endpointId, trackId)))

    const initialTrackEncoding = webRTCEndpoint.getRemoteTracks()[trackId].encoding
    expect(initialTrackEncoding).toBe(undefined)

    // When
    const encodingUpdatedEvent = createEncodingSwitchedEvent(notExistingEndpointId, trackId, "m")
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(encodingUpdatedEvent))

    // Then
    const finalTrackEncoding = webRTCEndpoint.getRemoteTracks()[trackId].encoding
    expect(finalTrackEncoding).toBe(encodingUpdatedEvent.data.data.encoding)
});
