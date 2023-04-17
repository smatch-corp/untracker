import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
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
  const provider = mock<Required<IProvider>>({
    name: 'foo',
  });

  const createTracker = (providers: () => IProvider[] = () => [provider]) => {
    return new Tracker({ providers });
  };

  return { createTracker, provider };
};

describe('init', () => {
  it("should call every providers' isReady methods", () => {
    const { createTracker, provider } = setup();

    createTracker();

    expect(provider.init).toHaveBeenCalled();
  });

  it('should throw error if provider name is not unique', () => {
    const { createTracker, provider } = setup();

    const duplicatedProvider = mock<Required<IProvider>>({
      name: provider.name,
    });

    expect(() => createTracker(() => [provider, duplicatedProvider])).toThrowErrorMatchingInlineSnapshot(
      '"Provider name \\"foo\\" is already in use. Provider names must be unique."',
    );
  });

  it('should remove provider if isReady timeout (3s)', async () => {
    const { createTracker, provider } = setup();

    provider.init.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 3001)),
    );

    const tracker = createTracker();
    await vi.advanceTimersByTimeAsync(3000);

    tracker.track('test', {
      properties: { foo: 'bar' },
    });
    await vi.runOnlyPendingTimersAsync();

    expect(provider.onTrack).toHaveBeenCalledTimes(0);
  });

  it('should keep provider if isReady resolved in 3s', async () => {
    const { createTracker, provider } = setup();

    provider.init.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 2999)),
    );

    const tracker = createTracker();
    await vi.advanceTimersByTimeAsync(3000);

    tracker.track('test', {
      properties: { foo: 'bar' },
    });
    await vi.runOnlyPendingTimersAsync();

    expect(provider.onTrack).toHaveBeenCalledTimes(1);
    expect(provider.onTrack.mock.lastCall).toMatchInlineSnapshot(`
      [
        "test",
        {
          "foo": "bar",
        },
        {
          "properties": {
            "foo": "bar",
          },
        },
        {},
      ]
    `);
  });

  it('should remove provider if isReady throw error', async () => {
    const { createTracker, provider } = setup();

    provider.init.mockRejectedValue(new Error('Unknown Error.'));

    const tracker = createTracker();
    tracker.track('test', {
      properties: { foo: 'bar' },
    });
    await vi.runOnlyPendingTimersAsync();

    expect(provider.onTrack).toHaveBeenCalledTimes(0);
  });

  it("should call providers' isReady once", async () => {
    const { createTracker, provider } = setup();

    const tracker = createTracker();
    tracker.track('test', {});
    tracker.track('test', {});
    tracker.track('test', {});

    await vi.runAllTimersAsync();

    expect(provider.init).toHaveBeenCalledTimes(1);
    expect(provider.onTrack).toHaveBeenCalledTimes(3);
  });
});

