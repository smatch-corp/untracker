import { createContext, FC, ReactNode, useContext, useEffect, useMemo, useRef } from 'react';
import { ITracker } from '../core/interface.js';

// Check passed parameter is an instance of `ITracker` or not
function isTrackerLoaded(
  trackerOrTrackerPromise: ITracker | Promise<ITracker>,
): trackerOrTrackerPromise is ITracker {
  return trackerOrTrackerPromise instanceof Promise === false
    && Object.hasOwn(trackerOrTrackerPromise, 'track');
}

const TrackerContext = createContext<ITracker>(null as never);

type TrackerProviderProps = {
  tracker: ITracker | Promise<ITracker>;
  children: ReactNode;
};

export const TrackerProvider: FC<TrackerProviderProps> = ({ children, ...props }) => {
  // We need to store the tracker in a ref so that we can access it in the `useMemo` hook
  const trackerRef = useRef(props.tracker);

  const trackerTaskQueueRef = useRef<[methodName: keyof ITracker, args: any[]][]>([]);

  const tracker = useMemo<ITracker>(() => {
    return {
      clearSessionProperties: async (...args: Parameters<ITracker['clearSessionProperties']>) => {
        const $tracker = trackerRef.current;

        isTrackerLoaded($tracker)
          ? $tracker.clearSessionProperties(...args)
          : enqueueTrackerTask('clearSessionProperties', args);
      },
      deleteSessionProperty: async (...args: Parameters<ITracker['deleteSessionProperty']>) => {
        const $tracker = trackerRef.current;

        isTrackerLoaded($tracker)
          ? $tracker.deleteSessionProperty(...args)
          : enqueueTrackerTask('deleteSessionProperty', args);
      },
      identify: async (...args: Parameters<ITracker['identify']>) => {
        const $tracker = trackerRef.current;

        isTrackerLoaded($tracker)
          ? $tracker.identify(...args)
          : enqueueTrackerTask('identify', args);
      },
      reset: async (...args: Parameters<ITracker['reset']>) => {
        const $tracker = trackerRef.current;

        isTrackerLoaded($tracker)
          ? $tracker.reset(...args)
          : enqueueTrackerTask('reset', args);
      },
      setSessionProperties: async (...args: Parameters<ITracker['setSessionProperties']>) => {
        const $tracker = trackerRef.current;

        isTrackerLoaded($tracker)
          ? $tracker.setSessionProperties(...args)
          : enqueueTrackerTask('setSessionProperties', args);
      },
      track: async (...args: Parameters<ITracker['track']>) => {
        const $tracker = trackerRef.current;

        isTrackerLoaded($tracker)
          ? $tracker.track(...args)
          : enqueueTrackerTask('track', args);
      },
      updateUserProperties: async (...args: Parameters<ITracker['updateUserProperties']>) => {
        const $tracker = trackerRef.current;

        isTrackerLoaded($tracker)
          ? $tracker.updateUserProperties(...args)
          : enqueueTrackerTask('updateUserProperties', args);
      },
      getSessionProperties: (...args: Parameters<ITracker['getSessionProperties']>) => {
        const $tracker = trackerRef.current;

        return isTrackerLoaded($tracker)
          ? $tracker.getSessionProperties(...args)
          : enqueueTrackerTask('getSessionProperties', args);
      },
    } as ITracker;

    function enqueueTrackerTask(methodName: keyof ITracker, args: any[] = []) {
      trackerTaskQueueRef.current.push([methodName, args]);
    }
  }, []);

  useEffect(() => {
    // If the tracker is a promise, we need to wait for it to resolve before we can use it
    if (trackerRef.current instanceof Promise) {
      trackerRef.current.then((tracker) => {
        // Once the tracker is resolved, we can execute all the queued tasks
        for (const [methodName, args] of trackerTaskQueueRef.current) {
          (tracker[methodName] as any).apply(tracker, args);
        }

        // Clear the queue
        trackerTaskQueueRef.current = [];

        // Store the tracker in the ref so that we can use it in the `useMemo` hook
        trackerRef.current = tracker;
      });
    }
  }, []);

  return (
    <TrackerContext.Provider value={tracker}>
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => useContext(TrackerContext);
