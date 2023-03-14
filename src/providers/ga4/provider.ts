import { IProvider } from '../../core/interface.js';
import './global-types.js';

export interface GA4ProviderOptions {
  // The Google Analytics tracking ID
  tagId: string;
}

export const ga4 = (ga4Options: GA4ProviderOptions): IProvider => {
  function gtag(...args: any[]) {
    (window as any).dataLayer ||= [];
    (window as any).dataLayer.push(args);
  }

  return {
    name: 'ga4',

    onIdentify(id, _options, _context) {
      gtag('config', ga4Options.tagId, {
        user_id: id,
      });
    },

    onTrack(eventName, eventProperties, _options, _context) {
      gtag('event', eventName, eventProperties);
    },
  };
};