describe('track', () => {
  it("should call every providers' track methods", async () => {
    const { createTracker, provider } = setup();
    const yetAnotherProvider = mock<Required<IProvider>>({
      name: 'yetAnotherProvider',
    });

    const tracker = createTracker(() => [provider, yetAnotherProvider]);

    tracker.track('test', {
      properties: { foo: 'bar' },
    });

    await vi.runAllTimersAsync();

    expect(provider.onTrack).toHaveBeenCalledTimes(1);
    expect(provider.onTrack.mock.lastCall).toMatchInlineSnapshot(`
      [
        "test",
        {
          "foo": "bar",
        },
        {
          "properties": {
            "foo": "bar",
          },
        },
        {},
      ]
    `);

    expect(yetAnotherProvider.onTrack).toHaveBeenCalledTimes(1);
    expect(yetAnotherProvider.onTrack.mock.lastCall).toMatchInlineSnapshot(`
      [
        "test",
        {
          "foo": "bar",
        },
        {
          "properties": {
            "foo": "bar",
          },
        },
        {},
      ]
    `);
  });

  it('should not call track method of provider which not specified in trackerOptions.includes', async () => {
    const { createTracker, provider: fooProvider } = setup();
    const barProvider = mock<Required<IProvider>>({
      name: 'bar',
    });

    const tracker = createTracker(() => [fooProvider, barProvider]);
    tracker.track('test', {
      properties: { foo: 'bar' },
      includes: { bar: true },
    });

    await vi.runAllTimersAsync();

    expect(fooProvider.onTrack).toHaveBeenCalledTimes(0);

    expect(barProvider.onTrack).toHaveBeenCalledTimes(1);
    expect(barProvider.onTrack.mock.lastCall).toMatchInlineSnapshot(`
      [
        "test",
        {
          "foo": "bar",
        },
        {
          "includes": {
            "bar": true,
          },
          "properties": {
            "foo": "bar",
          },
        },
        {},
      ]
    `);
  });

  it('should not call track method of provider which specified in trackerOptions.excludes', async () => {
    const { createTracker, provider: fooProvider } = setup();
    const barProvider = mock<Required<IProvider>>({
      name: 'bar',
    });

    const tracker = createTracker(() => [fooProvider, barProvider]);
    tracker.track('test', {
      properties: { foo: 'bar' },
      excludes: { bar: true },
    });

    await vi.runAllTimersAsync();

    expect(fooProvider.onTrack).toHaveBeenCalledTimes(1);
    expect(fooProvider.onTrack.mock.lastCall).toMatchInlineSnapshot(`
      [
        "test",
        {
          "foo": "bar",
        },
        {
          "excludes": {
            "bar": true,
          },
          "properties": {
            "foo": "bar",
          },
        },
        {},
      ]
    `);

    expect(barProvider.onTrack).toHaveBeenCalledTimes(0);
    expect(barProvider.onTrack.mock.lastCall).toMatchInlineSnapshot('undefined');
  });

  describe('sessionProperties', () => {
    it('should store sessionProperties in tracker and merge properties', async () => {
      const { createTracker, provider } = setup();

      const tracker = createTracker();

      tracker.track('test', {
        properties: { productId: '1' },
        sessionProperties: { userId: '2' },
      });

      await vi.runAllTimersAsync();

      expect(provider.onTrack.mock.lastCall).toMatchInlineSnapshot(`
        [
          "test",
          {
            "productId": "1",
            "userId": "2",
          },
          {
            "properties": {
              "productId": "1",
            },
            "sessionProperties": {
              "userId": "2",
            },
          },
          {},
        ]
      `);

      tracker.track('test', {
        properties: { productId: '2' },
      });

      await vi.runAllTimersAsync();

      expect(provider.onTrack.mock.lastCall).toMatchInlineSnapshot(`
        [
          "test",
          {
            "productId": "2",
            "userId": "2",
          },
          {
            "properties": {
              "productId": "2",
            },
          },
          {},
        ]
      `);

      tracker.track('test', {
        properties: { productId: '3' },
        sessionProperties: { companyName: 'foo inc.' },
      });

      await vi.runAllTimersAsync();

      expect(provider.onTrack.mock.lastCall).toMatchInlineSnapshot(`
        [
          "test",
          {
            "companyName": "foo inc.",
            "productId": "3",
            "userId": "2",
          },
          {
            "properties": {
              "productId": "3",
            },
            "sessionProperties": {
              "companyName": "foo inc.",
            },
          },
          {},
        ]
      `);
    });

    it('should clear sessionProperties after call clearSessionProperties', async () => {
      const { createTracker, provider } = setup();

      const tracker = createTracker();

      tracker.track('test', {
        properties: { productId: '1' },
        sessionProperties: { userId: '2' },
      });

      await vi.runAllTimersAsync();

      expect(provider.onTrack.mock.lastCall).toMatchInlineSnapshot(`
        [
          "test",
          {
            "productId": "1",
            "userId": "2",
          },
          {
            "properties": {
              "productId": "1",
            },
            "sessionProperties": {
              "userId": "2",
            },
          },
          {},
        ]
      `);

      tracker.clearSessionProperties();

      tracker.track('test', {
        properties: { productId: '2' },
      });

      await vi.runAllTimersAsync();

      expect(provider.onTrack.mock.lastCall).toMatchInlineSnapshot(`
        [
          "test",
          {
            "productId": "2",
          },
          {
            "properties": {
              "productId": "2",
            },
          },
          {},
        ]
      `);
    });
  });
});

