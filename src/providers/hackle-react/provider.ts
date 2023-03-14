import { HackleReactSDKClient } from '@hackler/react-sdk/lib/client.js';
import type { IProvider } from '../../core/interface.js';
import './global-types.js';

export interface HackleReactProviderOptions {
  hackleReactClient: HackleReactSDKClient;
}

export const hackleReact = (providerOptions: HackleReactProviderOptions): IProvider => {
  const { hackleReactClient: hackle } = providerOptions;

  return {
    name: 'hackleReact',

    init() {
      return new Promise(resolve => {
        hackle.onReady(resolve);
      });
    },

    onIdentify(id, _options, _context) {
      hackle.setUserId(id);
    },

    onTrack(eventName, eventProperties, options, _context) {
      hackle.track({
        key: eventName,
        properties: eventProperties,
        value: options.hackleReact?.valueKey ? eventProperties[options.hackleReact.valueKey] : undefined,
      });
    },

    onUpdateUserProperties(userProperties, _options, _context) {
      for (const [key, value] of Object.entries(userProperties)) {
        hackle.setUserProperty(key, value);
      }
    },

    onReset() {
      hackle.resetUser();
    },
  };
};
