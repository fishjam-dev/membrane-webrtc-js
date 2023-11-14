import { WebRTCEndpoint } from "../../webRTCEndpoint";
import {
    createConnectedEventWithOneEndpoint, stream, track,
} from "../fixtures";
import { FakeMediaStreamTrack } from "fake-mediastreamtrack";
import { deserializeMediaEvent } from "../../mediaEvent";
import { CustomOfferDataEvent, CustomSdpAnswerDataEvent } from "../schema";
import { mockRTCPeerConnection } from "../mocks";


test('Adding track invokes renegotiation', (done) => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()))

    webRTCEndpoint.on("sendMediaEvent", (mediaEvent) => {
        // Then
        expect(mediaEvent).toContain("renegotiateTracks");
        const event = deserializeMediaEvent(mediaEvent)
        expect(event.type).toBe("custom");
        expect(event.data.type).toBe("renegotiateTracks");
        done()

        // now it's time to create offer and answer
        // webRTCEndpoint.receiveMediaEvent(JSON.stringify(createOfferData()))
        // webRTCEndpoint.receiveMediaEvent(JSON.stringify(createAnswerData("9bf0cc85-c795-43b2-baf1-2c974cd770b9:1b6d99d1-3630-4e01-b386-15cbbfe5a41f")))
    })

    // When
    webRTCEndpoint.addTrack(track, stream)
});

test('Adding track updates internal state', () => {
    // Given
    mockRTCPeerConnection();
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()))

    // When
    webRTCEndpoint.addTrack(track, stream)

    // Then
    const localTrackIdToTrack = webRTCEndpoint["localTrackIdToTrack"]
    expect(localTrackIdToTrack.size).toBe(1)

    const localEndpoint = webRTCEndpoint["localEndpoint"]
    expect(localEndpoint.tracks.size).toBe(1)
});

test('Adding track before being accepted by the server throws error', () => {
    // Given
    mockRTCPeerConnection();
    const webRTCEndpoint = new WebRTCEndpoint()

    // When
    expect(() => {
        webRTCEndpoint.addTrack(track, stream)
    }).toThrow("Cannot add tracks before being accepted by the server")
});

test('Adding track updates internal state', () => {
    // Given
    mockRTCPeerConnection();
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()))

    // When
    const trackId = webRTCEndpoint.addTrack(track, stream)

    // Then
    const trackContext = webRTCEndpoint["localTrackIdToTrack"].get(trackId)
    expect(trackContext?.trackId).toBe(trackId)
    expect(trackContext?.track).toBe(track)
});

test('Adding track sets default simulcast value in internal state', () => {
    // Given
    mockRTCPeerConnection();
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()))

    // When
    const trackId = webRTCEndpoint.addTrack(track, stream)

    // Then
    const trackContext = webRTCEndpoint["localTrackIdToTrack"].get(trackId)
    const defaultSimulcastValue = { "activeEncodings": [], "enabled": false }
    expect(trackContext?.simulcastConfig).toMatchObject(defaultSimulcastValue)
});

test('Adding track sets default encoding value in internal state', () => {
    // Given
    mockRTCPeerConnection();
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()))

    // When
    const trackId = webRTCEndpoint.addTrack(track, stream)

    // Then
    const trackContext = webRTCEndpoint["localTrackIdToTrack"].get(trackId)
    expect(trackContext?.encoding).toBe(undefined)
});

test('Adding track updates internal metadata state', () => {
    // Given
    mockRTCPeerConnection();
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()))

    const metadata = {
        name: "track name"
    }

    // When
    const trackId = webRTCEndpoint.addTrack(track, stream, metadata)

    // Then
    const localTrackIdToTrack = webRTCEndpoint["localTrackIdToTrack"].get(trackId)
    expect(localTrackIdToTrack?.trackId).toBe(trackId)
});
