import { SerializedMediaEvent, TrackContext, TrackEncoding, WebRTCEndpoint } from "@jellyfish-dev/membrane-webrtc-js";
import { PeerMessage } from "./protos/jellyfish/peer_notifications";
import { useEffect, useState, useSyncExternalStore } from "react";
import { MockComponent } from "./MockComponent.tsx";
import { VideoPlayer } from "./VideoPlayer.tsx";

class RemoteTracksStore {
  cache: Record<string, Record<string, TrackContext>> = {};

  constructor(private webrtc: WebRTCEndpoint) {}

  subscribe(callback: () => void) {
    this.webrtc.on("trackReady", callback);
    return () => {
      this.webrtc.removeAllListeners("trackReady");
    };
  }

  snapshot() {
    const newTracks = webrtc.getRemoteTracks();
    const ids = Object.keys(newTracks).sort().join(":");
    if (!(ids in this.cache)) {
      this.cache[ids] = newTracks;
    }
    return this.cache[ids];
  }
}

const webrtc = new WebRTCEndpoint();
(window as typeof window & { webrtc: WebRTCEndpoint }).webrtc = webrtc;
const remoteTracksStore = new RemoteTracksStore(webrtc);

function connect(token: string) {
  const websocketUrl = "ws://localhost:5002/socket/peer/websocket";
  const websocket = new WebSocket(websocketUrl);
  websocket.binaryType = "arraybuffer";

  function socketOpenHandler(_event: Event) {
    const message = PeerMessage.encode({ authRequest: { token } }).finish();
    websocket.send(message);
  }

  websocket.addEventListener("open", socketOpenHandler);

  webrtc.on("sendMediaEvent", (mediaEvent: SerializedMediaEvent) => {
    console.log("%cSend:", "color:blue");
    console.log({ event: JSON.parse(mediaEvent) });
    const message = PeerMessage.encode({ mediaEvent: { data: mediaEvent } }).finish();
    websocket.send(message);
  });

  const messageHandler = (event: MessageEvent<any>) => {
    const uint8Array = new Uint8Array(event.data);
    try {
      const data = PeerMessage.decode(uint8Array);
      console.log("%cReceived:", "color:green");
      if (data?.mediaEvent) {
        // @ts-ignore
        const mediaEvent = JSON.parse(data?.mediaEvent?.data);
        console.log({ mediaEvent });
      } else {
        console.log({ data });
      }

      if (data.authenticated !== undefined) {
        webrtc.connect({});
      } else if (data.authRequest !== undefined) {
        console.warn("Received unexpected control message: authRequest");
      } else if (data.mediaEvent !== undefined) {
        webrtc.receiveMediaEvent(data.mediaEvent.data);
      }
    } catch (e) {
      console.warn(`Received invalid control message, error: ${e}`);
    }
  };

  websocket.addEventListener("message", messageHandler);

  const closeHandler = (event: any) => {
    console.log({ name: "Close handler!", event });
  };

  websocket.addEventListener("close", closeHandler);

  const errorHandler = (event: any) => {
    console.log({ name: "Error handler!", event });
  };

  websocket.addEventListener("error", errorHandler);
}

async function addScreenshareTrack(): Promise<string> {
  const stream = await window.navigator.mediaDevices.getDisplayMedia();
  const track = stream.getVideoTracks()[0];

  const trackMetadata = {};
  const simulcastConfig = { enabled: false, activeEncodings: [] };
  const maxBandwidth = 0;

  return webrtc.addTrack(track, stream, trackMetadata, simulcastConfig, maxBandwidth);
}

export function App() {
  const [tokenInput, setTokenInput] = useState(localStorage.getItem("token") ?? "");
  useEffect(() => {
    localStorage.setItem("token", tokenInput);
  }, [tokenInput]);

  const [status, setStatus] = useState("");

  useEffect(() => {
    // this code doesn't work, why?
    console.log("Start");
    const onConnected = () => {
      console.log("OK!");
      setStatus("connected!");
    };

    const onDisconnected = () => {
      console.log("Bad!");

      setStatus("");
    };

    webrtc.on("connected", () => onConnected);
    webrtc.on("disconnected", () => onDisconnected);

    return () => {
      console.log("Stop");

      webrtc.removeListener("connected", onConnected);
      webrtc.removeListener("connected", onDisconnected);
    };
  }, []);

  const handleConnect = () => connect(tokenInput);
  const handleStartScreenshare = () => addScreenshareTrack();

  const remoteTracks = useSyncExternalStore(
    (callback) => remoteTracksStore.subscribe(callback),
    () => remoteTracksStore.snapshot(),
  );

  useEffect(() => {
    console.log({ remoteTracks });
  }, [remoteTracks]);

  const [counter, setCounter] = useState<number>(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCounter((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const setEncoding = (trackId: string, encoding: TrackEncoding) => {
    webrtc.setTargetTrackEncoding(trackId, encoding);
  };

  const [connnected, setConnected] = useState(false);
  useEffect(() => {
    const callback = () => setConnected(true);
    webrtc.on("connected", callback);
    return () => {
      webrtc.removeListener("connected", callback);
    };
  }, []);

  return (
    <>
      <span>{counter}</span>
      <div>
        <input value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder="token" />
        <button onClick={handleConnect}>Connect</button>
        <button onClick={handleStartScreenshare}>Start screenshare</button>
      </div>
      <div id="connection-status">{connnected ? "true" : "false"}</div>
      <span>{status}</span>
      <MockComponent webrtc={webrtc} />
      <div style={{ width: "100%" }}>
        {Object.values(remoteTracks).map(({ stream, trackId, endpoint }) => (
          <div key={trackId} data-endpoint-id={endpoint.id} data-stream-id={stream?.id}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <VideoPlayer id={endpoint.id} stream={stream ?? undefined} />
            </div>
            <div data-name="stream-id">{stream?.id}</div>
            <div>
              <button onClick={() => setEncoding(trackId, "l")}>l</button>
              <button onClick={() => setEncoding(trackId, "m")}>m</button>
              <button onClick={() => setEncoding(trackId, "h")}>h</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
