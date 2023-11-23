export const mockRTCPeerConnection = (): {
  addTransceiverCallback: jest.Mock<null, any[], any>;
} => {
  const addTransceiverCallback: jest.Mock<null, any[], any> = jest.fn((_trackOrKind, _init) => null);

  (global as any).RTCPeerConnection = jest.fn().mockImplementation(() => {
    const transceivers: RTCRtpTransceiver[] = [];
    const senders: RTCRtpSender[] = [];

    return {
      getTransceivers: () => {
        return transceivers;
      },
      addTransceiver: (trackOrKind: MediaStreamTrack | string, init?: RTCRtpTransceiverInit): RTCRtpTransceiver => {
        addTransceiverCallback(trackOrKind, init);

        const sender: any = {};
        sender.getParameters = () => {
          const encodings: RTCRtpEncodingParameters[] = [{}];
          return { encodings: encodings } as RTCRtpSendParameters;
        };

        if (typeof trackOrKind !== "string") {
          sender.track = trackOrKind;
        }

        senders.push(sender);

        // maybe move to callback declaration
        const transceiver: RTCRtpTransceiver = {
          currentDirection: null,
          direction: init?.direction ?? "inactive",
          mid: null,
          receiver: {} as RTCRtpReceiver,
          sender: sender,
          setCodecPreferences: (_codecs: RTCRtpCodecCapability[]) => {},
          stop: () => {},
        };
        transceivers.push(transceiver);

        return transceiver;
      },
      createOffer: async (_options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit> => {
        return {
          sdp: "",
          type: "offer",
        };
      },
      setLocalDescription: async (_description?: RTCLocalSessionDescriptionInit): Promise<void> => {},
      setRemoteDescription: async (_description: RTCSessionDescriptionInit): Promise<void> => {},
      getSenders: (): RTCRtpSender[] => {
        return senders;
      },
    };
  });
  return { addTransceiverCallback };
};
