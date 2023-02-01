# Website

The `site` directory includes the contents for the website.  The site is built with [Astro](https://astro.build/), and the layout described below mostly comes from Astro.  The website examples are meant to be single-purpose demonstrations of one of the library features.

## Directory Layout

Take a look at the Astro docs for a complete description of the [project layout](https://docs.astro.build/en/core-concepts/project-structure/).  The `site` directory is configured as the Astro root, and all paths below are relative to the `site` directory.

The `src` directory is the source for Astro-processed website content.  Subdirectories of `src` are described below.

 * `pages` - Files in this directory are `*.astro` components that map directly to URL routes.  Brackets in a file name correspond to parameterized routes (e.g. `src/pages/examples/[slug].astro` is rendered for all `/examples/*` URL paths).
 * `layouts` - Astro files in this directory are layout components used by page components.
 * `content` - Directories in the `content` directory are [content collections](https://docs.astro.build/en/guides/content-collections/).  The `examples` content collection includes one MDX component per example.  The purpose of these files is to provide metadata for the example components and to provide a static import for those example components that is configured to render client-side only.  The `src/pages/examples.astro` page is an examples index page that queries the examples collection and provides links to individual example pages.
 * `components` - Files in this directory are (usually) JSX components that are imported from pages or other components.  The `src/components/examples` directory is where we author the individual examples.
 * `styles` - Shared stylesheets.  To style an individual component, just add a `<style>` tag.  When shared styles are needed, a CSS file can be added to the `styles` directory.

## Creating a New Example

Adding an example requires creating two files:

 * `src/components/examples/YourExample.jsx` - This is the JSX component that demonstrates one of the library features.
 * `src/content/examples/your-example.mdx` - This is the MDX file that determines the slug for the example, provides example metadata, and statically imports the example for client-only rendering.

It would be nice if we could collapse these into a single file, but it appears to be a restriction of Astro that client-only components need to be statically imported from a second file (requiring one file for the content and a second for the import).

The schema for the example metadata is described in the `src/content/config.js` directory.  Make sure your new example has all of the required metadata fields in the MDX frontmatter (in the `src/content/examples/your-example.mdx` file).

## Building the Website

Run the following to run the website during development:

```shell
# from the root of the repo
npm run site
```

The production version of the website is built by a CI job.
