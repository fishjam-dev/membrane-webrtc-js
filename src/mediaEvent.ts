import {MediaEvent} from "./protocol/common";
import { WebRtcCustomMediaEvent } from "./protocol/custom";
import {Any} from "./protocol/google/protobuf/any";

export type SerializedMediaEvent = Uint8Array;

export function serializeMediaEvent(
  mediaEvent: MediaEvent
): SerializedMediaEvent {
  return MediaEvent.toBinary(mediaEvent);
}

export function deserializeMediaEvent( bytes: Uint8Array): [string, object] {
  let media_event = MediaEvent.fromBinary(bytes).event;
  let key = media_event.oneofKind!;
  let obj = Object.entries(media_event).find(([k, _]) => k == key)!;

  console.log([key, obj]);

  return [key, obj];
}

export function deserializeCustomMediaEvent(binary: Uint8Array): WebRtcCustomMediaEvent {
  let event: MediaEvent = MediaEvent.fromBinary(binary);
  
  if(event.event.oneofKind !== "custom") {
    throw "Attempted to parse non-custom mediaEvent as customMediaEvent"
  } else if (!Any.contains(event.event.custom, WebRtcCustomMediaEvent)) {
    throw "Attempted to parse unknown custom mediaEvent";
  }

  return Any.unpack(event.event.custom, WebRtcCustomMediaEvent);
}

export function generateCustomMediaEvent(me: WebRtcCustomMediaEvent): Uint8Array {
  let event = <MediaEvent>{
    event: {
      custom: Any.pack(me, WebRtcCustomMediaEvent)
    }
  };

  return MediaEvent.toBinary(event);
}

