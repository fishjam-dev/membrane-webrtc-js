import { WebRTCEndpoint } from "../../src";
import {
  createAddTrackMediaEvent,
  createAnswerData,
  createConnectedEventWithOneEndpoint,
  createCustomOfferDataEventWithOneVideoTrack,
  trackId,
} from "../fixtures";
import { CustomOfferDataEvent, TracksAddedMediaEvent } from "../schema";
import { mockRTCPeerConnection } from "../mocks";
import { deserializeMediaEvent } from "../../src/mediaEvent";

test("Connect to room with one endpoint then addTrack produce event", (done) => {
  // Given
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()));

  const trackAddedEvent: TracksAddedMediaEvent = createAddTrackMediaEvent(
    createConnectedEventWithOneEndpoint().data.otherEndpoints[0].id,
    trackId,
  );

  webRTCEndpoint.on("trackAdded", (ctx) => {
    expect(ctx.trackId).toBe(trackId);
    expect(ctx.endpoint.id).toBe(trackAddedEvent.data.endpointId);
    expect(ctx.simulcastConfig?.enabled).toBe(trackAddedEvent.data.tracks[trackId].simulcastConfig.enabled);
    done();
  });

  // When
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(trackAddedEvent));

  // Then
  const remoteTracks = webRTCEndpoint.getRemoteTracks();
  expect(Object.values(remoteTracks).length).toBe(1);
});

test("tracksAdded -> handle offerData with one video track from server", (done) => {
  // Given
  const { addTransceiverCallback } = mockRTCPeerConnection();

  const webRTCEndpoint = new WebRTCEndpoint();

  const connectedEvent = createConnectedEventWithOneEndpoint();

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent));

  const trackAddedEvent: TracksAddedMediaEvent = createAddTrackMediaEvent(
    connectedEvent.data.otherEndpoints[0].id,
    trackId,
  );

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(trackAddedEvent));

  const offerData: CustomOfferDataEvent = createCustomOfferDataEventWithOneVideoTrack();

  webRTCEndpoint.on("sendMediaEvent", (mediaEvent) => {
    expect(mediaEvent).toContain("sdpOffer");
    const event = deserializeMediaEvent(mediaEvent);
    expect(event.type).toBe("custom");
    expect(event.data.type).toBe("sdpOffer");
    done();
  });

  // When
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(offerData));

  // Then
  const rtcConfig = webRTCEndpoint["rtcConfig"];

  expect(rtcConfig.iceServers?.length).toBe(1);

  // todo
  //  if there is no connection: Setup callbacks else restartIce

  expect(addTransceiverCallback.mock.calls).toHaveLength(1);
  expect(addTransceiverCallback.mock.calls[0][0]).toBe("video");

  const transceivers = webRTCEndpoint["connection"]?.getTransceivers();

  expect(transceivers?.length).toBe(1);
  expect(transceivers?.[0].direction).toBe("recvonly");
});

test("tracksAdded -> offerData with one track -> handle sdpAnswer data with one video track from server", () => {
  // Given
  mockRTCPeerConnection();

  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()));
  webRTCEndpoint.receiveMediaEvent(
    JSON.stringify(createAddTrackMediaEvent(createConnectedEventWithOneEndpoint().data.otherEndpoints[0].id, trackId)),
  );
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createCustomOfferDataEventWithOneVideoTrack()));

  // When
  const answerData = createAnswerData(trackId);

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(answerData));

  // Then
  const midToTrackId = webRTCEndpoint["midToTrackId"];

  expect(midToTrackId.size).toBe(1);
});
