import { PickProperties } from 'ts-essentials';

declare global {
  export namespace TrackerTypes {
    export interface TrackerProviders {
      hackleReact: true;
    }

    export interface TrackerContext {
    }

    export interface TrackOptions<
      EventProperties extends Record<string, any> = {},
      SessionProperties extends Record<string, any> = {},
    > {
      hackleReact?: {
        valueKey?: keyof PickProperties<EventProperties & SessionProperties, number>;
      };
    }
  }
}
