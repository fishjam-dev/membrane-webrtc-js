import { z } from "zod";

const TrackSchema = z.object({
    metadata: z.any(),
    simulcastConfig: z.object({
        activeEncodings: z.array(z.union([z.literal("h"), z.literal("m"), z.literal("l")])),
        enabled: z.boolean()
    })
})

export type Track = z.infer<typeof TrackSchema>;

const EndpointSchema = z.object({
    id: z.string().min(1), // peer / component id
    metadata: z.record(z.any()),
    trackIdToMetadata: z.any(), // todo fix
    tracks: z.record(TrackSchema),
    type: z.string(), // fix 'webrtc' etc.
})

export type Endpoint = z.infer<typeof EndpointSchema>;

const ConnectedMediaEventSchema = z.object({
    data: z.object({
        id: z.string().min(1),// uuid room id
        otherEndpoints: z.array(EndpointSchema)
    }),
    type: z.literal("connected"),
})

export type ConnectedMediaEvent = z.infer<typeof ConnectedMediaEventSchema>;
