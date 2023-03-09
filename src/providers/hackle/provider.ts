import { HackleReactSDKClient } from '@hackler/react-sdk/lib/client.js';
import type { IProvider } from '../../core/interface.js';
import './global-types.js';

export interface HackleProviderOptions {
  hackleClient: HackleReactSDKClient;
}

export const hackle = (providerOptions: HackleProviderOptions): IProvider => {
  return {
    name: 'hackle',

    init() {
      return new Promise(resolve => {
        providerOptions.hackleClient.onReady(resolve);
      });
    },

    onIdentify(id, _options, _context) {
      providerOptions.hackleClient.setUserId(id);
    },

    onTrack(eventName, eventProperties, options, _context) {
      providerOptions.hackleClient.track({
        key: eventName,
        properties: eventProperties,
        value: options.hackle?.valueKey ? eventProperties[options.hackle.valueKey] : undefined,
      });
    },

    onUpdateUserProperties(userProperties, _options, _context) {
      for (const [key, value] of Object.entries(userProperties)) {
        providerOptions.hackleClient.setUserProperty(key, value);
      }
    },
  };
};
