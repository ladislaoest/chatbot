declare module '@builderbot/provider-baileys' {
    import { ProviderClass, EventEmitterClass } from '@builderbot/bot';
    import type { BotContext, Button, SendOptions } from '@builderbot/bot/dist/types';
    import type { PathOrFileDescriptor } from 'fs';
    import NodeCache from 'node-cache';
    import type polka from 'polka';
    import type { IStickerOptions } from 'wa-sticker-formatter';
    type BaileysEventMap = any;
    type WAMessage = any;
    type WASocket = any;
    type proto = any;
    type BaileyGlobalVendorArgs = any;

    class BaileysProvider extends ProviderClass<WASocket> {
        globalVendorArgs: BaileyGlobalVendorArgs;
        private reconnectAttempts;
        private maxReconnectAttempts;
        private reconnectDelay;
        msgRetryCounterCache?: NodeCache;
        userDevicesCache?: NodeCache;
        private logger;
        private logStream;
        private idsDuplicates;
        private mapSet;
        constructor(args: Partial<BaileyGlobalVendorArgs>);
        private setupConsoleFilter;
        private setupCleanupHandlers;
        private setupPeriodicCleanup;
        private cleanup;
        releaseSessionFiles(): Promise<void>;
        protected beforeHttpServerInit(): void;
        protected afterHttpServerInit(): void;
        indexHome: polka.Middleware;
        protected getMessage: (key: {
            remoteJid: string;
            id: string;
        }) => Promise<{}>;
        protected saveCredsGlobal: (() => Promise<void>) | null;
        protected initVendor: () => Promise<any>;
        protected busEvents: () => {
            event: keyof BaileysEventMap;
            func: (arg?: any, arg2?: any) => any;
        }[];
        getOrderDetails: (orderId: string, orderToken: string) => Promise<any>;
        sendMedia: (number: string, imageUrl: string, text: string) => Promise<any>;
        sendImage: (number: string, filePath: string, text: any) => Promise<any>;
        sendVideo: (number: string, filePath: PathOrFileDescriptor, text: any) => Promise<any>;
        sendAudio: (number: string, audioUrl: string) => Promise<any>;
        sendText: (number: string, message: string) => Promise<any>;
        sendFile: (number: string, filePath: string, text: string) => Promise<any>;
        sendButtons: (number: string, text: string, buttons: Button[]) => Promise<any>;
        sendPoll: (numberIn: string, text: string, poll: {
            options: string[];
            multiselect: any;
        }) => Promise<false | any>;
        sendMessage: (numberIn: string, message: string, options?: SendOptions) => Promise<any>;
        sendLocation: (remoteJid: string, latitude: any, longitude: any, messages?: any) => Promise<{
            status: string;
        }>;
        sendContact: (remoteJid: any, contactNumber: {
            replaceAll: (arg0: string, arg1: string) => any;
        }, displayName: string, orgName: string, messages?: any) => Promise<{
            status: string;
        }>;
        sendPresenceUpdate: (remoteJid: any, WAPresence: any) => Promise<void>;
        sendSticker: (remoteJid: any, url: string | Buffer, stickerOptions: Partial<IStickerOptions>, messages?: any) => Promise<void>;
        private getMimeType;
        private generateFileName;
        saveFile: (ctx: Partial<WAMessage & BotContext>, options?: {
            path: string;
        }) => Promise<string>;
        private extractSenderWithAltFields;
        private resolveLIDToPNForSending;
        private shouldReconnect;
        private delayedReconnect;
        private validateLIDSupport;
        private hasLIDSupport;
        getLIDMappingStore(): any;
        getLIDFromPN(phoneNumber: string): Promise<string | null>;
        getPNFromLID(lid: string): Promise<string | null>;
        storeLIDPNMapping(lid: string, phoneNumber: string): Promise<boolean>;
        // Inherited from EventEmitterClass
        on<T extends keyof BaileysEventMap>(event: T, listener: (...args: BaileysEventMap[T]) => any): this;
        on(event: string, listener: (...args: any[]) => any): this;
    }
    export { BaileysProvider };
}

declare module '@builderbot/bot/dist/types' {
    import type { IdleState } from '@builderbot/bot/dist/context';
    import type { ProviderClass } from '@builderbot/bot';
    import type { Queue } from '@builderbot/bot/dist/utils';
    export type CustomNameEvent = string;
    export type GlobalVendorArgs<V = {
        [key: string]: any;
    }> = {
        name?: string;
        port?: number;
        writeMyself?: 'none' | 'host' | 'both';
    } & V;
    export type ProviderEventTypes = {
        message: [arg1: BotContext];
        require_action: [
            arg1: {
                title: string;
                instructions: string[];
                payload?: {
                    qr?: string;
                    code?: string;
                    [key: string]: any;
                };
            }
        ];
        notice: [arg1: {
            title: string;
            instructions: string[];
        }];
        ready: any;
        auth_failure: any;
        host: any;
        [key: string]: any;
    };
    export type GeneralArgs = {
        blackList?: string[];
        listEvents?: Record<string, any>;
        delay?: number;
        globalState?: Record<string, any>;
        extensions?: Record<string, any>;
        queue?: {
            timeout: number;
            concurrencyLimit: number;
        };
        host?: string
    };
    export type BotContext = {
        name?: string;
        host?: {
            phone: string;
            [key: string]: any;
        };
        /** @deprecated */
        idleFallBack?: boolean;
        body: string;
        from: string;
        [key: string]: any;
    };
    export type FlowDynamicMessage = {
        body?: string;
        buttons?: Button[];
        delay?: number;
        media?: string;
    };
    export type BotMethods<P = {}, B = {}> = {
        flowDynamic: (messages: string | string[] | FlowDynamicMessage[], opts?: {
            delay: number;
        }) => Promise<void>;
        gotoFlow: (flow: any, step?: number) => Promise<void>;
        endFlow: (message?: string) => void;
        fallBack: (message?: string) => void;
        provider: P;
        database: B;
        flows: any[];
        /** @deprecated */
        inRef: string;
        /** @deprecated */
        idle: IdleState;
        state: any;
        blacklist: any;
        globalState: any;
        queue: Queue<any>;
        extensions: Record<string, any>;
        sendMessage: ProviderClass['sendMessage'];
    };
}