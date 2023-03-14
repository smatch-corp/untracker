# @smatch-corp/untracker

Unified User Events/Properties Collect Library

## Installation

Install the @smatch-corp/untracker and unstorage packages using the package manager of your choice:

```
yarn add @smatch-corp/untracker unstorage
```

This package requires unstorage as peer dependency.

## Setup

Import Tracker class and create an instance of it.

```ts
import { Tracker } from "@smatch-corp/untracker";

export const tracker = new Tracker({
  providers: [
    /* ... */
  ],
});
```

### Providers

Provider is core concept of this package to implement how track and collect user event/properties into `YOUR_TRACKING_TOOL`.

#### GA4

T.B.D

#### Mixpanel

T.B.D

#### Hackle (React SDK)

```ts
import { Tracker } from "@smatch-corp/untracker";
import { hackleReact } from "@smatch-corp/untracker/providers/hackle-react";

declare const hackleReactClient: HackleReactSDKClient;

export const tracker = new Tracker({
  providers: [hackleReact({ hackleReactClient })],
});
```

### Storage

This package uses unstorage for implementing session properties. choose the appropriate unstorage driver with your needs, platform, environment, etc.

If not provided, create new storage which uses in-memory driver internally.

```ts
import { createStorage } from "unstorage";
import localStorageDriver from "unstorage/drivers/localstorage";

import { Tracker } from "@smatch-corp/untracker";

export const tracker = new Tracker({
  providers: [
    /* ... */
  ],
  storage:
    typeof window === "undefined"
      ? undefined
      : createStorage({
          driver: localStorageDriver({ base: "untracker:" }),
        }),
});
```

## Usage

### `tracker.track`

T.B.D

### `tracker.identify`

T.B.D

### `tracker.updateUserProperties`

T.B.D

### `tracker.clearSessionProperties`

T.B.D

### React

T.B.D

## License

MIT
