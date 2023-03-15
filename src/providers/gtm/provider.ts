import { IProvider } from '../../core/interface.js';
import './global-types.js';

export interface GTMProviderOptions {
  identifyKey?: string;
}

export const gtm = (providerOptions?: GTMProviderOptions): IProvider => {
  function dataLayer(...args: any[]) {
    (window as any).dataLayer ||= [];
    (window as any).dataLayer.push(...args);
  }

  let $id: string | undefined = undefined;

  return {
    name: 'gtm',

    onIdentify(id, _options, _context) {
      $id = id;
    },

    onReset() {
      $id = undefined;
    },

    onTrack(eventName, eventProperties, _options, _context) {
      dataLayer({
        event: eventName,
        ...Object.assign(eventProperties, { [providerOptions?.identifyKey ?? 'userId']: $id }),
      });
    },
  };
};
