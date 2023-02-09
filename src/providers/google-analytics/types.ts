import type { ConditionalKeys } from 'type-fest';

declare global {
  interface Window {
    dataLayer: {
      push: (...args: any[]) => void;
    };
  }

  export namespace TrackerTypes {
    export interface TrackerProviders {
    }

    export interface TrackerContext {
    }

    export interface TrackOptions<
      EventProperties extends Record<string, any> = {},
      SessionProperties extends Record<string, any> = {},
    > {
      googleAnalytics?: {
        eventCategoryKey?: keyof (EventProperties & SessionProperties);
        eventLabelKey?: keyof (EventProperties & SessionProperties);
        eventValueKey?: ConditionalKeys<EventProperties & SessionProperties, number>;
      };
    }
  }
}

export {};
