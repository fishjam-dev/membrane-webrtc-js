import { WebRTCEndpoint } from "../../webRTCEndpoint";
import {
  createConnectedEventWithOneEndpointWithOneTrack,
  createTrackUpdatedEvent,
  endpointId,
  notExistingEndpointId,
  trackId,
} from "../fixtures";

test(`Updating existing track emits events`, (done) => {
  // Given
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(
    JSON.stringify(createConnectedEventWithOneEndpointWithOneTrack(endpointId, trackId)),
  );

  webRTCEndpoint.on("trackUpdated", (context) => {
    // Then
    expect(context.metadata).toMatchObject(metadata);
    done();
  });

  const metadata = {
    name: "New name",
  };

  // When
  const trackUpdated = createTrackUpdatedEvent(trackId, endpointId, metadata);
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(trackUpdated));
});

test(`Updating existing track changes track metadata`, () => {
  // Given
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(
    JSON.stringify(createConnectedEventWithOneEndpointWithOneTrack(endpointId, trackId)),
  );

  const metadata = {
    name: "New name",
  };

  // When
  const trackUpdated = createTrackUpdatedEvent(trackId, endpointId, metadata);
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(trackUpdated));

  // Then
  const track = webRTCEndpoint.getRemoteTracks()[trackId];
  expect(track.metadata).toMatchObject(metadata);
});

test(`Webrtc endpoint skips updating local endpoint metadata`, () => {
  // Given
  const webRTCEndpoint = new WebRTCEndpoint();

  const localEndpointId = "localEndpointId";

  const value = createConnectedEventWithOneEndpointWithOneTrack(endpointId, trackId, localEndpointId);
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(value));

  const metadata = {
    name: "New name",
  };

  // When
  const trackUpdated = createTrackUpdatedEvent(trackId, localEndpointId, metadata);
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(trackUpdated));

  // Then
  const track = webRTCEndpoint.getRemoteTracks()[trackId];
  // todo How should empty metadata be handled?
  //  - empty object {}
  //  - null
  //  - undefined
  // expect(track.metadata).toBe(value.data.otherEndpoints[0].metadata as any)
  expect(track.metadata).toMatchObject({});
});

test(`Updating track with invalid endpoint id throws error`, () => {
  // Given
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(
    JSON.stringify(createConnectedEventWithOneEndpointWithOneTrack(endpointId, trackId)),
  );

  const metadata = {
    name: "New name",
  };

  expect(() => {
    // When
    const trackUpdated = createTrackUpdatedEvent(trackId, notExistingEndpointId, metadata);
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(trackUpdated));

    // Then
  }).toThrow(`Endpoint with id: ${notExistingEndpointId} doesn't exist`);
});
