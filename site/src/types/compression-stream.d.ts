// CompressionStream is not in TypeScript 4.9's bundled DOM types
declare class CompressionStream {
    constructor(format: 'deflate' | 'deflate-raw' | 'gzip');
    readonly readable: ReadableStream<Uint8Array>;
    readonly writable: WritableStream<BufferSource>;
}
