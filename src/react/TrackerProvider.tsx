import { createContext, FC, ReactNode, useContext } from 'react';
import { ITracker } from '../interface.js';

const TrackerContext = createContext<ITracker>(null as never);

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
