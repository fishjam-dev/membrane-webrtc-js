import { ConnectedMediaEvent, Endpoint, Track } from "./schema";

export const createSimulcastTrack = (): Track => ({
    metadata: {},
    simulcastConfig: {
        enabled: true,
        activeEncodings: ["h", "m", "l"]
    }
})

export const createEmptyEndpoint = (): Endpoint => ({
    id: '210fdb82-80d2-4868-8c31-a45f54f6e3c9',
    // todo undefined metadata?
    metadata: { name: '210fdb82-80d2-4868-8c31-a45f54f6e3c9' },
    trackIdToMetadata: {},
    tracks: {},
    type: 'webrtc'
})

export const createConnectedEvent = (): ConnectedMediaEvent => ({
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

const theSameEventAsAbove = {
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