describe('identify', () => {
  it("should call every providers' identify methods", async () => {
    const { createTracker, provider: fooProvider } = setup();
    const barProvider = mock<Required<IProvider>>({
      name: 'bar',
    });

    const tracker = createTracker(() => [fooProvider, barProvider]);

    tracker.identify('test');

    await vi.runAllTimersAsync();

    expect(fooProvider.onIdentify).toHaveBeenCalledTimes(1);
    expect(fooProvider.onIdentify.mock.lastCall).toMatchInlineSnapshot(`
      [
        "test",
        {},
        {},
      ]
    `);

    expect(barProvider.onIdentify).toHaveBeenCalledTimes(1);
    expect(barProvider.onIdentify.mock.lastCall).toMatchInlineSnapshot(`
      [
        "test",
        {},
        {},
      ]
    `);
  });

  it('should not call identify method of provider which not specified in options.includes', async () => {
    const { createTracker, provider: fooProvider } = setup();
    const barProvider = mock<Required<IProvider>>({
      name: 'bar',
    });

    const tracker = createTracker(() => [fooProvider, barProvider]);
    tracker.identify('test', {
      includes: { bar: true },
    });

    await vi.runAllTimersAsync();

    expect(fooProvider.onIdentify).toHaveBeenCalledTimes(0);

    expect(barProvider.onIdentify).toHaveBeenCalledTimes(1);
    expect(barProvider.onIdentify.mock.lastCall).toMatchInlineSnapshot(`
      [
        "test",
        {
          "includes": {
            "bar": true,
          },
        },
        {},
      ]
    `);
  });

  it('should not call identify method of provider which specified in options.excludes', async () => {
    const { createTracker, provider: fooProvider } = setup();
    const barProvider = mock<Required<IProvider>>({
      name: 'bar',
    });

    const tracker = createTracker(() => [fooProvider, barProvider]);
    tracker.identify('test', {
      excludes: { bar: true },
    });

    await vi.runAllTimersAsync();

    expect(fooProvider.onIdentify).toHaveBeenCalledTimes(1);
    expect(fooProvider.onIdentify.mock.lastCall).toMatchInlineSnapshot(`
      [
        "test",
        {
          "excludes": {
            "bar": true,
          },
        },
        {},
      ]
    `);

    expect(barProvider.onIdentify).toHaveBeenCalledTimes(0);
    expect(barProvider.onIdentify.mock.lastCall).toMatchInlineSnapshot('undefined');
  });
});

describe('updateUserProperties', () => {
  it('should call every providers` updateUserProperties methods', async () => {
    const { createTracker, provider: fooProvider } = setup();
    const barProvider = mock<Required<IProvider>>({
      name: 'bar',
    });

    const tracker = createTracker(() => [fooProvider, barProvider]);
    tracker.updateUserProperties({ name: 'John' });

    await vi.runAllTimersAsync();

    expect(fooProvider.onUpdateUserProperties).toHaveBeenCalledTimes(1);
    expect(fooProvider.onUpdateUserProperties.mock.lastCall).toMatchInlineSnapshot(`
      [
        {
          "name": "John",
        },
        {},
        {},
      ]
    `);

    expect(barProvider.onUpdateUserProperties).toHaveBeenCalledTimes(1);
    expect(barProvider.onUpdateUserProperties.mock.lastCall).toMatchInlineSnapshot(`
      [
        {
          "name": "John",
        },
        {},
        {},
      ]
    `);
  });

  it('should not call updateUserProperties method of provider which not specified in options.includes', async () => {
    const { createTracker, provider: fooProvider } = setup();
    const barProvider = mock<Required<IProvider>>({
      name: 'bar',
    });

    const tracker = createTracker(() => [fooProvider, barProvider]);
    tracker.updateUserProperties({ name: 'John' }, {
      includes: { bar: true },
    });

    await vi.runAllTimersAsync();

    expect(fooProvider.onUpdateUserProperties).toHaveBeenCalledTimes(0);

    expect(barProvider.onUpdateUserProperties).toHaveBeenCalledTimes(1);
    expect(barProvider.onUpdateUserProperties.mock.lastCall).toMatchInlineSnapshot(`
      [
        {
          "name": "John",
        },
        {
          "includes": {
            "bar": true,
          },
        },
        {},
      ]
    `);
  });

  it('should not call updateUserProperties method of provider which specified in options.excludes', async () => {
    const { createTracker, provider: fooProvider } = setup();
    const barProvider = mock<Required<IProvider>>({
      name: 'bar',
    });

    const tracker = createTracker(() => [fooProvider, barProvider]);
    tracker.updateUserProperties({ name: 'John' }, {
      excludes: { bar: true },
    });

    await vi.runAllTimersAsync();

    expect(fooProvider.onUpdateUserProperties).toHaveBeenCalledTimes(1);
    expect(fooProvider.onUpdateUserProperties.mock.lastCall).toMatchInlineSnapshot(`
      [
        {
          "name": "John",
        },
        {
          "excludes": {
            "bar": true,
          },
        },
        {},
      ]
    `);

    expect(barProvider.onUpdateUserProperties).toHaveBeenCalledTimes(0);
    expect(barProvider.onUpdateUserProperties.mock.lastCall).toMatchInlineSnapshot('undefined');
  });
});

