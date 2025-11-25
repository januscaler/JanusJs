export interface StreamingListResponse {
    id: number
    type: string
    description: string
    metadata: any
    enabled: boolean
    media: {
        mid: string
        label: string
        msid: string
        type: 'audio' | 'video' | 'data'
        age_ms: number
    }[]
}
//# sourceMappingURL=streaming.d.ts.map
