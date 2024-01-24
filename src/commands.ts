import { SimulcastConfig, TrackBandwidthLimit } from "./webRTCEndpoint";
import { Deferred } from "./deferred";

export type AddTrackCommand = {
  commandType: "ADD-TRACK";
  trackId: string;
  track: MediaStreamTrack;
  stream: MediaStream;
  trackMetadata: any;
  simulcastConfig: SimulcastConfig;
  maxBandwidth: TrackBandwidthLimit; // unlimited bandwidth
  resolutionNotifier: Deferred<void>
};

export type RemoveTrackCommand = {
  commandType: "REMOVE-TRACK";
  trackId: string;
  resolutionNotifier: Deferred<void>
};

export type ReplaceTackCommand = {
  commandType: "REPLACE-TRACK";
  trackId: string;
  newTrack: MediaStreamTrack;
  newTrackMetadata?: any;
  resolutionNotifier: Deferred<void>;
};

export type Command = AddTrackCommand | RemoveTrackCommand | ReplaceTackCommand;
