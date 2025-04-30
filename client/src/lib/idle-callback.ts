// Add type definition for IdleDeadline for environments that don't have it
interface IdleDeadline {
  didTimeout: boolean;
  timeRemaining: () => number;
}

// Add type definition for requestIdleCallback
type RequestIdleCallbackHandle = number;
interface RequestIdleCallbackOptions {
  timeout?: number;
}
interface WindowWithIdleCallback extends Window {
  requestIdleCallback: (
    callback: (deadline: IdleDeadline) => void,
    opts?: RequestIdleCallbackOptions
  ) => RequestIdleCallbackHandle;
  cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void;
}

/**
 * Wrapper for requestIdleCallback with fallback
 * 
 * Executes non-critical tasks during browser idle periods to improve main thread performance.
 * Falls back to setTimeout for browsers that don't support requestIdleCallback.
 * 
 * @param callback Function to execute during idle time
 * @param options Configuration options
 * @returns ID that can be used to cancel the callback
 */
export function scheduleIdleTask(
  callback: (deadline: IdleDeadline) => void,
  options?: { timeout?: number }
): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return (window as unknown as WindowWithIdleCallback).requestIdleCallback(callback, options);
  }
  
  // Fallback for browsers without requestIdleCallback
  return setTimeout(() => {
    const deadline = {
      didTimeout: false,
      timeRemaining: () => 15, // Estimate 15ms of idle time
    };
    callback(deadline as IdleDeadline);
  }, options?.timeout || 1);
}

/**
 * Cancels a previously scheduled idle task
 * 
 * @param id The ID returned by scheduleIdleTask
 */
export function cancelIdleTask(id: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Splits a heavy task into smaller chunks to avoid blocking the main thread
 * 
 * @param items Array of items to process
 * @param processor Function that processes each item
 * @param chunkSize Number of items to process in each chunk
 * @returns Promise that resolves when all items are processed
 */
export function processInIdleChunks<T, R>(
  items: T[],
  processor: (item: T) => R,
  chunkSize: number = 5
): Promise<R[]> {
  return new Promise((resolve) => {
    const results: R[] = [];
    let index = 0;
    
    function processChunk(deadline: IdleDeadline) {
      // Process items until we run out of time or items
      while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && index < items.length) {
        const result = processor(items[index]);
        results.push(result);
        index++;
        
        // Process in chunks to avoid exceeding chunkSize
        if (index % chunkSize === 0) {
          // Schedule next chunk and break out of the loop
          scheduleIdleTask(processChunk);
          return;
        }
      }
      
      // If there are more items to process, schedule the next chunk
      if (index < items.length) {
        scheduleIdleTask(processChunk);
      } else {
        // All items processed, resolve the promise
        resolve(results);
      }
    }
    
    // Start processing the first chunk
    scheduleIdleTask(processChunk);
  });
}

/**
 * Example usage:
 * 
 * // Defer non-critical initialization
 * scheduleIdleTask(() => {
 *   // Initialize analytics
 *   initAnalytics();
 *   
 *   // Register service worker
 *   registerServiceWorker();
 * });
 * 
 * // Process a large array without blocking the main thread
 * const items = Array.from({ length: 10000 }, (_, i) => i);
 * processInIdleChunks(items, (item) => {
 *   // Do something with each item
 *   return item * 2;
 * }).then((results) => {
 *   console.log('All items processed:', results);
 * });
 */