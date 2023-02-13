import { afterEach, beforeEach, describe, expect, it, Mock, SpyInstance, vi } from 'vitest';
import { IProvider } from './interface.js';
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
      init: vi.fn(() => {}),
      onIdentify: vi.fn(),
      onUpdateUserProperties: vi.fn(),
      onTrack: vi.fn(),
    },
    bar: {
      name: barProviderName,
      init: vi.fn(() => {}),
      onIdentify: vi.fn(),
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

  it('should throw error if provider name is not unique', () => {
    const { createTracker, mockProvider } = setup();

    mockProvider.foo.name = 'bar';

    expect(createTracker).toThrowErrorMatchingInlineSnapshot(
      '"Provider name \\"bar\\" is already in use. Provider names must be unique."',
    );
  });

  it('should remove provider if isReady timeout (3s)', async () => {
    const { createTracker, mockProvider } = setup();

    (mockProvider.foo.init as unknown as SpyInstance)
      .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 3001)));

    const tracker = createTracker();
    await vi.advanceTimersByTimeAsync(3000);

    tracker.track('test', {
      properties: { foo: 'bar' },
    });
    await vi.runOnlyPendingTimersAsync();

    expect(mockProvider.foo.onTrack).toHaveBeenCalledTimes(0);

    expect(mockProvider.bar.onTrack).toHaveBeenCalledTimes(1);
    expect(mockProvider.bar.onTrack).toMatchSnapshot();
  });

  it('should keep provider if isReady resolved in 3s', async () => {
    const { createTracker, mockProvider } = setup();

    (mockProvider.foo.init as unknown as SpyInstance)
      .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 2999)));

    const tracker = createTracker();
    await vi.advanceTimersByTimeAsync(3000);

    tracker.track('test', {
      properties: { foo: 'bar' },
    });
    await vi.runOnlyPendingTimersAsync();

    expect(mockProvider.foo.onTrack).toHaveBeenCalledTimes(1);
    expect(mockProvider.foo.onTrack).toMatchSnapshot();

    expect(mockProvider.bar.onTrack).toHaveBeenCalledTimes(1);
    expect(mockProvider.bar.onTrack).toMatchSnapshot();
  });

  it('should remove provider if isReady throw error', async () => {
    const { createTracker, mockProvider } = setup();

    (mockProvider.foo.init as unknown as SpyInstance)
      .mockRejectedValue(new Error('Unknown Error.'));

    const tracker = createTracker();
    tracker.track('test', {
      properties: { foo: 'bar' },
    });
    await vi.runOnlyPendingTimersAsync();

    expect(mockProvider.foo.onTrack).toHaveBeenCalledTimes(0);

    expect(mockProvider.bar.onTrack).toHaveBeenCalledTimes(1);
    expect(mockProvider.bar.onTrack).toMatchSnapshot();
  });

  it("should call providers' isReady once", async () => {
    const { createTracker, mockProvider } = setup();

    const tracker = createTracker();
    tracker.track('test', {});
    await vi.runAllTimersAsync();

    expect(mockProvider.foo.init).toHaveBeenCalledTimes(1);
    expect(mockProvider.foo.onTrack).toHaveBeenCalledTimes(1);

    tracker.track('test', {});
    await vi.runAllTimersAsync();

    expect(mockProvider.foo.init).toHaveBeenCalledTimes(1);
    expect(mockProvider.foo.onTrack).toHaveBeenCalledTimes(2);

    tracker.track('test', {});
    await vi.runAllTimersAsync();

    expect(mockProvider.foo.init).toHaveBeenCalledTimes(1);
    expect(mockProvider.foo.onTrack).toHaveBeenCalledTimes(3);
  });
});

describe('track', () => {
  it("should call every providers' track methods", async () => {
    const { createTracker, mockProvider } = setup();

    const tracker = createTracker();

    tracker.track('test', {
      properties: { foo: 'bar' },
    });

    await vi.runAllTimersAsync();

    expect(mockProvider.foo.onTrack).toHaveBeenCalledTimes(1);
    expect(mockProvider.foo.onTrack).toMatchSnapshot();

    expect(mockProvider.bar.onTrack).toHaveBeenCalledTimes(1);
    expect(mockProvider.bar.onTrack).toMatchSnapshot();
  });

  it('should not call track method of provider which not specified in trackerOptions.includes', async () => {
    const { createTracker, mockProvider } = setup();

    const tracker = createTracker();
    tracker.track('test', {
      properties: { foo: 'bar' },
      includes: { bar: true },
    });

    await vi.runAllTimersAsync();

    expect(mockProvider.foo.onTrack).toHaveBeenCalledTimes(0);

    expect(mockProvider.bar.onTrack).toHaveBeenCalledTimes(1);
    expect(mockProvider.bar.onTrack).toMatchSnapshot();
  });

  describe('sessionProperties', () => {
    it('should store sessionProperties in tracker and merge properties', async () => {
      const { createTracker, mockProvider } = setup();

      const tracker = createTracker();

      tracker.track('test', {
        properties: { productId: '1' },
        sessionProperties: { userId: '2' },
      });

      await vi.runAllTimersAsync();

      expect(mockProvider.foo.onTrack).toMatchSnapshot();

      tracker.track('test', {
        properties: { productId: '2' },
      });

      await vi.runAllTimersAsync();

      expect(mockProvider.bar.onTrack).toMatchSnapshot();
    });

    it('should clear sessionProperties after call clearSessionProperties', async () => {
      const { createTracker, mockProvider } = setup();

      const tracker = createTracker();

      tracker.track('test', {
        properties: { productId: '1' },
        sessionProperties: { userId: '2' },
      });

      await vi.runAllTimersAsync();

      expect(mockProvider.foo.onTrack).toMatchSnapshot();

      tracker.clearSessionProperties();

      tracker.track('test', {
        properties: { productId: '2' },
      });

      await vi.runAllTimersAsync();

      expect(mockProvider.bar.onTrack).toMatchSnapshot();
    });
  });
});
