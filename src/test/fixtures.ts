import {
  ConnectedMediaEvent,
  ConnectedMediaEventSchema,
  CustomEncodingUpdatedEvent,
  CustomEncodingSwitchedEventSchema,
  CustomOfferDataEvent,
  CustomOfferDataEventSchema,
  CustomSdpAnswerDataEvent,
  CustomSdpAnswerDataEventSchema,
  Endpoint,
  EndpointSchema,
  EndpointUpdatedWebrtcEvent,
  EndpointUpdatedWebrtcEventSchema,
  Track,
  TracksAddedMediaEvent,
  TracksAddedMediaEventSchema,
  CustomBandwidthEstimationEventSchema,
  CustomBandwidthEstimationEvent,
  CustomVadNotificationEvent,
  CustomVadNotificationEventSchema,
  TrackUpdatedEvent,
  TrackUpdatedEventSchema,
  EndpointAddedWebrtcEvent,
  EndpointAddedWebrtcEventSchema,
} from "./schema";
import { TrackEncoding, VadStatus } from "../webRTCEndpoint";
import { FakeMediaStreamTrack } from "fake-mediastreamtrack";

export const endpointId = "exampleEndpointId";
export const notExistingEndpointId = "notExistingEndpointId";

export const trackId = "exampleTrackId";
export const notExistingTrackId = "notExistingTrackId";

export const track = new FakeMediaStreamTrack({ kind: "video" });
const MediaStreamMock = jest.fn().mockImplementation(() => {});
export const stream = new MediaStreamMock();

export const createSimulcastTrack = (): Track => ({
  metadata: {},
  simulcastConfig: {
    enabled: true,
    activeEncodings: ["h", "m", "l"],
  },
});

export const createEmptyEndpoint = (endpointId?: string): Endpoint =>
  EndpointSchema.parse({
    id: endpointId ?? "210fdb82-80d2-4868-8c31-a45f54f6e3c9",
    metadata: null,
    trackIdToMetadata: {},
    tracks: {},
    type: "webrtc",
  });

export const createConnectedEvent = (localEndpointId?: string): ConnectedMediaEvent => {
  const id = localEndpointId ?? "7b789673-8600-4c8b-8f45-476b86cb820d";

  return ConnectedMediaEventSchema.parse({
    type: "connected",
    data: {
      id: id, // peerId
      otherEndpoints: [],
    },
  });
};

export const createEncodingSwitchedEvent = (
  endpointId: string,
  trackId: string,
  encoding: TrackEncoding,
): CustomEncodingUpdatedEvent =>
  CustomEncodingSwitchedEventSchema.parse({
    data: {
      data: {
        encoding: encoding,
        endpointId: endpointId,
        reason: "other",
        trackId: trackId,
      },
      type: "encodingSwitched",
    },
    type: "custom",
  });

export const createBandwidthEstimationEvent = (): CustomBandwidthEstimationEvent =>
  CustomBandwidthEstimationEventSchema.parse({
    data: {
      data: {
        estimation: 261506.7264961106,
      },
      type: "bandwidthEstimation",
    },
    type: "custom",
  });

export const createCustomVadNotificationEvent = (trackId: string, vadStatus: VadStatus): CustomVadNotificationEvent =>
  CustomVadNotificationEventSchema.parse({
    data: {
      data: {
        status: vadStatus,
        trackId: trackId,
      },
      type: "vadNotification",
    },
    type: "custom",
  });

export const createTrackUpdatedEvent = (trackId: string, endpointId: string, metadata: unknown): TrackUpdatedEvent =>
  TrackUpdatedEventSchema.parse({
    data: {
      endpointId: endpointId,
      metadata: metadata,
      trackId: trackId,
    },
    type: "trackUpdated",
  });

export const createEndpointAdded = (endpointId: string): EndpointAddedWebrtcEvent =>
  EndpointAddedWebrtcEventSchema.parse({
    data: {
      id: endpointId,
      metadata: undefined,
      type: "webrtc",
    },
    type: "endpointAdded",
  });

export const createConnectedEventWithOneEndpoint = (endpointId?: string): ConnectedMediaEvent => {
  const connectedEvent = createConnectedEvent();
  connectedEvent.data.otherEndpoints = [createEmptyEndpoint(endpointId)];
  return ConnectedMediaEventSchema.parse(connectedEvent);
};

