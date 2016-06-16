# check-pkg

[![Build Status](https://travis-ci.org/evanlucas/check-pkg.svg)](https://travis-ci.org/evanlucas/check-pkg)
[![Coverage Status](https://coveralls.io/repos/evanlucas/check-pkg/badge.svg?branch=master&service=github)](https://coveralls.io/github/evanlucas/check-pkg?branch=master)

Check that required packages are in your package.json

## Install

```bash
$ npm install [-g] check-pkg
```

## Test

```bash
$ npm test
```

## CLI Usage

```bash
$ check-pkg
✔ index.js
✖ bin/cmd.js
  - missing help
✔ lib/index.js
✔ lib/read-requires.js
✔ test/test.js
```

## Author

Evan Lucas

## License

MIT (See `LICENSE` for more info)
