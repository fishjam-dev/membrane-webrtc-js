import { WebRTCEndpoint } from "../src";
import { createConnectedEventWithOneEndpoint, stream, mockTrack } from "./fixtures";
import { deserializeMediaEvent } from "../src/mediaEvent";
import { expect, it } from "vitest";

it("RC", () =>
  new Promise((done) => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint();

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()));

    webRTCEndpoint.on("sendMediaEvent", (mediaEvent) => {
      // Then
      expect(mediaEvent).toContain("renegotiateTracks");
      const event = deserializeMediaEvent(mediaEvent);
      expect(event.type).toBe("custom");
      expect(event.data.type).toBe("renegotiateTracks");
      done("");

      // now it's time to create offer and answer
      // webRTCEndpoint.receiveMediaEvent(JSON.stringify(createOfferData()))
      // webRTCEndpoint.receiveMediaEvent(JSON.stringify(createAnswerData("9bf0cc85-c795-43b2-baf1-2c974cd770b9:1b6d99d1-3630-4e01-b386-15cbbfe5a41f")))
    });

    // When
    webRTCEndpoint.addTrack(mockTrack, stream);
  }));
