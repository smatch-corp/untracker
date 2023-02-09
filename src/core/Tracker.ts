import { IProvider, ITracker, TrackerProviderName, TrackOptions } from '../interface.js';

export interface TrackerOptions {
  providers: IProvider[];
}

export class Tracker implements ITracker {
  #providers: Map<string, IProvider>;
  #initialized: Promise<void>;

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

  private filterProviders(trackOptions: TrackOptions<any, any>) {
    if (trackOptions.includes && trackOptions.excludes) {
      throw new Error('Cannot set both "includes" and "excludes" options. Choose one or none.');
    }

    if (trackOptions.includes) {
      return Array.from(this.#providers.values())
        .filter(provider => !!trackOptions.includes![provider.name as TrackerProviderName]);
    }

    if (trackOptions.excludes) {
      return Array.from(this.#providers.values())
        .filter(provider => !trackOptions.excludes![provider.name as TrackerProviderName]);
    }

    return Array.from(this.#providers.values());
  }

  track = <
    EventName extends string = string,
    EventProperties extends Record<string, any> = {},
    SessionProperties extends Record<string, any> = {},
  >(eventName: EventName, trackOptions: TrackOptions<EventProperties, SessionProperties>) => {
    this.#initialized.then(() => {
      const trackers = this.filterProviders(trackOptions);

      const eventProperties = {
        ...trackOptions.sessionProperties,
        ...trackOptions.properties,
      } as EventProperties & SessionProperties;

      trackers.forEach(provider => {
        provider.onTrack(eventName, eventProperties, trackOptions, {});
      });
    });
  };

  onMerge(): void {
    throw new Error('Method not implemented.');
  }

  onIdentify(): void {
    throw new Error('Method not implemented.');
  }

  onUpdateUserProperties(): void {
    throw new Error('Method not implemented.');
  }
}
