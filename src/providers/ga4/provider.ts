import { IProvider } from '../../core/interface.js';
import './global-types.js';

export interface GA4ProviderOptions {
  // The Google Analytics tracking ID
  tagId: string;
}

export const ga4 = (options: GA4ProviderOptions): IProvider => {
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }

  return {
    name: 'ga4',

    init() {
      gtag('js', new Date());
      gtag('config', options.tagId);
    },

    onIdentify(_id, _options, _context) {
    },

    onTrack(eventName, eventProperties, options, _context) {
      gtag('event', eventName, {
        ...eventProperties,
        event_category: options.ga4?.eventCategoryKey
          ? eventProperties[options.ga4.eventCategoryKey]
          : undefined,
        event_label: options.ga4?.eventLabelKey
          ? eventProperties[options.ga4.eventLabelKey]
          : undefined,
        value: options.ga4?.eventValueKey
          ? eventProperties[options.ga4.eventValueKey]
          : undefined,
      });
    },

    onUpdateUserProperties(_userProperties, _options, _context) {
    },
  };
};
