import { WebRTCEndpoint } from "../../webRTCEndpoint";
import { createBandwidthEstimationEvent, endpointId, trackId } from "../fixtures";
import { setupRoomWith } from "../utils";

test("Change existing track bandwidth estimation", (done) => {
  // Given
  const webRTCEndpoint = new WebRTCEndpoint();

  setupRoomWith(webRTCEndpoint, endpointId, trackId);
  const bandwidthEstimationEvent = createBandwidthEstimationEvent();

  webRTCEndpoint.on("bandwidthEstimationChanged", (estimation) => {
    // Then
    expect(estimation).toBe(bandwidthEstimationEvent.data.data.estimation);
    done();
  });

  // When
  webRTCEndpoint.receiveMediaEvent(JSON.stringify(bandwidthEstimationEvent));
});
