import type { RequestOptions } from 'mixpanel-browser';

declare global {
  export namespace TrackerTypes {
    export interface TrackerProviders {
      mixpanel: true;
    }

    export interface TrackerContext {
    }

    export interface TrackOptions<
      EventProperties extends Record<string, any> = {},
      SessionProperties extends Record<string, any> = {},
    > {
      mixpanel?: RequestOptions;
    }
  }
}
