import { WebRTCEndpoint } from "../../webRTCEndpoint";
import {
    createAddTrackMediaEvent,
    createAnswerData,
    createConnectedEventWithOneEndpoint,
    createCustomOfferDataEventWithOneVideoTrack
} from "../fixtures";
import { CustomOfferDataEvent, TracksAddedMediaEvent } from "../schema";
import { deserializeMediaEvent } from "../../mediaEvent";
import { mockRTCPeerConnection } from "../mocks";


const trackId: string = "9afe80ce-1964-4958-a386-d7a9e3097ca7:5c74b6b3-cb72-49f1-a76b-0df4895a3d32"

test('Connect to room with one endpoint than addTrack', () => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint()
    const trackAddedCallback = jest.fn(x => null);

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()))

    const trackAddedEvent: TracksAddedMediaEvent = createAddTrackMediaEvent(trackId, createConnectedEventWithOneEndpoint().data.otherEndpoints[0].id)

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

test('tracksAdded -> handle offerData with one video track from server', (done) => {
    // Given
    const { addTransceiverCallback } = mockRTCPeerConnection();

    const webRTCEndpoint = new WebRTCEndpoint()

    const connectedEvent = createConnectedEventWithOneEndpoint();
    const trackId = "trackId"

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent))

    const trackAddedEvent: TracksAddedMediaEvent = createAddTrackMediaEvent(trackId, connectedEvent.data.otherEndpoints[0].id)

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(trackAddedEvent))

    const offerData: CustomOfferDataEvent = createCustomOfferDataEventWithOneVideoTrack()

    webRTCEndpoint.on("sendMediaEvent", (mediaEvent) => {
        expect(mediaEvent).toContain("sdpOffer");
        const event = deserializeMediaEvent(mediaEvent)
        expect(event.type).toBe("custom");
        expect(event.data.type).toBe("sdpOffer");
        done()
    })

    // When
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(offerData))

    // Then
    const rtcConfig = webRTCEndpoint["rtcConfig"]

    expect(rtcConfig.iceServers?.length).toBe(1);

    // todo
    //  if there is no connection: Setup callbacks else restartIce

    expect(addTransceiverCallback.mock.calls).toHaveLength(1);
    expect(addTransceiverCallback.mock.calls[0][0]).toBe("video");

    const transceivers = webRTCEndpoint["connection"]?.getTransceivers()

    expect(transceivers?.length).toBe(1);
    expect(transceivers?.[0].direction).toBe("recvonly");
})


test('tracksAdded -> offerData with one track -> handle sdpAnswer data with one video track from server', () => {
    // Given
    mockRTCPeerConnection();

    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()))
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createAddTrackMediaEvent(trackId, createConnectedEventWithOneEndpoint().data.otherEndpoints[0].id)))
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createCustomOfferDataEventWithOneVideoTrack()))

    // When
    const answerData = createAnswerData(trackId)

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(answerData))

    // Then
    const midToTrackId = webRTCEndpoint["midToTrackId"]

    expect(midToTrackId.size).toBe(1)
})