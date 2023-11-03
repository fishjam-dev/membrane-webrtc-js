import { z } from "zod";

export const TrackIdToMetadataSchema = z.record(z.any())

export type TrackIdToMetadata = z.infer<typeof TrackIdToMetadataSchema>;

export const TrackSchema = z.object({
    metadata: z.any(),
    simulcastConfig: z.object({
        activeEncodings: z.array(z.union([z.literal("h"), z.literal("m"), z.literal("l")])),
        enabled: z.boolean()
    })
})

export type Track = z.infer<typeof TrackSchema>;

export const EndpointSchema = z.object({
    id: z.string().min(1), // peer / component id
    metadata: z.record(z.any()),
    trackIdToMetadata: TrackIdToMetadataSchema, // todo fix
    tracks: z.record(TrackSchema),
    type: z.string(), // fix 'webrtc' etc.
})

export type Endpoint = z.infer<typeof EndpointSchema>;

export const ConnectedMediaEventSchema = z.object({
    data: z.object({
        id: z.string().min(1),// uuid room id
        otherEndpoints: z.array(EndpointSchema)
    }),
    type: z.literal("connected"),
})

export type ConnectedMediaEvent = z.infer<typeof ConnectedMediaEventSchema>;

export const TracksAddedMediaEventSchema = z.object({
    data: z.object({
        endpointId: z.string().min(1),// uuid room id
        trackIdToMetadata: TrackIdToMetadataSchema, // todo fix,
        tracks: z.record(TrackSchema)
    }),
    type: z.literal("tracksAdded"),
})

export type TracksAddedMediaEvent = z.infer<typeof TracksAddedMediaEventSchema>;


// trackAdded
// {
//     "data": {
//         "endpointId": "21897363-a7e6-4345-9a10-52bcc2828270",
//         "trackIdToMetadata": {
//             "21897363-a7e6-4345-9a10-52bcc2828270:85032441-9fe3-4de7-ba30-6c96bbcad212": {
//                 "name": "track-name",
//                 "type": "video"
//             }
//         },
//         "tracks": {
//             "21897363-a7e6-4345-9a10-52bcc2828270:85032441-9fe3-4de7-ba30-6c96bbcad212": {
//                 "metadata": {
//                     "name": "track-name",
//                     "type": "video"
//                 },
//                 "simulcastConfig": {
//                     "activeEncodings": [
//                         "l",
//                         "m",
//                         "h"
//                     ],
//                     "enabled": true
//                 }
//             }
//         }
//     },
//     "type": "tracksAdded"
// }
