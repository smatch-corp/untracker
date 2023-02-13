import {
  IdentifyOptions,
  IProvider,
  ITracker,
  Options,
  TrackerProviderName,
  TrackOptions,
  UpdateUserPropertiesOptions,
} from './interface.js';

export interface TrackerOptions {
  providers: IProvider[];
}

export class Tracker implements ITracker {
  #providers: Map<string, IProvider>;
  #initialized: Promise<void>;
  #sessionProperties: Record<string, any> = {};

  constructor(options: TrackerOptions) {
    this.#providers = new Map();
    for (const provider of options.providers) {
      if (this.#providers.has(provider.name)) {
        throw new Error(`Provider name "${provider.name}" is already in use. Provider names must be unique.`);
      }

      this.#providers.set(provider.name, provider);
    }

    this.#initialized = this.init();
  }

  private async init() {
    const initPromises: Promise<unknown>[] = [];

    for (const provider of this.#providers.values()) {
      const initPromise = Promise.race([
        provider.init(),
        new Promise((_resolve, reject) =>
          setTimeout(reject, 3000, `Provider ${provider.name} is timeout during initalize.`)
        ),
      ]).catch((rejected) => {
        const message: string = typeof rejected === 'string'
          ? `Reason: ${rejected}`
          : rejected instanceof Error
          ? `Caused by:\n  ${rejected.stack}`
          : `Unknown: ${rejected}`;

        console.error(`Provider ${provider.name} is not initialized. ${message}`);

        this.#providers.delete(provider.name);
      });

      initPromises.push(initPromise);
    }

    await Promise.all(initPromises);
  }

  private filterProviders(options: Options) {
    if (options.includes && options.excludes) {
      throw new Error('Cannot set both "includes" and "excludes" options. Choose one or none.');
    }

    const providers = Array.from(this.#providers.values());

    if (options.includes) {
      return providers.filter(
        provider => !!options.includes![provider.name as TrackerProviderName],
      );
    }

    if (options.excludes) {
      return providers.filter(
        provider => !options.excludes![provider.name as TrackerProviderName],
      );
    }

    return providers;
  }

  private getEventProperties = <
    EventProperties extends Record<string, any> = {},
    SessionProperties extends Record<string, any> = {},
  >(options: TrackOptions<EventProperties, SessionProperties>): EventProperties & SessionProperties => {
    Object.assign(this.#sessionProperties, options.sessionProperties);

    return {
      ...this.#sessionProperties,
      ...options.properties,
    } as EventProperties & SessionProperties;
  };

  track = <
    EventName extends string = string,
    EventProperties extends Record<string, any> = {},
    SessionProperties extends Record<string, any> = {},
  >(eventName: EventName, options: TrackOptions<EventProperties, SessionProperties> = {}) => {
    this.#initialized.then(() => {
      const trackers = this.filterProviders(options);
      const eventProperties = this.getEventProperties(options);

      trackers.forEach(provider => {
        provider.onTrack(eventName, eventProperties, options, {});
      });
    });
  };

  identify = (id: string, options: IdentifyOptions = {}) => {
    this.#initialized.then(() => {
      const trackers = this.filterProviders(options);

      trackers.forEach(provider => {
        provider.onIdentify(id, options, {});
      });
    });
  };

  updateUserProperties = <UserProperties extends Record<string, any> = {}>(
    userProperties: UserProperties,
    options: UpdateUserPropertiesOptions = {},
  ) => {
    this.#initialized.then(() => {
      const trackers = this.filterProviders(options);

      trackers.forEach(provider => {
        provider.onUpdateUserProperties(userProperties, options, {});
      });
    });
  };

  clearSessionProperties = () => {
    this.#sessionProperties = {};
  };
}
