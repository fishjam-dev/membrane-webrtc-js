import {
  ClientSignallingMsg,
  ServerSignallingMsg,
} from "./proto/proto/webrtc_signalling_pb";

export function buildMediaEvent(type: string, payload: any) {
  return new ClientSignallingMsg({
    content: {
      // cast to any to avoid a type error
      // FIXME: correct the spec
      case: type as any,
      value: payload,
    },
  }).toBinary();
}

export function stringToBinary(text: string) {
  return new TextEncoder().encode(text);
}

export interface MediaEvent {
  type: string;
  data: any;
}

export function deserializeMediaEvent(
  serializedMediaEvent: string
): MediaEvent {
  return JSON.parse(serializedMediaEvent) as MediaEvent;
}
