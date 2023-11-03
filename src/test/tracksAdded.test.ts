import { WebRTCEndpoint } from "../webRTCEndpoint";
import { createConnectedEvent, createEmptyEndpoint, createSimulcastTrack } from "./fixtures";
import { CustomOfferDataEvent, TracksAddedMediaEvent } from "./schema";

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


test('tracksAdded -> offerData', () => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint()

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

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(trackAddedEvent))


    const offerData: CustomOfferDataEvent = {
        "data": {
            "data": {
                "integratedTurnServers": [
                    {
                        "password": "E9ck/2hJCkkuVSmPfFrNg2l1+JA=",
                        "serverAddr": "192.168.1.95",
                        "serverPort": 50018,
                        "transport": "udp",
                        "username": "1698997572:dedfa04f-b30a-433a-86d5-03336a828caa"
                    }
                ],
                "tracksTypes": {
                    "audio": 0,
                    "video": 1
                }
            },
            "type": "offerData"
        },
        "type": "custom"
    }

    // When
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(offerData))

    // Then
    const rtcConfig = webRTCEndpoint["rtcConfig"]
    rtcConfig.iceServers

    expect( rtcConfig.iceServers?.length).toBe(1);
})
