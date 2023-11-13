import { Endpoint, WebRTCEndpoint } from "../../webRTCEndpoint";
import { createConnectedEvent, createEmptyEndpoint, createSimulcastTrack, trackId } from "../fixtures";


test('Connecting to empty room', () => {
    const webRTCEndpoint = new WebRTCEndpoint()

    const connectedEvent = createConnectedEvent()

    webRTCEndpoint.on("connected", (peerId: string, peersInRoom: Endpoint[]) => {
        expect(connectedEvent.data.id).toBe(peerId)
        expect(connectedEvent.data.otherEndpoints.length).toBe(0)
    });

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent))
});

test('Connecting to room with one peer', () => {
    const webRTCEndpoint = new WebRTCEndpoint()

    const connectedEvent = createConnectedEvent()
    connectedEvent.data.otherEndpoints = [
        createEmptyEndpoint()
    ]

    webRTCEndpoint.on("connected", (peerId: string, peersInRoom: Endpoint[]) => {
        expect(connectedEvent.data.id).toBe(peerId)
        expect(connectedEvent.data.otherEndpoints.length).toBe(connectedEvent.data.otherEndpoints.length)
    });

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent))
});

test('Connecting to room with one peer with one track', () => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint()
    const trackAddedCallback = jest.fn(x => null);
    const connectedCallback = jest.fn((peerId, peersInRoom) => null);

    const connectedEvent = createConnectedEvent()
    connectedEvent.data.otherEndpoints = [
        createEmptyEndpoint()
    ]
    const endpoint = connectedEvent.data.otherEndpoints[0]

    endpoint.tracks[trackId] = createSimulcastTrack()
    endpoint.trackIdToMetadata[trackId] = {}

    webRTCEndpoint.on("connected", (peerId: string, peersInRoom: Endpoint[]) => {
        connectedCallback(peerId, peersInRoom)
        expect(peerId).toBe(connectedEvent.data.id)
        expect(peersInRoom.length).toBe(connectedEvent.data.otherEndpoints.length)
    });


    webRTCEndpoint.on("trackAdded", (ctx) => {
        trackAddedCallback(ctx)
        expect(ctx.trackId).toBe(trackId)
        expect(ctx.simulcastConfig?.enabled).toBe(endpoint.tracks[trackId].simulcastConfig.enabled)
    })

    // When
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent))

    // Then
    const remoteTracks = webRTCEndpoint.getRemoteTracks()
    expect(Object.values(remoteTracks).length).toBe(1)

    expect(trackAddedCallback.mock.calls).toHaveLength(1);
    expect(connectedCallback.mock.calls).toHaveLength(1);
});
