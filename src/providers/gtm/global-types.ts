declare global {
  interface Window {
    dataLayer: {
      push: (...args: any[]) => void;
    };
  }

  export namespace TrackerTypes {
    export interface TrackerProviders {
      gtm: true;
    }

    export interface TrackerContext {
    }

    export interface TrackOptions<
      EventProperties extends Record<string, any> = {},
      SessionProperties extends Record<string, any> = {},
    > {
    }
  }
}

export {};
