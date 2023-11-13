import { WebRTCEndpoint } from "../../webRTCEndpoint";
import {
    createConnectedEventWithOneEndpointWithOneTrack,
    createTrackUpdatedEvent,
    endpointId, notExistingEndpointId,
    trackId
} from "../fixtures";

test(`Updating existing track emits events`, (done) => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpointWithOneTrack(endpointId, trackId)))

    webRTCEndpoint.on("trackUpdated", (context) => {
        // Then
        expect(context.metadata).toMatchObject(metadata)
        done()
    })

    const metadata = {
        name: "New name"
    }

    // When
    const trackUpdated = createTrackUpdatedEvent(trackId, endpointId, metadata);
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(trackUpdated))
});

test(`Updating track with invalid endpoint id throws error`, () => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpointWithOneTrack(endpointId, trackId)))

    const metadata = {
        name: "New name"
    }

    expect(() => {
        // When
        const trackUpdated = createTrackUpdatedEvent(trackId, notExistingEndpointId, metadata);
        webRTCEndpoint.receiveMediaEvent(JSON.stringify(trackUpdated))

        // Then
    }).toThrow(`Endpoint with id: ${notExistingEndpointId} doesn't exist`)
});

// todo updating local endpoint is ignored
//  if (this.getEndpointId() === deserializedMediaEvent.data.endpointId)
//           return;
