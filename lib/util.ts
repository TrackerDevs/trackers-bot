/** Returns a promise that waits for (ms) milliseconds before resolving */
export const sleep = async (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))