import { createClient, type RedisClientType } from 'redis';
import { toErrorMessage } from '../application/errors.js';
import type { CacheStorePort } from '../application/ports/cacheStore.js';
import { env } from '../config/env.js';

export type CacheClientLike = CacheStorePort;

export class RedisCacheAdapter implements CacheStorePort {
    private client: RedisClientType | null = null;
    private isEnabled = false;

    async connect() {
        try {
            this.client = createClient({
                url: env.redisUrl,
                socket: {
                    connectTimeout: 1000,
                    reconnectStrategy: false,
                },
            });
            this.client.on('error', (error) => {
                console.warn('[redis] client error:', error.message);
                this.isEnabled = false;
            });
            await this.client.connect();
            this.isEnabled = true;
            console.log('[redis] connected');
        } catch (error) {
            this.isEnabled = false;
            this.client = null;
            console.warn(`[redis] unavailable, cache disabled code=CACHE_UNAVAILABLE message=${toErrorMessage(error)}`);
        }
    }

    async get(key: string) {
        if (!this.isEnabled || !this.client) {
            return null;
        }

        try {
            return await this.client.get(key);
        } catch (error) {
            this.disableAfterRuntimeError('get', error);
            return null;
        }
    }

    async set(key: string, value: string, ttlSeconds = 300) {
        if (!this.isEnabled || !this.client) {
            return;
        }

        try {
            await this.client.set(key, value, { EX: ttlSeconds });
        } catch (error) {
            this.disableAfterRuntimeError('set', error);
        }
    }

    async delete(key: string) {
        if (!this.isEnabled || !this.client) {
            return;
        }

        try {
            await this.client.del(key);
        } catch (error) {
            this.disableAfterRuntimeError('delete', error);
        }
    }

    async deleteByPrefix(prefix: string) {
        if (!this.isEnabled || !this.client) {
            return;
        }

        try {
            const keys = await this.client.keys(`${prefix}*`);

            if (keys.length) {
                await this.client.del(keys);
            }
        } catch (error) {
            this.disableAfterRuntimeError('deleteByPrefix', error);
        }
    }

    async disconnect() {
        if (this.client?.isOpen) {
            await this.client.quit();
        }
    }

    private disableAfterRuntimeError(operation: string, error: unknown) {
        this.isEnabled = false;
        console.warn(`[redis] runtime cache disabled code=CACHE_UNAVAILABLE operation=${operation} message=${toErrorMessage(error)}`);
    }
}

export const redisCache = new RedisCacheAdapter();
