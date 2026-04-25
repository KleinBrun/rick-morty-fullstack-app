import { performance } from 'node:perf_hooks';

export function logExecutionTime(label?: string) {
    return function (_target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value as ((...args: unknown[]) => Promise<unknown>) | undefined;

        if (!originalMethod) { return descriptor; }

        descriptor.value = async function (...args: unknown[]) {
            const startedAt = performance.now();

            try {
                return await originalMethod.apply(this, args);
            } finally {
                const duration = (performance.now() - startedAt).toFixed(2);
                console.log(`[timing] ${label ?? propertyKey} finished in ${duration}ms`);
            }
        };

        return descriptor;
    };
}