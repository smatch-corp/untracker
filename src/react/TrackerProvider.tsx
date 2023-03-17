import { createContext, FC, ReactNode, useContext } from 'react';
import { ITracker } from '../core/interface.js';

const noop = async () => void 0;

const TrackerContext = createContext<ITracker>({
  clearSessionProperties: noop,
  deleteSessionProperty: noop,
  identify: noop,
  reset: noop,
  setSessionProperties: noop,
  track: noop,
  updateUserProperties: noop,
});

interface TrackerProviderProps {
  tracker: ITracker;
  children: ReactNode;
}

export const TrackerProvider: FC<TrackerProviderProps> = ({ tracker, children }) => {
  return (
    <TrackerContext.Provider value={tracker}>
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => {
  const tracker = useContext(TrackerContext);

  if (!tracker) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }

  return tracker;
};
