import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tracker } from '../../core/Tracker.js';
import { ga4 } from './provider.js';

beforeEach(() => {
  vi.useFakeTimers();
  window.dataLayer = { push: vi.fn() };
});

afterEach(() => {
  vi.useRealTimers();
});

const tagId = 'UA-123456789-1';

const setup = () => {
  const tracker = new Tracker({
    providers: [
      ga4({ tagId }),
    ],
  });
};

describe('init', () => {
  it('should call gtag with "js" and "config" arguments', async () => {
    setup();
    await vi.runAllTimersAsync();

    expect(window.dataLayer.push).toHaveBeenCalledWith(['js', expect.any(Date)]);
    expect(window.dataLayer.push).toHaveBeenCalledWith(['config', tagId]);
  });
});

// describe('track', () => {});
