import { createWorkerStream } from "./mocks.ts";
import { WebRTCEndpoint } from "@jellyfish-dev/membrane-webrtc-js";
import { VideoPlayer } from "./VideoPlayer.tsx";
import { useRef, useState } from "react";

const brainMock = createWorkerStream("🧠", "white", "high", 24);
const brain2Mock = createWorkerStream("🤯", "#00ff00", "high", 24);
const heartMock = createWorkerStream("🫀", "white", "high", 24);
const heart2Mock = createWorkerStream("💝", "#FF0000", "high", 24);

type Props = {
  webrtc: WebRTCEndpoint;
};

export const MockComponent = ({ webrtc }: Props) => {
  const heartId = useRef<string | null>(null);
  const brainId = useRef<string | null>(null);
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

  const removeBrain = () => {
    if (!brainId.current) throw Error("Brain id is undefined");

    webrtc.removeTrack(brainId.current);
  };

  const replaceHeart = async () => {
    if (!heartId.current) throw Error("Track Id is not set");

    const stream = heart2Mock.stream;
    const track = stream.getVideoTracks()[0];

    const trackMetadata = { name: "Heart" };

    const result = await webrtc.replaceTrack(heartId.current, track, trackMetadata);
    setReplaceStatus(result ? "success" : "failure");
  };

  const replaceBrain = async () => {
    if (!brainId.current) throw Error("Track Id is not set");

    const stream = brain2Mock.stream;
    const track = stream.getVideoTracks()[0];

    const trackMetadata = { name: "Heart" };

    await webrtc.replaceTrack(brainId.current, track, trackMetadata);
  };

  const addBrain = () => {
    const stream = brainMock.stream;
    const track = stream.getVideoTracks()[0];

    const trackMetadata = { name: "Brain" };
    const simulcastConfig = { enabled: false, activeEncodings: [] };
    const maxBandwidth = 0;

    brainId.current = webrtc.addTrack(track, stream, trackMetadata, simulcastConfig, maxBandwidth);
  };

  const addBoth = () => {
    addHeart();
    addBrain();
  };

  const addAndReplaceHeart = () => {
    addHeart();
    replaceHeart();
  };

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
        <button onClick={removeBrain}>Remove a brain</button>
        <VideoPlayer stream={brain2Mock.stream} />
        <button onClick={replaceBrain}>Replace a brain</button>
      </div>
      <div>
        {/*<VideoPlayer stream={.stream} />*/}
        {/*<button onClick={addBrain}>Add a brain</button>*/}
        {/*<button onClick={removeBrain}>Remove a brain</button>*/}
        {/*<VideoPlayer stream={brain2Mock.stream} />*/}
        {/*<button onClick={replaceBrain}>Replace a brain</button>*/}
      </div>

      <button onClick={addBoth}>Add both</button>
      <button onClick={addAndReplaceHeart}>Add and replace a heart</button>
      <button onClick={addAndRemoveHeart}>Add and remove a heart</button>
    </div>
  );
};
