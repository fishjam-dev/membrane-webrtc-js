import { WebRTCEndpoint } from "../webRTCEndpoint";
import { createConnectedEvent, createEmptyEndpoint, createSimulcastTrack } from "./fixtures";
import { CustomOfferDataEvent, TracksAddedMediaEvent } from "./schema";
import { deserializeMediaEvent } from "../mediaEvent";

test('Connecting to room with one peer then tracks added event occurred', () => {
    // Given
    const webRTCEndpoint = new WebRTCEndpoint()
    const trackAddedCallback = jest.fn(x => null);

    const connectedEvent = createConnectedEvent()
    connectedEvent.data.otherEndpoints = [
        createEmptyEndpoint()
    ]

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent))

    const trackId = "trackId"

    const trackAddedEvent: TracksAddedMediaEvent = {
        type: "tracksAdded",
        data: {
            endpointId: connectedEvent.data.otherEndpoints[0].id,
            tracks: {
                [trackId]: createSimulcastTrack()
            },
            trackIdToMetadata: {
                [trackId]: {}
            }
        }
    }

    webRTCEndpoint.on("trackAdded", (ctx) => {
        trackAddedCallback(ctx)
        expect(ctx.trackId).toBe(trackId)
        expect(ctx.endpoint.id).toBe(trackAddedEvent.data.endpointId)
        expect(ctx.simulcastConfig?.enabled).toBe(trackAddedEvent.data.tracks[trackId].simulcastConfig.enabled)
    })

    // When
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(trackAddedEvent))

    // Then
    const remoteTracks = webRTCEndpoint.getRemoteTracks()
    expect(Object.values(remoteTracks).length).toBe(1)

    expect(trackAddedCallback.mock.calls).toHaveLength(1);
});


test('tracksAdded -> handle offerData with one video track from server', (done) => {
    // Given
    const addTransceiverCallback = jest.fn((trackOrKind, init) => null);

    (global as any).RTCPeerConnection = jest.fn().mockImplementation(() => {
        const transceivers: RTCRtpTransceiver[] = []

        return {
            getTransceivers: () => {
                return transceivers
            },
            addTransceiver: (trackOrKind: MediaStreamTrack | string, init?: RTCRtpTransceiverInit): RTCRtpTransceiver => {
                addTransceiverCallback(trackOrKind, init)
                // maybe move to callback declaration
                const transceiver: RTCRtpTransceiver = {
                    currentDirection: null,
                    direction: init?.direction ?? "inactive",
                    mid: null,
                    receiver: {} as RTCRtpReceiver,
                    sender: {} as RTCRtpSender,
                    setCodecPreferences: (codecs: RTCRtpCodecCapability[]) => {
                    },
                    stop: () => {
                    },
                }
                transceivers.push(transceiver)

                return transceiver
            },
            createOffer: async (options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit> => {
                return {
                    sdp: "",
                    type: "offer",
                }
            },
            setLocalDescription: async (description?: RTCLocalSessionDescriptionInit): Promise<void> => {
            }
        }
    });

    const webRTCEndpoint = new WebRTCEndpoint()

    const connectedEvent = createConnectedEvent()
    connectedEvent.data.otherEndpoints = [
        createEmptyEndpoint()
    ]

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(connectedEvent))

    const trackId = "trackId"

    const trackAddedEvent: TracksAddedMediaEvent = {
        type: "tracksAdded",
        data: {
            endpointId: connectedEvent.data.otherEndpoints[0].id,
            tracks: {
                [trackId]: createSimulcastTrack()
            },
            trackIdToMetadata: {
                [trackId]: {}
            }
        }
    }

    webRTCEndpoint.receiveMediaEvent(JSON.stringify(trackAddedEvent))


    const offerData: CustomOfferDataEvent = {
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

    webRTCEndpoint.on("sendMediaEvent", (mediaEvent) => {
        expect(mediaEvent).toContain("sdpOffer");
        const event = deserializeMediaEvent(mediaEvent)
        expect(event.type).toBe("custom");
        expect(event.data.type).toBe("sdpOffer");
        done()
    })

    // When
    webRTCEndpoint.receiveMediaEvent(JSON.stringify(offerData))

    // Then
    const rtcConfig = webRTCEndpoint["rtcConfig"]

    expect(rtcConfig.iceServers?.length).toBe(1);


    // 2. if there is no connection: Setup callbacks
    //    else restartIce
    //
    // this.connection = new RTCPeerConnection(this.rtcConfig);
    //       this.connection.onicecandidate = this.onLocalCandidate();
    //       this.connection.onicecandidateerror = this.onIceCandidateError as (
    //         event: Event
    //       ) => void;
    //       this.connection.onconnectionstatechange = this.onConnectionStateChange;
    //       this.connection.oniceconnectionstatechange =
    //         this.onIceConnectionStateChange;
    //
    // 3. Add track to RTCPeerConnection for every track in localTrackIdToTrack as "sendonly"

    expect(addTransceiverCallback.mock.calls).toHaveLength(1);
    expect(addTransceiverCallback.mock.calls[0][0]).toBe("video");

    const transceivers = webRTCEndpoint["connection"]?.getTransceivers()

    expect(transceivers?.length).toBe(1);
    expect(transceivers?.[0].direction).toBe("recvonly");


    // private addTrackToConnection = (trackContext: TrackContext) => {
    //     let transceiverConfig = this.createTransceiverConfig(trackContext);
    //     const track = trackContext.track!!;
    //     this.connection!.addTransceiver(track, transceiverConfig);
    //   };

})
