import { WebRTCEndpoint } from "../../src";
import { createConnectedEventWithOneEndpoint, stream, mockTrack } from "../fixtures";
import { mockRTCPeerConnection } from "../mocks";
import { deserializeMediaEvent } from "../../src/mediaEvent";
import { expect, it } from "vitest";

it("Adding track invokes renegotiation", () =>
  new Promise((done) => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint();

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()));

    webRTCEndpoint.on("sendMediaEvent", (mediaEvent) => {
      // Then
      expect(mediaEvent).toContain("renegotiateTracks");
      const event = deserializeMediaEvent(mediaEvent);
      expect(event.type).toBe("custom");
      expect(event.data.type).toBe("renegotiateTracks");
      done("");

      // now it's time to create offer and answer
      // webRTCEndpoint.receiveMediaEvent(JSON.stringify(createOfferData()))
      // webRTCEndpoint.receiveMediaEvent(JSON.stringify(createAnswerData("9bf0cc85-c795-43b2-baf1-2c974cd770b9:1b6d99d1-3630-4e01-b386-15cbbfe5a41f")))
    });

    // When
    webRTCEndpoint.addTrack(mockTrack, stream);
  }));

it("Adding track updates internal state", () => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()));

  // When
  webRTCEndpoint.addTrack(mockTrack, stream);

  // Then
  const localTrackIdToTrack = webRTCEndpoint["localTrackIdToTrack"];
  expect(localTrackIdToTrack.size).toBe(1);

  const localEndpoint = webRTCEndpoint["localEndpoint"];
  expect(localEndpoint.tracks.size).toBe(1);
});

it("Adding track before being accepted by the server throws error", () => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  // When
  expect(() => {
    webRTCEndpoint.addTrack(mockTrack, stream);
  }).toThrow("Cannot add tracks before being accepted by the server");
});

it("Adding track updates internal state", () => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()));

  // When
  const trackId = webRTCEndpoint.addTrack(mockTrack, stream);

  // Then
  const trackContext = webRTCEndpoint["localTrackIdToTrack"].get(trackId);
  expect(trackContext?.trackId).toBe(trackId);
  expect(trackContext?.track).toBe(mockTrack);
});

it("Adding track sets default simulcast value in internal state", () => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()));

  // When
  const trackId = webRTCEndpoint.addTrack(mockTrack, stream);

  // Then
  const trackContext = webRTCEndpoint["localTrackIdToTrack"].get(trackId);
  const defaultSimulcastValue = { activeEncodings: [], enabled: false };
  expect(trackContext?.simulcastConfig).toMatchObject(defaultSimulcastValue);
});

it("Adding track sets default encoding value in internal state", () => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()));

  // When
  const trackId = webRTCEndpoint.addTrack(mockTrack, stream);

  // Then
  const trackContext = webRTCEndpoint["localTrackIdToTrack"].get(trackId);
  expect(trackContext?.encoding).toBe(undefined);
});

it("Adding track updates internal metadata state", () => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()));

  const metadata = {
    name: "track name",
  };

  // When
  const trackId = webRTCEndpoint.addTrack(mockTrack, stream, metadata);

  // Then
  const localTrackIdToTrack = webRTCEndpoint["localTrackIdToTrack"].get(trackId);
  expect(localTrackIdToTrack?.trackId).toBe(trackId);
});
