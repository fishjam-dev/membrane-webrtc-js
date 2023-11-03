import { WebRTCEndpoint } from "../webRTCEndpoint";
import { createConnectedEvent, createEmptyEndpoint, createSimulcastTrack } from "./fixtures";
import { TracksAddedMediaEvent } from "./schema";

test('Connecting to room with one peer then tracks added event occurred', () => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint()
    const trackAddedCallback = jest.fn(x => null);

    const connectedEvent = createConnectedEvent()
    connectedEvent.data.otherEndpoints = [
        createEmptyEndpoint()
    ]

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent))

    const trackId = "trackId"

    const trackAddedEvent: TracksAddedMediaEvent = {
        type: "tracksAdded",
        data: {
            endpointId: connectedEvent.data.otherEndpoints[0].id,
            tracks: {
                [trackId]: createSimulcastTrack()
            },
            trackIdToMetadata: {
                [trackId]: {}
            }
        }
    }

    webRTCEndpoint.on("trackAdded", (ctx) => {
        trackAddedCallback(ctx)
        expect(ctx.trackId).toBe(trackId)
        expect(ctx.endpoint.id).toBe(trackAddedEvent.data.endpointId)
        expect(ctx.simulcastConfig?.enabled).toBe(trackAddedEvent.data.tracks[trackId].simulcastConfig.enabled)
    })

    // When
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(trackAddedEvent))

    // Then
    const remoteTracks = webRTCEndpoint.getRemoteTracks()
    expect(Object.values(remoteTracks).length).toBe(1)

    expect(trackAddedCallback.mock.calls).toHaveLength(1);
});
