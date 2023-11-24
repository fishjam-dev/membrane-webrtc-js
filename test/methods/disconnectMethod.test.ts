import { WebRTCEndpoint } from "../../src";
import { endpointId, trackId } from "../fixtures";
import { setupRoomWithMocks } from "../utils";
import { deserializeMediaEvent } from "../../src/mediaEvent";

test("Disconnect sets connection to undefined", async () => {
  // Given
  const webRTCEndpoint = new WebRTCEndpoint();

  await setupRoomWithMocks(webRTCEndpoint, endpointId, trackId);

  // When
  webRTCEndpoint.disconnect();

  // Then
  const connection = webRTCEndpoint["connection"];
  expect(connection).toBe(undefined);
});

test("Disconnect invokes disconnected event", (done) => {
  (async () => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint();

    await setupRoomWithMocks(webRTCEndpoint, endpointId, trackId);

    webRTCEndpoint.on("sendMediaEvent", (mediaEvent) => {
      const event = deserializeMediaEvent(mediaEvent);
      expect(event.type).toBe("disconnect");
      done()
    });

    // When
    webRTCEndpoint.disconnect();
  })();
});
