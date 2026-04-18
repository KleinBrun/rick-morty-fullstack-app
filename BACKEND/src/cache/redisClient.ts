import { createClient, type RedisClientType } from 'redis';
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
            });
            await this.client.connect();
            this.isEnabled = true;
            console.log('[redis] connected');
        } catch {
            this.isEnabled = false;
            this.client = null;
            console.warn('[redis] unavailable, cache disabled');
        }
    }

    async get(key: string) {
        if (!this.isEnabled || !this.client) {
            return null;
        }

        return this.client.get(key);
    }

    async set(key: string, value: string, ttlSeconds = 300) {
        if (!this.isEnabled || !this.client) {
            return;
        }

        await this.client.set(key, value, { EX: ttlSeconds });
    }

    async delete(key: string) {
        if (!this.isEnabled || !this.client) {
            return;
        }

        await this.client.del(key);
    }

    async deleteByPrefix(prefix: string) {
        if (!this.isEnabled || !this.client) {
            return;
        }

        const keys = await this.client.keys(`${prefix}*`);

        if (keys.length) {
            await this.client.del(keys);
        }
    }

    async disconnect() {
        if (this.client?.isOpen) {
            await this.client.quit();
        }
    }
}

export const redisCache = new RedisCacheAdapter();