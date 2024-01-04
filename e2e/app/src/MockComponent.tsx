import { createStream } from "./mocks.ts";
import { WebRTCEndpoint } from "@jellyfish-dev/membrane-webrtc-js";
import { VideoPlayer } from "./VideoPlayer.tsx";
import { useRef, useState } from "react";

const brainMock = createStream("🧠", "white", "low", 24);
const heartMock = createStream("🫀", "white", "low", 24);
const heart2Mock = createStream("💝", "#FF0000", "low", 24);

type Props = {
  webrtc: WebRTCEndpoint;
};

export const MockComponent = ({ webrtc }: Props) => {
  const heartId = useRef<string | null>(null);
  const [replaceStatus, setReplaceStatus] = useState<"unknown" | "success" | "failure">("unknown");

  const addHeart = () => {
    const stream = heartMock.stream;
    const track = stream.getVideoTracks()[0];

    const trackMetadata = { name: "Heart" };
    heartId.current = webrtc.addTrack(track, stream, trackMetadata);
  };

  const removeHeart = () => {
    if (!heartId.current) throw Error("Heart id is undefined");

    webrtc.removeTrack(heartId.current);
  };

  const replaceHeart = async () => {
    if (!heartId.current) throw Error("Track Id is not set");

    const stream = heart2Mock.stream;
    const track = stream.getVideoTracks()[0];

    const trackMetadata = { name: "Heart" };

    const result = await webrtc.replaceTrack(heartId.current, track, trackMetadata);
    setReplaceStatus(result ? "success" : "failure");
  };

  const addBrain = () => {
    const stream = brainMock.stream;
    const track = stream.getVideoTracks()[0];

    const trackMetadata = { name: "Brain" };
    const simulcastConfig = { enabled: false, activeEncodings: [] };
    const maxBandwidth = 0;

    webrtc.addTrack(track, stream, trackMetadata, simulcastConfig, maxBandwidth);
  };

  const addBoth = () => {
    addHeart();
    addBrain();
  };

  const addAndReplaceHeart = () => {
    addHeart();
    replaceHeart();
  };

  // todo test it
  const addAndRemoveHeart = () => {
    addHeart();
    removeHeart();
  };

  return (
    <div>
      <div>
        <VideoPlayer stream={heartMock.stream} />
        <button onClick={addHeart}>Add a heart</button>
        <button onClick={removeHeart}>Remove a heart</button>
        <VideoPlayer stream={heart2Mock.stream} />
        <button onClick={replaceHeart}>Replace a heart</button>
        <div>
          <span>Replace status: </span>
          <span data-replace-status={replaceStatus}>{replaceStatus}</span>
        </div>
      </div>
      <div>
        <VideoPlayer stream={brainMock.stream} />
        <button onClick={addBrain}>Add a brain</button>
      </div>

      <button onClick={addBoth}>Add both</button>
      <button onClick={addAndReplaceHeart}>Add and replace a heart</button>
      <button onClick={addAndRemoveHeart}>Add and remove a heart</button>
    </div>
  );
};
