import { WebRTCEndpoint } from "../../src";
import {
  createAddLocalTrackAnswerData,
  createAddLocalTrackSDPOffer,
  createAnswerData,
  createCustomOfferDataEventWithOneVideoTrack,
  createTracksRemovedEvent,
  endpointId,
  mockTrack,
  stream,
  trackId,
} from "../fixtures";
import { mockRTCPeerConnection } from "../mocks";
import { setupRoom } from "../utils";

test("Remove tracks event should emit event", (done) => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  setupRoom(webRTCEndpoint, endpointId, trackId);
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createAddLocalTrackSDPOffer()));
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createAddLocalTrackAnswerData(trackId)));


  webRTCEndpoint.on("trackRemoved", (trackContext) => {
    // Then
    expect(trackContext.trackId).toBe(trackId);
    done();
  });

  // When
  const addEndpointEvent = createTracksRemovedEvent(endpointId, [trackId]);
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(addEndpointEvent));
});

test("Remove tracks event should remove from local state", () => {
  // Given
  const { runOnTrack } = mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  setupRoom(webRTCEndpoint, endpointId, trackId);

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createAddLocalTrackSDPOffer()));
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createAddLocalTrackAnswerData(trackId)));
  const midToTrackId = webRTCEndpoint["midToTrackId"];
  const trackIdToTrack = webRTCEndpoint["trackIdToTrack"];
  const connection = webRTCEndpoint["connection"]!;
  const transciever = new RTCRtpTransceiver();

  // @ts-ignore
  const rtcTrackEvent: RTCTrackEvent = {
    streams: [stream],
    transceiver: transciever,
  };
  // @ts-ignore
  connection.ontrack(rtcTrackEvent);

  // When
  const addEndpointEvent = createTracksRemovedEvent(endpointId, [trackId]);
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(addEndpointEvent));

  const tracks = webRTCEndpoint.getRemoteTracks();
  expect(Object.values(tracks).length).toBe(0);
});
