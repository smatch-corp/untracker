import './types.js';

export interface TrackerContext extends TrackerTypes.TrackerContext {
}

export type TrackerProviderName = keyof TrackerTypes.TrackerProviders;

export interface TrackOptions<
  EventProperties extends Record<string, any> = {},
  SessionProperties extends Record<string, any> = {},
> extends TrackerTypes.TrackOptions<EventProperties, SessionProperties> {
  properties?: EventProperties;
  sessionProperties?: SessionProperties;
  includes?: Partial<Record<TrackerProviderName, true>>;
  excludes?: Partial<Record<TrackerProviderName, true>>;
}

export interface IProvider {
  name: string;

  init(): void | Promise<void>;

  onTrack: <
    EventProperties extends Record<string, any> = {},
    SessionProperties extends Record<string, any> = {},
  >(
    eventName: string,
    eventProperties: EventProperties & SessionProperties,
    trackOptions: TrackOptions<EventProperties, SessionProperties>,
    context: TrackerContext,
  ) => void;

  onMerge: () => void;

  onIdentify: () => void;

  onUpdateUserProperties: () => void;
}

export interface ITracker {
  track: <
    EventName extends string = string,
    EventProperties extends Record<string, any> = {},
    SessionProperties extends Record<string, any> = {},
  >(eventName: EventName, trackOptions: TrackOptions<EventProperties, SessionProperties>) => void;
}
