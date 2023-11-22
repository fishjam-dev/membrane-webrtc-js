# membrane-webrtc-js

[![NPM version](https://img.shields.io/npm/v/@jellyfish-dev/membrane-webrtc-js)](https://www.npmjs.com/package/@jellyfish-dev/membrane-webrtc-js)

Official JS/TS client library for [Membrane RTC Engine](https://github.com/jellyfish-dev/membrane_rtc_engine)

## Installation

Using **npm**:

```
npm install @jellyfish-dev/membrane-webrtc-js
```

or

```
yarn add @jellyfish-dev/membrane-webrtc-js
```

Using **GitHub**:

```
npm install jellyfish-dev/membrane-webrtc-js#<branch>
```

## e2e tests

We use [Playwright](https://playwright.dev/) to run e2e tests.

Use the `npm run e2e` command to run them. You may need to install the browsers using this command: `npx playwright install --with-deps`.

The e2e tests start a Jellyfish instance via Docker and [Testcontainers](https://node.testcontainers.org/).

### Colima

If you are using [colima](https://github.com/abiosoft/colima), you need to run these commands first:

```bash
export DOCKER_HOST=unix://${HOME}/.colima/default/docker.sock
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
```

See the Testcontainers' documentation to learn about [known issues](https://node.testcontainers.org/supported-container-runtimes/#known-issues_1).

## Documentation

Documentation is available [here](https://jellyfish-dev.github.io/membrane-webrtc-js/)

## Supported Membrane RTC Engine versions

Below table presents mappings between JS SDK and RTC Engine versions that can be used together.

| JS SDK  | RTC Engine |
| ------- | ---------- |
| 0.1-0.2 | 0.2-0.7    |
| 0.3.0   | 0.7-0.8    |
| 0.4.0   | 0.9-0.13   |
| 0.5.0   | 0.14+      |

## Copyright and License

Copyright 2022, [Software Mansion](https://swmansion.com/?utm_source=git&utm_medium=readme&utm_campaign=membrane-webrtc-js)

[![Software Mansion](https://logo.swmansion.com/logo?color=white&variant=desktop&width=200&tag=membrane-github)](https://swmansion.com/?utm_source=git&utm_medium=readme&utm_campaign=membrane_rtc_engine)

Licensed under the [Apache License, Version 2.0](LICENSE)
