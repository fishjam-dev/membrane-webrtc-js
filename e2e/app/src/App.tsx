import { SerializedMediaEvent, TrackContext, TrackEncoding, WebRTCEndpoint } from "@jellyfish-dev/membrane-webrtc-js";
import { PeerMessage } from "./protos/jellyfish/peer_notifications";
import { useEffect, useState, useSyncExternalStore } from "react";
import { MockComponent } from "./MockComponent.tsx";
import { VideoPlayerWithDetector } from "./VideoPlayerWithDetector.tsx";
import { WebRTCEndpointEvents } from "../../../dist/membrane-webrtc-js";
import { TrackContextEvents } from "../../../src";

/* eslint-disable no-console */

class RemoteTracksStore {
  cache: Record<string, Record<string, TrackContext>> = {};
  invalidateCache: boolean = false;

  constructor(private webrtc: WebRTCEndpoint) {}

  subscribe(callback: () => void) {
    const cb = () => {
      this.invalidateCache = true;
      callback();
    };

    const trackCb: TrackContextEvents["encodingChanged"] = () => cb();

    const trackAddedCb: WebRTCEndpointEvents["trackAdded"] = (context) => {
      context.on("encodingChanged", () => trackCb);
      context.on("voiceActivityChanged", () => trackCb);

      callback();
    };

    const removeCb: WebRTCEndpointEvents["trackRemoved"] = (context) => {
      context.removeListener("encodingChanged", () => trackCb);
      context.removeListener("voiceActivityChanged", () => trackCb);

      callback();
    };

    this.webrtc.on("trackAdded", trackAddedCb);
    this.webrtc.on("trackReady", cb);
    this.webrtc.on("trackUpdated", cb);
    this.webrtc.on("trackRemoved", removeCb);

    return () => {
      this.webrtc.removeListener("trackAdded", trackAddedCb);
      this.webrtc.removeListener("trackReady", cb);
      this.webrtc.removeListener("trackUpdated", cb);
      this.webrtc.removeListener("trackRemoved", removeCb);
    };
  }

  snapshot() {
    const newTracks = webrtc.getRemoteTracks();
    const ids = Object.keys(newTracks).sort().join(":");
    if (!(ids in this.cache) || this.invalidateCache) {
      this.cache[ids] = newTracks;
      this.invalidateCache = false;
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

  // Assign a random client ID to make it easier to distinguish their messages
  const clientId = Math.floor(Math.random() * 100);

  webrtc.on("sendMediaEvent", (mediaEvent: SerializedMediaEvent) => {
    console.log(`%c(${clientId}) - Send: ${mediaEvent}`, "color:blue");
    const message = PeerMessage.encode({ mediaEvent: { data: mediaEvent } }).finish();
    websocket.send(message);
  });

  const messageHandler = (event: MessageEvent<any>) => {
    const uint8Array = new Uint8Array(event.data);
    try {
      const data = PeerMessage.decode(uint8Array);

      if (data?.mediaEvent) {
        // @ts-ignore
        const mediaEvent = JSON.parse(data?.mediaEvent?.data);
        console.log(`%c(${clientId}) - Received: ${JSON.stringify(mediaEvent)}`, "color:green");
      } else {
        console.log(`%c(${clientId}) - Received: ${JSON.stringify(data)}`, "color:green");
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

  const trackReady = (event: any) => {
    console.log({ name: "trackReady", event });
  };

  websocket.addEventListener("trackReady", trackReady);
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
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    localStorage.setItem("token", tokenInput);
  }, [tokenInput]);

  const handleConnect = () => connect(tokenInput);
  const handleStartScreenshare = () => addScreenshareTrack();

  const remoteTracks = useSyncExternalStore(
    (callback) => remoteTracksStore.subscribe(callback),
    () => remoteTracksStore.snapshot(),
  );

  const setEncoding = (trackId: string, encoding: TrackEncoding) => {
    webrtc.setTargetTrackEncoding(trackId, encoding);
  };

  useEffect(() => {
    const callback = () => setConnected(true);

    webrtc.on("connected", callback);

    return () => {
      webrtc.removeListener("connected", callback);
    };
  }, []);

  return (
    <>
      <div>
        <input value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder="token" />
        <button onClick={handleConnect}>Connect</button>
        <button onClick={handleStartScreenshare}>Start screenshare</button>
      </div>
      <div id="connection-status">{connected ? "true" : "false"}</div>
      <MockComponent webrtc={webrtc} />
      <div style={{ width: "100%" }}>
        {Object.values(remoteTracks).map(({ stream, trackId, endpoint }) => (
          <div key={trackId} data-endpoint-id={endpoint.id} data-stream-id={stream?.id}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <VideoPlayerWithDetector id={endpoint.id} stream={stream ?? undefined} />
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
