import React, { useState, useSyncExternalStore } from 'react'
import ReactDOM from 'react-dom/client'
import { type SerializedMediaEvent, WebRTCEndpoint, TrackContext } from "@jellyfish-dev/membrane-webrtc-js";
import { PeerMessage } from "./peer_notifications"

const webrtc = new WebRTCEndpoint();
(window as typeof window & { webrtc: WebRTCEndpoint}).webrtc = webrtc;

function connect(token: string) {
  const websocketUrl = "ws://localhost:5002/socket/peer/websocket";
  const websocket = new WebSocket(websocketUrl);
  websocket.binaryType = "arraybuffer";

  function socketOpenHandler(_event: Event) {
    const message = PeerMessage.encode({ authRequest: { token } }).finish();
    console.log(message)
    websocket.send(message);
  };

  websocket.addEventListener("open", socketOpenHandler);

  webrtc.on("sendMediaEvent", (mediaEvent: SerializedMediaEvent) => {
    const message = PeerMessage.encode({ mediaEvent: { data: mediaEvent } }).finish();
    websocket.send(message);
  });
  
  webrtc.on("trackReady", ctx => {
    console.log(ctx);
  })

  const messageHandler = (event: MessageEvent<any>) => {
    const uint8Array = new Uint8Array(event.data);
    try {
      const data = PeerMessage.decode(uint8Array);
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
}

async function addScreenshareTrack(): Promise<string> {
    const stream = await window.navigator.mediaDevices.getDisplayMedia();
    const track = stream.getVideoTracks()[0];

    const trackMetadata = {};
    const simulcastConfig = { enabled: false, activeEncodings: [] };
    const maxBandwidth = 0;

    return webrtc.addTrack(track, stream, trackMetadata, simulcastConfig, maxBandwidth);
};

const DUMB_CACHE: Record<string, Record<string, TrackContext>> = {};

function App() {
  const [tokenInput, setTokenInput] = useState("");

  const handleConnect = () => connect(tokenInput);
  const handleStartScreenshare = () => addScreenshareTrack();

  const remoteTracks = useSyncExternalStore((callback) => {
    webrtc.on("trackReady", callback);
    return () => {
      webrtc.removeAllListeners("trackReady");
    }
  }, () => {
    const newTracks = webrtc.getRemoteTracks();
    const ids = Object.keys(newTracks).sort().join(":");
    if (!(ids in DUMB_CACHE)) {
      DUMB_CACHE[ids] = newTracks;
    }
    return DUMB_CACHE[ids];
  });
    
  return (
    <>
      <div>
        <input value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder="token" />
        <button onClick={handleConnect}>Connect</button>
        <button onClick={handleStartScreenshare}>Start screenshare</button>
      </div>
      <div>
        {Object.values(remoteTracks).map(({stream}) => <video key={stream?.id} ref={video => {video!.srcObject = stream}} autoPlay muted/>)}
      </div>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
