import { WebRTCEndpoint } from "../webRTCEndpoint";
import { createAddTrackMediaEvent, createConnectedEventWithOneEndpointWithOneTrack } from "./fixtures";

export const setupRoomWith = (webRTCEndpoint: WebRTCEndpoint, endpointId: string, trackId: string): void => {
  const connectedEvent = createConnectedEventWithOneEndpointWithOneTrack(endpointId, trackId);
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent));

  // Right now info about tracks from connectedEvent is ignored
  // We need to fix it but not in this commit
  // We need more tests (e2e) to introduce this change
  const addTrackEvent = createAddTrackMediaEvent(endpointId, trackId);
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(addTrackEvent));
};

// Fix proposal:
//
// "connected" handler
//
// const otherEndpoints: Endpoint[] = endpoints.map((endpoint) => {
//   const endpointTracks: [string, any][] = Object.entries(endpoint.tracks || {});
//   const tracks = this.mapMediaEventTracksToTrackContextImpl(endpointTracks, endpoint);
//   return { ...endpoint, tracks };
// });
//
// otherEndpoints.forEach((endpoint) => {
//   this.addEndpoint(endpoint);
// });
//
// "endpointAdded"
// this.addEndpoint({ ...endpoint, tracks: new Map() });
//
// remove todo if-else statement from addEndpoint function
