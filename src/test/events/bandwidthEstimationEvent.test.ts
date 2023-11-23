import { WebRTCEndpoint } from "../../webRTCEndpoint";
import {
  createBandwidthEstimationEvent,
  createConnectedEventWithOneEndpointWithOneTrack,
  endpointId,
  trackId,
} from "../fixtures";

test("Change existing track bandwidth estimation", (done) => {
  // Given
  const webRTCEndpoint = new WebRTCEndpoint();

  webRTCEndpoint.receiveMediaEvent(
    JSON.stringify(createConnectedEventWithOneEndpointWithOneTrack(endpointId, trackId)),
  );
  const bandwidthEstimationEvent = createBandwidthEstimationEvent();

  webRTCEndpoint.on("bandwidthEstimationChanged", (estimation) => {
    // Then
    expect(estimation).toBe(bandwidthEstimationEvent.data.data.estimation);
    done();
  });

  // When
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(bandwidthEstimationEvent));
});
