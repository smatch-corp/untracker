import { afterEach, beforeEach, describe, expect, it, SpyInstance, vi } from 'vitest';
import { IProvider } from '../interface.js';
import { Tracker } from './Tracker.js';

const fooProviderName = 'foo' as const;
const barProviderName = 'bar' as const;

declare global {
  export namespace TrackerTypes {
    export interface TrackerProviders {
      [fooProviderName]: true;
      [barProviderName]: true;
    }
  }
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const setup = () => {
  const mockProviders: Record<'foo' | 'bar', IProvider> = {
    foo: {
      name: fooProviderName,
      init: vi.fn(() => true),
      onIdentify: vi.fn(),
      onMerge: vi.fn(),
      onUpdateUserProperties: vi.fn(),
      onTrack: vi.fn(),
    },
    bar: {
      name: barProviderName,
      init: vi.fn(() => true),
      onIdentify: vi.fn(),
      onMerge: vi.fn(),
      onUpdateUserProperties: vi.fn(),
      onTrack: vi.fn(),
    },
  };

  const createTracker = () => {
    return new Tracker({
      providers: [mockProviders.foo, mockProviders.bar],
    });
  };

  return { createTracker, mockProvider: mockProviders };
};

describe('init', () => {
  it("should call every providers' isReady methods", () => {
    const { createTracker, mockProvider } = setup();

    createTracker();

    expect(mockProvider.foo.init).toHaveBeenCalled();
    expect(mockProvider.bar.init).toHaveBeenCalled();
  });

  it('should remove provider if isReady return false', async () => {
    const { createTracker, mockProvider } = setup();

    (mockProvider.foo.init as unknown as SpyInstance)
      .mockReturnValue(false);

    const tracker = createTracker();
    tracker.onTrack('test', {
      properties: { foo: 'bar' },
    });
    await vi.runOnlyPendingTimersAsync();

    expect(mockProvider.foo.onTrack).toHaveBeenCalledTimes(0);
    expect(mockProvider.bar.onTrack).toHaveBeenCalledTimes(1);
    expect(mockProvider.bar.onTrack).toHaveBeenCalledWith('test', {
      properties: { foo: 'bar' },
    });
  });

  it('should remove provider if isReady throw error', async () => {
    const { createTracker, mockProvider } = setup();

    (mockProvider.foo.init as unknown as SpyInstance)
      .mockRejectedValue(new Error('Unknown Error.'));

    const tracker = createTracker();
    tracker.onTrack('test', {
      properties: { foo: 'bar' },
    });
    await vi.runOnlyPendingTimersAsync();

    expect(mockProvider.foo.onTrack).toHaveBeenCalledTimes(0);
    expect(mockProvider.bar.onTrack).toHaveBeenCalledTimes(1);
    expect(mockProvider.bar.onTrack).toHaveBeenCalledWith('test', {
      properties: { foo: 'bar' },
    });
  });

  it("should call providers' isReady once", async () => {
    const { createTracker, mockProvider } = setup();

    const tracker = createTracker();
    tracker.onTrack('test', {});
    await vi.runAllTimersAsync();

    expect(mockProvider.foo.init).toHaveBeenCalledTimes(1);
    expect(mockProvider.bar.onTrack).toHaveBeenCalledTimes(1);

    tracker.onTrack('test', {});
    await vi.runAllTimersAsync();

    expect(mockProvider.foo.init).toHaveBeenCalledTimes(1);
    expect(mockProvider.bar.onTrack).toHaveBeenCalledTimes(2);

    tracker.onTrack('test', {});
    await vi.runAllTimersAsync();

    expect(mockProvider.foo.init).toHaveBeenCalledTimes(1);
    expect(mockProvider.bar.onTrack).toHaveBeenCalledTimes(3);
  });
});

describe('track', () => {
  it("should call every providers' track methods", async () => {
    const { createTracker, mockProvider } = setup();

    const tracker = createTracker();

    tracker.onTrack('test', {
      properties: { foo: 'bar' },
    });

    await vi.runAllTimersAsync();

    expect(mockProvider.foo.onTrack).toHaveBeenCalledTimes(1);
    expect(mockProvider.foo.onTrack).toHaveBeenCalledWith('test', {
      properties: { foo: 'bar' },
    });
    expect(mockProvider.bar.onTrack).toHaveBeenCalledTimes(1);
    expect(mockProvider.bar.onTrack).toHaveBeenCalledWith('test', {
      properties: { foo: 'bar' },
    });
  });

  it('should not call track method of provider which not specified in trackerOptions.includes', async () => {
    const { createTracker, mockProvider } = setup();

    const tracker = createTracker();
    tracker.onTrack('test', {
      properties: { foo: 'bar' },
      includes: { bar: true },
    });

    await vi.runAllTimersAsync();

    expect(mockProvider.foo.onTrack).toHaveBeenCalledTimes(0);
    expect(mockProvider.bar.onTrack).toHaveBeenCalledTimes(1);
    expect(mockProvider.bar.onTrack).toHaveBeenCalledWith('test', {
      properties: { foo: 'bar' },
      includes: { bar: true },
    });
  });
});
