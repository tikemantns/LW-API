/**
 * Utility function to add timeout to async operations
 */

export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Operation timed out after ${timeoutMs}ms`))
            }, timeoutMs)
        }),
    ])
}
