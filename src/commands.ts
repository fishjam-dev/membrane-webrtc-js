import { SimulcastConfig, TrackBandwidthLimit } from "./webRTCEndpoint";

export type AddTrackCommand = {
  commandType: "ADD-TRACK";
  trackId: string;
  track: MediaStreamTrack;
  stream: MediaStream;
  trackMetadata: any;
  simulcastConfig: SimulcastConfig;
  maxBandwidth: TrackBandwidthLimit; // unlimited bandwidth
};

export type RemoveTrackCommand = {
  commandType: "REMOVE-TRACK";
  trackId: string;
};

export type ReplaceTackCommand = {
  commandType: "REPLACE-TRACK";
  trackId: string;
  newTrack: MediaStreamTrack;
  newTrackMetadata?: any;
};

export type Command = AddTrackCommand | RemoveTrackCommand | ReplaceTackCommand;
