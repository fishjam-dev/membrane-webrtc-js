import { createStream } from "./mocks.ts";
import { WebRTCEndpoint } from "@jellyfish-dev/membrane-webrtc-js";
import { VideoPlayer } from "./VideoPlayer.tsx";

const brainMock = createStream("🧠", "white", "low", 24);
const heartMock = createStream("🫀", "white", "low", 24);

type Props = {
  webrtc: WebRTCEndpoint;
};

export const MockComponent = ({ webrtc }: Props) => {
  const addAHeart = () => {
    const stream = heartMock.stream;
    const track = stream.getVideoTracks()[0];

    const trackMetadata = { name: "Heart" };
    const simulcastConfig = { enabled: false, activeEncodings: [] };
    const maxBandwidth = 0;

    webrtc.addTrack(track, stream, trackMetadata, simulcastConfig, maxBandwidth);
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
      </div>
      <div>
        <VideoPlayer stream={brainMock.stream} />
        <button onClick={addABrain}>Add a brain</button>
      </div>

      <button onClick={addBoth}>Add both</button>
    </div>
  );
};
