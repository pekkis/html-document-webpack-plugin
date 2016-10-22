import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import HTMLDocument from 'react-html-document';
import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';

Promise.promisifyAll(fs);

export default function HtmlCreatorPlugin(config) {
  this.config = {
    favicon: 'src/favicon.ico',
    title: 'Application',
    css: [],
    ...config,
  };
}

function addFile(filename, compilation) {
  filename = path.resolve(compilation.compiler.context, filename);

  return Promise.props({
    size: fs.statAsync(filename),
    source: fs.readFileAsync(filename),
  })
  .catch(() => Promise.reject(new Error(`HtmlCreatorPlugin: could not load file ${filename}`)))
  .then((results) => {
    const basename = path.basename(filename);
    compilation.fileDependencies.push(filename);
    compilation.assets[basename] = {
      source: () => results.source,
      size: () => results.size.size,
    };
    return basename;
  });
}

HtmlCreatorPlugin.prototype.apply = function apply(compiler) {
  const config = this.config;

  compiler.plugin('emit', (compilation, callback) => {
    const assets = compilation.chunks.reduce((files, chunk) => {
      const ret = [
        ...files,
      ];
      chunk.files.forEach(file => ret.push(file));
      return ret;
    }, []);

    const css = assets
      .filter(asset => asset.endsWith('.css'))
      .map(asset => `/${asset}`)

    const js = assets
      .filter(asset => asset.endsWith('.js'))
      .map(asset => `/${asset}`);

    const rendered = renderToStaticMarkup(
      <HTMLDocument
        title={config.title}
        scripts={js}
        stylesheets={css}
        metatags={[
          {
            name: 'charset',
            content: 'utf-8',
          },
        ]}
      >
        <span>Loading</span>
      </HTMLDocument>
    );

    const doc = `<!DOCTYPE html>\n${rendered}`;

    const basename = path.basename('index.html');
    compilation.fileDependencies.push('index.html');

    compilation.assets[basename] = {
      source: () => doc,
      size: () => doc.length,
    };

    addFile(config.favicon, compilation).then(() => callback());

    return basename;
  });
};
