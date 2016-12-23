# HTML Document Webpack plugin

## What?

Renders your app's index HTML file either with React HTML document or
a custom component.

## Why

I like to use React for this too instead of some static file.

## How?

Install from NPM and add the plugin to your webpack config.

Seems to work with both Webpack 1 and 2.

```javascript

new HtmlCreatorPlugin({
  title: 'Application', // title
  favicon: 'web/favicon.ico', // favicon
  css: [], // array of non-bundled CSS files to prepend
  content: <span>Loading...</span>, // content to render while loading (optional),
  // component: CustomHtmlComponent, // a custom component (optional)
})

```

## Participate

Pull and feature requests, feel welcomed!
