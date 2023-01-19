import {
  ClientSignallingMsg,
  ServerSignallingMsg,
} from "./protos/membrane_rtc_engine/webrtc/signalling_pb";

export function buildMediaEvent(type: string, payload: any) {
  const event = new ClientSignallingMsg({
    content: {
      case: type as any,
      value: payload,
    },
  });

  console.log(event);

  return event.toBinary();
}

export function stringToBinary(text: string) {
  return new TextEncoder().encode(text);
}

export function binaryToString(binary: Uint8Array) {
  return new TextDecoder().decode(binary);
}

export interface MediaEvent {
  type: string;
  data: any;
}

export function deserializeMediaEvent(
  serializedMediaEvent: Uint8Array
): ServerSignallingMsg {
  return ServerSignallingMsg.fromBinary(serializedMediaEvent)
}
