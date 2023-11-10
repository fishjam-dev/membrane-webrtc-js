import {
    ConnectedMediaEvent, ConnectedMediaEventSchema,
    CustomOfferDataEvent, CustomOfferDataEventSchema,
    CustomSdpAnswerDataEvent, CustomSdpAnswerDataEventSchema,
    Endpoint, EndpointSchema, EndpointUpdatedWebrtcEvent, EndpointUpdatedWebrtcEventSchema,
    Track,
    TracksAddedMediaEvent, TracksAddedMediaEventSchema
} from "./schema";

export const createSimulcastTrack = (): Track => ({
    metadata: {},
    simulcastConfig: {
        enabled: true,
        activeEncodings: ["h", "m", "l"]
    }
})

export const createEmptyEndpoint = (endpointId?: string): Endpoint => EndpointSchema.parse({
    id: endpointId ?? '210fdb82-80d2-4868-8c31-a45f54f6e3c9',
    metadata: null,
    trackIdToMetadata: {},
    tracks: {},
    type: 'webrtc'
})

export const createConnectedEvent = (): ConnectedMediaEvent => ConnectedMediaEventSchema.parse({
    type: "connected",
    data: {
        id: '7b789673-8600-4c8b-8f45-476b86cb820d', // peerId
        otherEndpoints: []
    }
})


// --- TODO REMOVE

// this one is on the different layer. This event is from Jellyfish.
// It indicates that socket is open and is ready to authenticate
const AUTH_SUCCESS = {
    "data": {
        "authRequest": undefined,
        "authenticated": {},
        "mediaEvent": undefined,
    }
}

// we are interested only in mediaEvent field

const second_event = {
    "data": {
        "mediaEvent": {
            "data": "{\"data\":{\"id\":\"7b789673-8600-4c8b-8f45-476b86cb820d\",\"otherEndpoints\":[{\"id\":\"210fdb82-80d2-4868-8c31-a45f54f6e3c9\",\"metadata\":{\"name\":\"210fdb82-80d2-4868-8c31-a45f54f6e3c9\"},\"trackIdToMetadata\":{},\"tracks\":{},\"type\":\"webrtc\"}]},\"type\":\"connected\"}"
        }
    }
}

const connectedExample = {
    data: {
        id: '7b789673-8600-4c8b-8f45-476b86cb820d',
        otherEndpoints: [
            {
                id: '210fdb82-80d2-4868-8c31-a45f54f6e3c9',
                metadata: { name: '210fdb82-80d2-4868-8c31-a45f54f6e3c9' },
                trackIdToMetadata: {},
                tracks: {},
                type: 'webrtc'
            }
        ]
    },
    type: 'connected'
}


const offerDataEventExample = {
    "data": {
        "data": {
            "integratedTurnServers": [
                {
                    "password": "E9ck/2hJCkkuVSmPfFrNg2l1+JA=",
                    "serverAddr": "192.168.1.95",
                    "serverPort": 50018,
                    "transport": "udp",
                    "username": "1698997572:dedfa04f-b30a-433a-86d5-03336a828caa"
                }
            ],
            "tracksTypes": {
                "audio": 0,
                "video": 1
            }
        },
        "type": "offerData"
    },
    "type": "custom"
}

export const createConnectedEventWithOneEndpoint = (endpointId?: string): ConnectedMediaEvent => {
    const connectedEvent = createConnectedEvent()
    connectedEvent.data.otherEndpoints = [
        createEmptyEndpoint(endpointId)
    ]
    return ConnectedMediaEventSchema.parse(connectedEvent);
};

export const createAddTrackMediaEvent = (trackId: string, endpointId: string): TracksAddedMediaEvent => TracksAddedMediaEventSchema.parse({
    type: "tracksAdded",
    data: {
        endpointId: endpointId,
        tracks: {
            [trackId]: createSimulcastTrack()
        },
        trackIdToMetadata: {
            [trackId]: {}
        }
    }
});

export const createCustomOfferDataEventWithOneVideoTrack = (): CustomOfferDataEvent => CustomOfferDataEventSchema.parse({
    "data": {
        "data": {
            "integratedTurnServers": [
                {
                    "password": "E9ck/2hJCkkuVSmPfFrNg2l1+JA=",
                    "serverAddr": "192.168.1.95",
                    "serverPort": 50018,
                    "transport": "udp",
                    "username": "1698997572:dedfa04f-b30a-433a-86d5-03336a828caa"
                }
            ],
            "tracksTypes": {
                "audio": 0,
                "video": 1
            }
        },
        "type": "offerData"
    },
    "type": "custom"
});

export const createAnswerData = (trackId: string): CustomSdpAnswerDataEvent =>
    CustomSdpAnswerDataEventSchema.parse({
        "data": {
            "data": {
                "midToTrackId": {
                    "0": "9afe80ce-1964-4958-a386-d7a9e3097ca7:5c74b6b3-cb72-49f1-a76b-0df4895a3d32"
                },
                "sdp": `v=0\r
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
                "type": "answer"
            },
            "type": "sdpAnswer"
        },
        "type": "custom"
    })


export const createEndpointUpdated = (endpointId: string, metadata: any): EndpointUpdatedWebrtcEvent => EndpointUpdatedWebrtcEventSchema.parse(
    {
        "data": {
            "id": endpointId,
            "metadata": metadata
        },
        "type": "endpointUpdated"
    }
)
