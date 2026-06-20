export {};

declare global {
    interface Window {
        __RW_DATA__?: {
            pearls: Promise<any>;
            source: Promise<any>;
        };
        __RW_DATA_KEY__?: string;
        __RW_FROM_404__?: boolean;
    }
}