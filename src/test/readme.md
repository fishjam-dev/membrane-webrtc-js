# What to test?

## Input events:

tracksAdded - ⚠️
trackRemoved - 
sdpAnswer - ⚠️
candidate -
endpointAdded - ✅
endpointUpdated - ✅
trackUpdated - ✅
trackPriority -
encodingSwitched - ✅
custom -
error -
vadNotification - ✅
bandwidthEstimation - ✅

## Output events

sendMediaEvent: (mediaEvent: SerializedMediaEvent) => void;
connected: (endpointId: string, otherEndpoints: Endpoint[]) => void; ✅
disconnected: () => void;
trackReady: (ctx: TrackContext) => void;
trackAdded: (ctx: TrackContext) => void; ✅
trackRemoved: (ctx: TrackContext) => void;
trackUpdated: (ctx: TrackContext) => void; ✅
endpointAdded: (endpoint: Endpoint) => void; ✅
endpointRemoved: (endpoint: Endpoint) => void;
endpointUpdated: (endpoint: Endpoint) => void; ✅
connectionError: (message: string) => void;
tracksPriorityChanged: (enabledTracks: TrackContext[], disabledTracks: TrackContext[]) => void;
bandwidthEstimationChanged: (estimation: bigint) => void; ✅

voiceActivityChanged - ✅
encodingChanged - ✅

# Functions

public addTrack(
track: MediaStreamTrack,
stream: MediaStream,
trackMetadata: any = new Map(),
simulcastConfig: SimulcastConfig = { enabled: false, activeEncodings: [] },
maxBandwidth: TrackBandwidthLimit = 0 // unlimited bandwidth
): string

public async replaceTrack(
trackId: string,
newTrack: MediaStreamTrack,
newTrackMetadata?: any
): Promise<boolean>

public setTrackBandwidth(
trackId: string,
bandwidth: BandwidthLimit
): Promise<boolean>

public setEncodingBandwidth(
trackId: string,
rid: string,
bandwidth: BandwidthLimit
): Promise<boolean>

public removeTrack(trackId: string) {
}

public prioritizeTrack(trackId: string) {}
public unprioritizeTrack(trackId: string) {}
public setPreferedVideoSizes(
bigScreens: number,
smallScreens: number,
mediumScreens: number = 0,

public setTargetTrackEncoding(trackId: string, encoding: TrackEncoding) {
public enableTrackEncoding(trackId: string, encoding: TrackEncoding) {
public disableTrackEncoding(trackId: string, encoding: TrackEncoding) {
public updateEndpointMetadata = (metadata: any): void => {
public updateTrackMetadata = (trackId: string, trackMetadata: any): void => {
public disconnect = () => {}
public cleanUp = () => {}
