import { mockRTCPeerConnection } from "../mocks";
import { WebRTCEndpoint } from "../../webRTCEndpoint";
import {
  createConnectedEvent,
  createConnectedEventWithOneEndpoint,
  createEndpointAdded, createEndpointRemoved,
  endpointId, notExistingEndpointId, trackId,
} from "../fixtures";
import { setupRoom } from "../utils";

test("Remove endpoint that not exists", () => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint(endpointId)));

  // When
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createEndpointRemoved(notExistingEndpointId)));

  // Then
  const endpoints = webRTCEndpoint.getRemoteEndpoints();
  expect(Object.values(endpoints).length).toBe(1);
});

test("Remove existing endpoint should remove it from remote endpoints", () => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint(endpointId)));

  // When
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createEndpointRemoved(endpointId)));

  // Then
  const endpoints = webRTCEndpoint.getRemoteEndpoints();
  expect(Object.values(endpoints).length).toBe(0);
});

test("Remove existing endpoint should remove all tracks", () => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  setupRoom(webRTCEndpoint, endpointId, trackId);

  const addEndpointEvent = createEndpointRemoved(endpointId);

  // When
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(addEndpointEvent));

  // Then
  const tracks = webRTCEndpoint.getRemoteTracks()
  expect(Object.values(tracks).length).toBe(0);
});

test("Remove existing endpoint should emit trackRemoved event", (done) => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  setupRoom(webRTCEndpoint, endpointId, trackId);

  webRTCEndpoint.on("trackRemoved", (trackContext) => {
    // Then
    expect(trackContext.trackId).toBe(trackId);
    done()
  })

  // When
  const addEndpointEvent = createEndpointRemoved(endpointId);
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(addEndpointEvent));
});
