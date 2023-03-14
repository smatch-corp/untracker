import type Mixpanel from 'mixpanel-browser';
import type { IProvider } from '../../core/interface.js';
import './global-types.js';

export interface MixpanelProviderOptions {
  token: string;
  config?: Partial<Mixpanel.Config>;
}

export const mixpanel = (providerOptions: MixpanelProviderOptions): IProvider => {
  const { token, config } = providerOptions;
  let instance: Mixpanel.Mixpanel = null as never;

  return {
    name: 'mixpanel',

    init() {
      return new Promise(resolve => {
        import('mixpanel-browser').then($mixpanel => {
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
      instance.alias(id, originalDistinctId);
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
