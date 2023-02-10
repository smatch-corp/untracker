import type { ConditionalKeys } from 'type-fest';

declare global {
  interface Window {
    dataLayer: {
      push: (...args: any[]) => void;
    };
  }

  export namespace TrackerTypes {
    export interface TrackerProviders {
      ga4: true;
    }

    export interface TrackerContext {
    }

    export interface TrackOptions<
      EventProperties extends Record<string, any> = {},
      SessionProperties extends Record<string, any> = {},
    > {
      ga4?: {
        eventCategoryKey?: keyof (EventProperties & SessionProperties);
        eventLabelKey?: keyof (EventProperties & SessionProperties);
        eventValueKey?: ConditionalKeys<EventProperties & SessionProperties, number>;
      };
    }
  }
}

export {};
