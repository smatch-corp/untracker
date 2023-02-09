import { IProvider } from '../../interface.js';
import './types.js';

export interface GoogleAnalyticsOptions {
  // The Google Analytics tracking ID
  tagId: string;
}

export const googleAnalytics = (options: GoogleAnalyticsOptions): IProvider => {
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }

  return {
    name: 'googleAnalytics',

    init() {
      gtag('js', new Date());
      gtag('config', options.tagId);
    },

    onIdentify() {
    },

    onTrack(eventName, eventProperties, trackOptions, _context) {
      gtag('event', eventName, {
        ...eventProperties,
        event_category: trackOptions.googleAnalytics?.eventCategoryKey
          ? eventProperties[trackOptions.googleAnalytics.eventCategoryKey]
          : undefined,
        event_label: trackOptions.googleAnalytics?.eventLabelKey
          ? eventProperties[trackOptions.googleAnalytics.eventLabelKey]
          : undefined,
        value: trackOptions.googleAnalytics?.eventValueKey
          ? eventProperties[trackOptions.googleAnalytics.eventValueKey]
          : undefined,
      });
    },

    onMerge() {
    },

    onUpdateUserProperties() {
    },
  };
};
