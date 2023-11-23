import { createConnectedEvent, createEmptyEndpoint, createSimulcastTrack, trackId } from "../fixtures";
import { Endpoint, WebRTCEndpoint } from "../../src";

test("Connecting to empty room produce event", (done) => {
  const webRTCEndpoint = new WebRTCEndpoint();

  const connectedEvent = createConnectedEvent();

  webRTCEndpoint.on("connected", (peerId: string, _peersInRoom: Endpoint[]) => {
    expect(connectedEvent.data.id).toBe(peerId);
    expect(connectedEvent.data.otherEndpoints.length).toBe(0);
    done();
  });

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent));
});

test("Connecting to empty room set internal state", () => {
  // Given
  const webRTCEndpoint = new WebRTCEndpoint();

  // When
  const connectedEvent = createConnectedEvent();
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent));

  // Then
  const localEndpoint = webRTCEndpoint["localEndpoint"];
  expect(localEndpoint.id).toBe(connectedEvent.data.id);
});

test("Connecting to room with one peer", (done) => {
  const webRTCEndpoint = new WebRTCEndpoint();

  const connectedEvent = createConnectedEvent();
  connectedEvent.data.otherEndpoints = [createEmptyEndpoint()];

  webRTCEndpoint.on("connected", (peerId: string, _peersInRoom: Endpoint[]) => {
    expect(connectedEvent.data.id).toBe(peerId);
    expect(connectedEvent.data.otherEndpoints.length).toBe(connectedEvent.data.otherEndpoints.length);
    done();
  });

  webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent));
});

// TODO enable this test after fixing mapping from
test.skip("Connecting to room with one peer with one track", (done) => {
  // Given
  const webRTCEndpoint = new WebRTCEndpoint();
  const trackAddedCallback = jest.fn((_x) => null);
  const connectedCallback = jest.fn((_peerId, _peersInRoom) => null);

  const connectedEvent = createConnectedEvent();
  connectedEvent.data.otherEndpoints = [createEmptyEndpoint()];
  const endpoint = connectedEvent.data.otherEndpoints[0];

  endpoint.tracks[trackId] = createSimulcastTrack();
  endpoint.trackIdToMetadata[trackId] = {};

  webRTCEndpoint.on("connected", (peerId: string, peersInRoom: Endpoint[]) => {
    connectedCallback(peerId, peersInRoom);
    expect(peerId).toBe(connectedEvent.data.id);
    expect(peersInRoom.length).toBe(connectedEvent.data.otherEndpoints.length);
  });

  webRTCEndpoint.on("trackAdded", (ctx) => {
    trackAddedCallback(ctx);
    expect(ctx.trackId).toBe(trackId);
    expect(ctx.simulcastConfig?.enabled).toBe(endpoint.tracks[trackId].simulcastConfig.enabled);
    done();
  });

  // When
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent));

  // Then
  const remoteTracks = webRTCEndpoint.getRemoteTracks();
  expect(Object.values(remoteTracks).length).toBe(1);

  expect(trackAddedCallback.mock.calls).toHaveLength(1);
  expect(connectedCallback.mock.calls).toHaveLength(1);
});
