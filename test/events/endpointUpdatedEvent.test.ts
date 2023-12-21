import { mockRTCPeerConnection } from "../mocks";
import { WebRTCEndpoint } from "../../src";
import {
  createConnectedEvent,
  createConnectedEventWithOneEndpoint,
  createEndpointUpdated,
  endpointId,
  notExistingEndpointId,
} from "../fixtures";
import { expect, it } from "vitest";

it("Update existing endpoint metadata", () => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  const connectedMediaEvent = createConnectedEventWithOneEndpoint(endpointId);
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedMediaEvent));

  // When
  const metadata = {
    newField: "new field value",
  };

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createEndpointUpdated(endpointId, metadata)));

  // Then
  const endpoint = webRTCEndpoint.getRemoteEndpoints()[endpointId];
  expect(endpoint.metadata).toMatchObject(metadata);
});

it("Update existing endpoint produce event", () =>
  new Promise((done) => {
    // Given
    mockRTCPeerConnection();
    const webRTCEndpoint = new WebRTCEndpoint();

    const connectedMediaEvent = createConnectedEventWithOneEndpoint(endpointId);
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedMediaEvent));

    const metadata = {
      newField: "new field value",
    };

    webRTCEndpoint.on("endpointUpdated", (endpoint) => {
      // Then
      expect(endpoint.metadata).toMatchObject(metadata);
      done("");
    });

    // When
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createEndpointUpdated(endpointId, metadata)));
  }));

it("Update existing endpoint with undefined metadata", () => {
  // Given
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  const connectedMediaEvent = createConnectedEventWithOneEndpoint(endpointId);
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedMediaEvent));

  // When
  const metadata = undefined;
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createEndpointUpdated(endpointId, metadata)));

  // Then
  const endpoint = webRTCEndpoint.getRemoteEndpoints()[endpointId];
  expect(endpoint.metadata).toBe(undefined);
});

it("Update endpoint that not exist", () => {
  // Givenk
  mockRTCPeerConnection();
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEvent()));

  // When
  const metadata = {
    newField: "new field value",
  };

  expect(() => {
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createEndpointUpdated(notExistingEndpointId, metadata)));
    // todo change this error in production code
  }).toThrow("Cannot set properties of undefined (setting 'metadata')");
});