export const createConnectedEventWithOneEndpointWithOneTrack = (
  remoteEndpointId: string,
  trackId: string,
  localEndpointId?: string,
): ConnectedMediaEvent => {
  const connectedEvent = createConnectedEvent(localEndpointId);
  connectedEvent.data.otherEndpoints = [createEmptyEndpoint(remoteEndpointId)];

  const endpoint = connectedEvent.data.otherEndpoints[0];

  endpoint.tracks[trackId] = createSimulcastTrack();
  endpoint.trackIdToMetadata[trackId] = {};

  return ConnectedMediaEventSchema.parse(connectedEvent);
};

export const createAddTrackMediaEvent = (trackId: string, endpointId: string): TracksAddedMediaEvent =>
  TracksAddedMediaEventSchema.parse({
    type: "tracksAdded",
    data: {
      endpointId: endpointId,
      tracks: {
        [trackId]: createSimulcastTrack(),
      },
      trackIdToMetadata: {
        [trackId]: {},
      },
    },
  });

export const createCustomOfferDataEventWithOneVideoTrack = (): CustomOfferDataEvent =>
  CustomOfferDataEventSchema.parse({
    data: {
      data: {
        integratedTurnServers: [
          {
            password: "E9ck/2hJCkkuVSmPfFrNg2l1+JA=",
            serverAddr: "192.168.1.95",
            serverPort: 50018,
            transport: "udp",
            username: "1698997572:dedfa04f-b30a-433a-86d5-03336a828caa",
          },
        ],
        tracksTypes: {
          audio: 0,
          video: 1,
        },
      },
      type: "offerData",
    },
    type: "custom",
  });

export const createAnswerData = (trackId: string): CustomSdpAnswerDataEvent =>
  CustomSdpAnswerDataEventSchema.parse({
    data: {
      data: {
        midToTrackId: {
          "0": "9afe80ce-1964-4958-a386-d7a9e3097ca7:5c74b6b3-cb72-49f1-a76b-0df4895a3d32",
        },
        sdp: `v=0\r
o=- 39483584182226872 0 IN IP4 127.0.0.1\r
s=-\r
t=0 0\r
a=group:BUNDLE 0\r
a=extmap-allow-mixed\r
a=ice-lite\r
m=video 9 UDP/TLS/RTP/SAVPF 102 103\r
c=IN IP4 0.0.0.0\r
a=sendonly\r
a=ice-ufrag:fXa4\r
a=ice-pwd:mC2wFgKGsN3cXnxadEhVaa\r
a=ice-options:trickle\r
a=fingerprint:sha-256 50:65:CB:9F:2B:B5:62:7F:20:59:79:C6:7B:49:D8:DF:C2:B5:59:1F:E2:7D:68:F8:C3:07:73:8B:16:70:FB:DD\r
a=setup:passive\r
a=mid:0\r
a=msid:60ff1fb2-6868-42be-8c92-311733034415 ea1339b9-54ce-445b-9cff-2568f9ac504b\r
a=rtcp-mux\r
a=rtpmap:102 H264/90000\r
a=fmtp:102 profile-level-id=42001f;level-asymmetry-allowed=1;packetization-mode=1\r
a=rtpmap:103 rtx/90000\r
a=fmtp:103 apt=102\r
a=extmap:4 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r
a=rtcp-fb:102 transport-cc\r
a=extmap:9 urn:ietf:params:rtp-hdrext:sdes:mid\r
a=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r
a=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r
a=rtcp-fb:102 ccm fir\r
a=rtcp-fb:102 nack\r
a=rtcp-fb:102 nack pli\r
a=rtcp-rsize\r
a=ssrc:663086196 cname:${trackId}-video-60ff1fb2-6868-42be-8c92-311733034415\r
`,
        type: "answer",
      },
      type: "sdpAnswer",
    },
    type: "custom",
  });

export const createEndpointUpdated = (endpointId: string, metadata: any): EndpointUpdatedWebrtcEvent =>
  EndpointUpdatedWebrtcEventSchema.parse({
    data: {
      id: endpointId,
      metadata: metadata,
    },
    type: "endpointUpdated",
  });
