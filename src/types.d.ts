declare global {
  export namespace TrackerTypes {
    export interface TrackerProviders {
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