describe('setSessionProperties', () => {
  it('should track event with session properties', async () => {
    const { createTracker, provider } = setup();
    const tracker = createTracker();

    await tracker.setSessionProperties({ bar: true });
    tracker.track('test', { properties: { foo: 'bar' } });

    await vi.runAllTimersAsync();

    expect(provider.onTrack).toHaveBeenCalledTimes(1);
    expect(provider.onTrack.mock.lastCall).toMatchInlineSnapshot(`
      [
        "test",
        {
          "bar": true,
          "foo": "bar",
        },
        {
          "properties": {
            "foo": "bar",
          },
        },
        {},
      ]
    `);
  });
});

describe('deleteSessionProperty', () => {
  it('should delete specific session property', async () => {
    const { createTracker, provider } = setup();
    const tracker = createTracker();

    await tracker.setSessionProperties({ bar: true, zax: true });
    await tracker.deleteSessionProperty('zax');
    await vi.runAllTimersAsync();

    tracker.track('test', { properties: { foo: 'bar' } });
    await vi.runAllTimersAsync();

    expect(provider.onTrack).toHaveBeenCalledTimes(1);
    expect(provider.onTrack.mock.lastCall).toMatchInlineSnapshot(`
      [
        "test",
        {
          "bar": true,
          "foo": "bar",
        },
        {
          "properties": {
            "foo": "bar",
          },
        },
        {},
      ]
    `);
  });
});

describe('clearSessionProperties', () => {
  it('should clear session properties', async () => {
    const { createTracker, provider } = setup();
    const tracker = createTracker();

    await tracker.setSessionProperties({ bar: true, zax: true });
    await tracker.clearSessionProperties();

    tracker.track('test', { properties: { foo: 'bar' } });
    await vi.runAllTimersAsync();

    expect(provider.onTrack).toHaveBeenCalledTimes(1);
    expect(provider.onTrack.mock.lastCall).toMatchInlineSnapshot(`
      [
        "test",
        {
          "foo": "bar",
        },
        {
          "properties": {
            "foo": "bar",
          },
        },
        {},
      ]
    `);
  });
});

describe('reset', () => {
  it('should call every providers` reset methods', async () => {
    const { createTracker, provider: fooProvider } = setup();
    const barProvider = mock<Required<IProvider>>({
      name: 'bar',
    });

    const tracker = createTracker(() => [fooProvider, barProvider]);
    tracker.reset();

    await vi.runAllTimersAsync();

    expect(fooProvider.onReset).toHaveBeenCalledTimes(1);
    expect(fooProvider.onReset.mock.lastCall).toMatchInlineSnapshot('[]');

    expect(barProvider.onReset).toHaveBeenCalledTimes(1);
    expect(barProvider.onReset.mock.lastCall).toMatchInlineSnapshot('[]');
  });

  it('should not call reset method of provider which not specified in options.includes', async () => {
    const { createTracker, provider: fooProvider } = setup();
    const barProvider = mock<Required<IProvider>>({
      name: 'bar',
    });

    const tracker = createTracker(() => [fooProvider, barProvider]);
    tracker.reset({
      includes: { bar: true },
    });

    await vi.runAllTimersAsync();

    expect(fooProvider.onReset).toHaveBeenCalledTimes(0);

    expect(barProvider.onReset).toHaveBeenCalledTimes(1);
    expect(barProvider.onReset.mock.lastCall).toMatchInlineSnapshot('[]');
  });

  it('should not call reset method of provider which specified in options.excludes', async () => {
    const { createTracker, provider: fooProvider } = setup();
    const barProvider = mock<Required<IProvider>>({
      name: 'bar',
    });

    const tracker = createTracker(() => [fooProvider, barProvider]);
    tracker.reset({
      excludes: { bar: true },
    });

    await vi.runAllTimersAsync();

    expect(fooProvider.onReset).toHaveBeenCalledTimes(1);
    expect(fooProvider.onReset.mock.lastCall).toMatchInlineSnapshot('[]');

    expect(barProvider.onReset).toHaveBeenCalledTimes(0);
    expect(barProvider.onReset.mock.lastCall).toMatchInlineSnapshot('undefined');
  });
});
