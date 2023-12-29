import { createStream } from "./mocks.ts";
import { WebRTCEndpoint, SimulcastConfig } from "@jellyfish-dev/membrane-webrtc-js";
import { VideoPlayer } from "./VideoPlayer.tsx";
import { useRef } from "react";

const brainMock = createStream("🧠", "white", "low", 24);
const heartMock = createStream("🫀", "white", "low", 24);
const heart2Mock = createStream("💝", "pink", "low", 24);

type Props = {
  webrtc: WebRTCEndpoint;
};

export const MockComponent = ({ webrtc }: Props) => {
  const heartId = useRef<string | null>(null);

  const addAHeart = () => {
    const stream = heartMock.stream;
    const track = stream.getVideoTracks()[0];

    const trackMetadata = { name: "Heart" };
    const simulcastConfig: SimulcastConfig = { enabled: true, activeEncodings: ["l", "m", "h"] };
    const maxBandwidth = 0;

    heartId.current = webrtc.addTrack(track, stream, trackMetadata, simulcastConfig, maxBandwidth);
  };

  const removeAHeart = () => {
    if (!heartId.current) throw Error("Heart id is undefined");

    webrtc.removeTrack(heartId.current);
  };

  const replaceAHeart = () => {
    if (!heartId.current) throw Error("Track Id is not set");

    console.log({ id: heartId.current });
    const stream = heart2Mock.stream;
    const track = stream.getVideoTracks()[0];

    const trackMetadata = { name: "Heart" };

    webrtc.replaceTrack(heartId.current, track, trackMetadata);
  };

  const addABrain = () => {
    const stream = brainMock.stream;
    const track = stream.getVideoTracks()[0];

    const trackMetadata = { name: "Brain" };
    const simulcastConfig = { enabled: false, activeEncodings: [] };
    const maxBandwidth = 0;

    webrtc.addTrack(track, stream, trackMetadata, simulcastConfig, maxBandwidth);
  };

  const addBoth = () => {
    addAHeart();
    addABrain();
  };

  return (
    <div>
      <div>
        <VideoPlayer stream={heartMock.stream} />
        <button onClick={addAHeart}>Add a heart</button>
        <button onClick={removeAHeart}>Remove a heart</button>
        <VideoPlayer stream={heart2Mock.stream} />
        <button onClick={replaceAHeart}>Replace a heart</button>
      </div>
      <div>
        <VideoPlayer stream={brainMock.stream} />
        <button onClick={addABrain}>Add a brain</button>
      </div>

      <button onClick={addBoth}>Add both</button>
    </div>
  );
};
