import { WebRTCEndpoint } from "../../webRTCEndpoint";
import {
  createEncodingSwitchedEvent,
  endpointId,
  notExistingEndpointId,
  notExistingTrackId,
  trackId,
} from "../fixtures";
import { setupRoomWith } from "../utils";

test("Change existing track encoding", () => {
  // Given
  const webRTCEndpoint = new WebRTCEndpoint();

  setupRoomWith(webRTCEndpoint, endpointId, trackId);

  const initialTrackEncoding = webRTCEndpoint.getRemoteTracks()[trackId].encoding;
  expect(initialTrackEncoding).toBe(undefined);

  // When
  const encodingUpdatedEvent = createEncodingSwitchedEvent(endpointId, trackId, "m");
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(encodingUpdatedEvent));

  // Then
  const finalTrackEncoding = webRTCEndpoint.getRemoteTracks()[trackId].encoding;
  expect(finalTrackEncoding).toBe(encodingUpdatedEvent.data.data.encoding);
});

test("Changing track encoding when endpoint exist but track does not exist", () => {
  // Given
  const webRTCEndpoint = new WebRTCEndpoint();

  setupRoomWith(webRTCEndpoint, endpointId, trackId);

  const initialTrackEncoding = webRTCEndpoint.getRemoteTracks()[trackId].encoding;
  expect(initialTrackEncoding).toBe(undefined);

  // When
  expect(() => {
    const encodingUpdatedEvent = createEncodingSwitchedEvent(endpointId, notExistingTrackId, "m");
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(encodingUpdatedEvent));

    // todo change this error in production code
  }).toThrow("Cannot set properties of undefined (setting 'encoding')");
});

test("Changing track encoding when endpoint does not exist but track exist in other endpoint", () => {
  // Given
  const webRTCEndpoint = new WebRTCEndpoint();

  setupRoomWith(webRTCEndpoint, endpointId, trackId);

  const initialTrackEncoding = webRTCEndpoint.getRemoteTracks()[trackId].encoding;
  expect(initialTrackEncoding).toBe(undefined);

  // When
  const encodingUpdatedEvent = createEncodingSwitchedEvent(notExistingEndpointId, trackId, "m");
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(encodingUpdatedEvent));

  // Then
  const finalTrackEncoding = webRTCEndpoint.getRemoteTracks()[trackId].encoding;
  expect(finalTrackEncoding).toBe(encodingUpdatedEvent.data.data.encoding);
});

test("Change existing track encoding produces event", (done) => {
  // Given
  const webRTCEndpoint = new WebRTCEndpoint();

  setupRoomWith(webRTCEndpoint, endpointId, trackId);

  const initialTrackEncoding = webRTCEndpoint.getRemoteTracks()[trackId].encoding;
  expect(initialTrackEncoding).toBe(undefined);

  const encodingUpdatedEvent = createEncodingSwitchedEvent(endpointId, trackId, "m");

  webRTCEndpoint.getRemoteTracks()[trackId].on("encodingChanged", (context) => {
    // Then
    expect(context.encoding).toBe(encodingUpdatedEvent.data.data.encoding);
    done();
  });

  // When
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(encodingUpdatedEvent));
});
