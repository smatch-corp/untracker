import { Config as MixpanelConfig, Mixpanel } from 'mixpanel-browser';
import type { IProvider } from '../../core/interface.js';
import './global-types.js';

export interface MixpanelProviderOptions {
  token: string;
  config?: Partial<MixpanelConfig>;
}

export const mixpanel = (providerOptions: MixpanelProviderOptions): IProvider => {
  const { token, config } = providerOptions;
  let instance: Mixpanel = null as never;

  return {
    name: 'mixpanel',

    init() {
      return new Promise(resolve => {
        import('mixpanel-browser').then(({ default: $mixpanel }) => {
          $mixpanel.init(token, {
            ...config,
            loaded($instance) {
              instance = $instance;
              config?.loaded?.(instance);

              resolve();
            },
          });
        });
      });
    },

    onIdentify(id, _options, _context) {
      const originalDistinctId = instance.get_distinct_id();
      instance.identify(id);

      if (originalDistinctId && originalDistinctId !== id) {
        instance.alias(id, originalDistinctId);
      }
    },

    onTrack(eventName, eventProperties, options, _context) {
      instance.track(eventName, eventProperties, options.mixpanel);
    },

    onUpdateUserProperties(userProperties, _options, _context) {
      instance.people.set(userProperties);
    },

    onReset() {
      instance.reset();
    },
  };
};
