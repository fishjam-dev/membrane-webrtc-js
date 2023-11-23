import { mockRTCPeerConnection } from "../mocks";
import { WebRTCEndpoint } from "../../webRTCEndpoint";
import {
  createConnectedEvent,
  createConnectedEventWithOneEndpoint,
  createEndpointAdded,
  endpointId,
} from "../fixtures";

test("Add endpoint to empty state", () => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEvent()));

  // When
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createEndpointAdded(endpointId)));

  // Then
  const endpoints = webRTCEndpoint.getRemoteEndpoints();
  expect(Object.values(endpoints).length).toBe(1);
});

test("Add another endpoint", () => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()));

  // When
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createEndpointAdded(endpointId)));

  // Then
  const endpoints = webRTCEndpoint.getRemoteEndpoints();
  expect(Object.values(endpoints).length).toBe(2);
});

test("Add endpoint produces event", (done) => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()));

  const addEndpointEvent = createEndpointAdded(endpointId);

  webRTCEndpoint.on("endpointAdded", (endpoint) => {
    // Then
    expect(endpoint.id).toBe(addEndpointEvent.data.id);
    expect(endpoint.metadata).toBe(addEndpointEvent.data.metadata);
    done();
  });

  // When
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(addEndpointEvent));
});
