import { VideoPlayer } from "./VideoPlayer.tsx";
import { useRef, useState } from "react";
import { WebRTCEndpoint } from "@jellyfish-dev/membrane-webrtc-js";

export const VIDEO_TRACK_CONSTRAINTS: MediaTrackConstraints = {
  width: {
    max: 1280,
    ideal: 1280,
    min: 640,
  },
  height: {
    max: 720,
    ideal: 720,
    min: 320,
  },
  frameRate: {
    max: 30,
    ideal: 24,
  },
};

type Props = {
  webrtc: WebRTCEndpoint;
};

const createDummyStream = (
  width: number = 1280,
  height: number = 720,
): {
  stream: MediaStream;
  track: MediaStreamTrack;
} => {
  const canvas = document.createElement("canvas");
  canvas.height = height;
  canvas.width = width;
  const context = canvas.getContext("2d");

  if (!context) throw Error("Canvas context is null");

  context.fillRect(0, 0, width, height);

  const stream = canvas.captureStream();

  const track = stream.getVideoTracks()[0];

  if (!track) throw Error("Canvas track is null");

  track.enabled = false;

  return { stream, track };
};

export const ReplaceTrackWithDummyStream = ({ webrtc }: Props) => {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoStreamIdRef = useRef<string | null>(null);

  const startCamera = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_TRACK_CONSTRAINTS, audio: false });
    setVideoStream(mediaStream);
  };

  const stopCamera = () => {
    videoStream?.getTracks().forEach((track) => {
      track.stop();
    });
  };

  const addCameraTrack = () => {
    if (!videoStream) throw Error("Video stream is null");
    const track = videoStream.getVideoTracks()[0];

    videoStreamIdRef.current = webrtc.addTrack(track, videoStream);
  };

  const removeCameraTrack = () => {
    if (!videoStreamIdRef.current) throw Error("Track id is null");

    webrtc.removeTrack(videoStreamIdRef.current);
  };

  const replaceWithDummyStream = () => {
    if (!videoStreamIdRef.current) throw Error("Track id is null");

    const { stream, track } = createDummyStream();
    webrtc.replaceTrack(videoStreamIdRef.current, track, stream);
  };

  const replaceWithCamera = () => {
    if (!videoStreamIdRef.current) throw Error("Track id is null");

    const track = videoStream?.getVideoTracks()[0];

    if (!track) throw Error("Track is null");

    webrtc.replaceTrack(videoStreamIdRef.current, track);
  };

  const replaceWithNull = () => {
    if (!videoStreamIdRef.current) throw Error("Track id is null");

    webrtc.replaceTrack(videoStreamIdRef.current, null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px" }}>
        <button onClick={startCamera}>Start a camera</button>
        <button onClick={addCameraTrack}>Add a camera track</button>
        <button onClick={replaceWithDummyStream}>Replace with dummy stream</button>
        <button onClick={replaceWithNull}>Replace with null</button>
        <button onClick={replaceWithCamera}>Replace camera stream</button>
      </div>
      <div>
        <button onClick={stopCamera}>Stop a camera</button>
        <button onClick={removeCameraTrack}>Remove a camera track</button>
      </div>
      <VideoPlayer stream={videoStream ?? undefined} />
    </div>
  );
};
