import './global-types.js';

export type TrackerProviderName = keyof TrackerTypes.TrackerProviders;

export interface Options {
  includes?: Partial<Record<TrackerProviderName, true>>;
  excludes?: Partial<Record<TrackerProviderName, true>>;
}

export interface TrackOptions<
  EventProperties extends Record<string, any> = {},
  SessionProperties extends Record<string, any> = {},
> extends Options, TrackerTypes.TrackOptions<EventProperties, SessionProperties> {
  properties?: EventProperties;
  sessionProperties?: SessionProperties;
}

export interface IdentifyOptions extends Options, TrackerTypes.IdentifyOptions {
}

export interface UpdateUserPropertiesOptions<
  UserProperties extends Record<string, any> = {},
> extends Options, TrackerTypes.UpdateUserPropertiesOptions<UserProperties> {
}

export interface ResetOptions extends Options, TrackerTypes.ResetOptions {
}

export interface IProvider {
  name: string;

  init?: () => void | Promise<void>;

  onTrack?: <
    EventProperties extends Record<string, any> = {},
    SessionProperties extends Record<string, any> = {},
  >(
    eventName: string,
    eventProperties: EventProperties & SessionProperties,
    options: TrackOptions<EventProperties, SessionProperties>,
    context: TrackerTypes.TrackerContext,
  ) => void;

  onIdentify?: (
    id: string,
    options: IdentifyOptions,
    context: TrackerTypes.TrackerContext,
  ) => void;

  onUpdateUserProperties?: <
    UserProperties extends Record<string, any> = {},
  >(
    userProperties: UserProperties,
    options: UpdateUserPropertiesOptions<UserProperties>,
    context: TrackerTypes.TrackerContext,
  ) => void;

  onReset?: (options?: ResetOptions) => void;
}

export interface ITracker {
  track: <
    EventName extends string = string,
    EventProperties extends Record<string, any> = {},
    SessionProperties extends Record<string, any> = {},
  >(eventName: EventName, options?: TrackOptions<EventProperties, SessionProperties>) => Promise<void>;

  identify: (id: string, options?: IdentifyOptions) => Promise<void>;

  updateUserProperties: <
    UserProperties extends Record<string, any> = {},
  >(userProperties: UserProperties, options?: UpdateUserPropertiesOptions<UserProperties>) => Promise<void>;

  reset: (options?: ResetOptions) => Promise<void>;

  setSessionProperties: (sessionProperties: Record<string, any>) => Promise<void>;

  deleteSessionProperty: (key: string) => Promise<void>;

  clearSessionProperties: () => Promise<void>;
}
