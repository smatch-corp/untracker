import { PickProperties } from 'ts-essentials';

declare global {
  export namespace TrackerTypes {
    export interface TrackerProviders {
      hackle: true;
    }

    export interface TrackerContext {
    }

    export interface TrackOptions<
      EventProperties extends Record<string, any> = {},
      SessionProperties extends Record<string, any> = {},
    > {
      hackle?: {
        valueKey?: keyof PickProperties<EventProperties & SessionProperties, number>;
      };
    }
  }
}
