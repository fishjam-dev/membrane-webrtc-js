export const mockRTCPeerConnection = (): {
    addTransceiverCallback: jest.Mock<null, any[], any>
} => {
    const addTransceiverCallback: jest.Mock<null, any[], any> = jest.fn((trackOrKind, init) => null);

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
            },
            setRemoteDescription: async (description: RTCSessionDescriptionInit): Promise<void> => {
            }
        }
    })
    return { addTransceiverCallback };
};
