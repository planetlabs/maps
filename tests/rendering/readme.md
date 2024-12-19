# Rendering Tests

This directory includes rendering test cases and expected results as PNG files.  The rendering tests are run as part of the `npm test` script.  The `npm run test:rendering` script runs just the rendering tests.  The rendering tests are run with [Playwright](https://playwright.dev/docs/intro).

You can pass additional arguments to the `playwright` CLI by including them after a `--` argument terminator.  For example, to run only tests that match a given pattern, use the `--grep` argument.

```bash
npm run test:rendering -- --grep single-layer
```

> The pattern passed to `--grep` is matched against the argument passed to `test()` in the test modules.  While it is a bit repetitive, we name test case directories (e.g. `single-layer` like the argument passed to `test('single-layer')`) to make it easier to run a single test.

See the `playwright` [CLI docs](https://playwright.dev/docs/test-cli) for all the supported arguments.

When tests fail, results will be written to a `test-results` directory at the root of the repo.  You can use these results to update the expected files for a test case.  You can also update snapshots by passing the `--update-snapshots` argument.  This is unfortunately complicated because Playwright writes out platform-specific snapshot names.  Because we run our CI tests on Linux, we only commit the expected `*-linux.png` files.

If you are not running Linux, the easiest way to generate expected snapshots is with Docker:

```bash
# Run the Playwright Docker image (ignoring host installed node_modules)
docker run --rm -it \
  --mount type=bind,source="$(pwd)",target=/work/ \
  --mount type=volume,source=exclude,target=/work/node_modules/ \
  mcr.microsoft.com/playwright:v1.49.0-noble bash

cd work
npm install
npm run test:rendering -- --update-snapshots
```

To debug tests or develop new tests, you can run the rendering server without running the tests:

```bash
npm run start:rendering
```

Alternatively, you can have Playwright run in "headed" mode so you can see what is going on:

```bash
npm run test:rendering -- --headed
```
