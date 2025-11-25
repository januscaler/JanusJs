export interface BasicMessageBody {
    session_id: string
    handle_id: string
    body: {
        request: string
    } & any
    transaction: string
    janus: 'message'
}
//# sourceMappingURL=index.d.ts.map
