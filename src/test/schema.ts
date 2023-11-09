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

export const CustomOfferDataEventSchema = z.object({
    data: z.object({
        data: z.object({
            integratedTurnServers: z.array(z.object({
                password: z.string().min(1),
                serverAddr: z.string().min(1),
                serverPort: z.number(),
                transport: z.string().min(1),
                username: z.string().min(1),
            })),
            tracksTypes: z.object({
                audio: z.number(), // .min(0).max(infinity) - number of video tracks
                video: z.number(), // .min(0).max(infinity) - number of audio tracks
            }),
        }),
        type: z.literal("offerData"),
    }),
    type: z.literal("custom"),
})

export type CustomOfferDataEvent = z.infer<typeof CustomOfferDataEventSchema>;

export const CustomSdpAnswerDataEventSchema = z.object({
    data: z.object({
        data: z.object({
            midToTrackId: z.record(z.string().min(1)), // key is number.toString() eg. "0", "1"...
            sdp: z.string().min(1),
            type: z.literal("answer"),
        }),
        type: z.literal("sdpAnswer"),
    }),
    type: z.literal("custom"),
})

export type CustomSdpAnswerDataEvent = z.infer<typeof CustomSdpAnswerDataEventSchema>;

export const EndpointAddedWebrtcEventSchema = z.object({
    data: z.object({
        id: z.string().min(1),
        metadata: z.any(),
        type: z.literal("webrtc"),
    }),
    type: z.literal("endpointAdded"),
})

export type EndpointAddedWebrtcEvent = z.infer<typeof EndpointAddedWebrtcEventSchema>;


// endpointAdded
// {
//     "data": {
//         "id": "73d400f3-f599-4e6b-a133-28231345c83b",
//         "metadata": {
//             "name": "73d400f3-f599-4e6b-a133-28231345c83b"
//         },
//         "type": "webrtc"
//     },
//     "type": "endpointAdded"
// }


export type MediaEvent = TracksAddedMediaEvent | ConnectedMediaEvent
export type CustomEvent = CustomOfferDataEvent | CustomSdpAnswerDataEvent
