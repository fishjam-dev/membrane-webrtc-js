import { WebRTCEndpoint } from "../../webRTCEndpoint";
import {
    createConnectedEventWithOneEndpoint,
} from "../fixtures";
import { FakeMediaStreamTrack } from "fake-mediastreamtrack";
import { deserializeMediaEvent } from "../../mediaEvent";
import { CustomOfferDataEvent, CustomSdpAnswerDataEvent } from "../schema";
import { mockRTCPeerConnection } from "../mocks";

const MediaStreamMock = jest.fn().mockImplementation(() => {
})

test('Connect to room and then add track, webrtc not connected -> negotiate', (done) => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()))

    const track = new FakeMediaStreamTrack({ kind: 'video' });
    webRTCEndpoint.on("sendMediaEvent", (mediaEvent) => {
        expect(mediaEvent).toContain("renegotiateTracks");
        const event = deserializeMediaEvent(mediaEvent)
        expect(event.type).toBe("custom");
        expect(event.data.type).toBe("renegotiateTracks");
        done()
    })

    // When
    webRTCEndpoint.addTrack(track, new MediaStreamMock())
});


const createOfferData = (): CustomOfferDataEvent => (
    {
        "data": {
            "data": {
                "integratedTurnServers": [
                    {
                        "password": "faLdfMkc0vore/OMLzfgny34L4E=",
                        "serverAddr": "192.168.83.225",
                        "serverPort": 50013,
                        "transport": "udp",
                        "username": "1699280274:9bf0cc85-c795-43b2-baf1-2c974cd770b9"
                    }
                ],
                "tracksTypes": {
                    "audio": 0,
                    "video": 0
                }
            },
            "type": "offerData"
        },
        "type": "custom"
    })

const createAnswerData = (trackId: string): CustomSdpAnswerDataEvent => (
    {
        "data": {
            "data": {
                "midToTrackId": {
                    "0": trackId
                },
                "sdp": "v=0\r\no=- 6210199330243869 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=extmap-allow-mixed\r\na=ice-lite\r\nm=video 9 UDP/TLS/RTP/SAVPF 106 107\r\nc=IN IP4 0.0.0.0\r\na=recvonly\r\na=ice-ufrag:EfYh\r\na=ice-pwd:8oxrjPbpT1yimEHM9DBLCP\r\na=ice-options:trickle\r\na=fingerprint:sha-256 71:64:F2:20:5F:C8:0B:FC:8A:F3:82:BA:C2:18:A1:83:CC:05:C6:6E:63:4A:68:70:19:93:39:0B:1A:4F:5F:A6\r\na=setup:passive\r\na=mid:0\r\na=msid:1e97413d-9e1a-430a-8886-2e5b54d5c536 c982f628-cd1b-4329-89f6-b034b2b4d2de\r\na=rtcp-mux\r\na=rtpmap:106 H264/90000\r\na=fmtp:106 profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1\r\na=rtpmap:107 rtx/90000\r\na=fmtp:107 apt=106\r\na=extmap:4 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=rtcp-fb:106 transport-cc\r\na=extmap:9 urn:ietf:params:rtp-hdrext:sdes:mid\r\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\r\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\r\na=rtcp-fb:106 ccm fir\r\na=rtcp-fb:106 nack\r\na=rtcp-fb:106 nack pli\r\na=rtcp-rsize\r\n",
                "type": "answer"
            },
            "type": "sdpAnswer"
        },
        "type": "custom"
    }
)

test('Connect to room and then add track, webrtc not connected -> negotiate', (done) => {
    // Given
    mockRTCPeerConnection();
    const webRTCEndpoint = new WebRTCEndpoint()

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(createConnectedEventWithOneEndpoint()))

    const track = new FakeMediaStreamTrack({ kind: 'video' });

    webRTCEndpoint.on("sendMediaEvent", (mediaEvent) => {
        // expect(mediaEvent).toContain("renegotiateTracks");
        //
        // webRTCEndpoint.receiveMediaEvent(JSON.stringify(createOfferData()))
        // webRTCEndpoint.receiveMediaEvent(JSON.stringify(createAnswerData("9bf0cc85-c795-43b2-baf1-2c974cd770b9:1b6d99d1-3630-4e01-b386-15cbbfe5a41f")))
        done();
    })

    // When
    webRTCEndpoint.addTrack(track, new MediaStreamMock())

    const localTrackIdToTrack = webRTCEndpoint["localTrackIdToTrack"]

    // this tracks will be added after renegotiation
    expect(localTrackIdToTrack.size).toBe(1)

    const localEndpoint = webRTCEndpoint["localEndpoint"]
    expect(localEndpoint.tracks.size).toBe(1)
});
