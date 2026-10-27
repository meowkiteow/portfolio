# Krishna - Video Editor Portfolio

A standalone portfolio with local video previews, channel images, experience,
and WhatsApp/email contact links. It uses a Framer export with custom React
components and static assets.

## Run locally

```sh
npm start
```

Open http://localhost:3003. The local Node server supports video range requests.
No third-party npm dependencies are required.

## Build and deploy

```sh
npm run build
```

The build copies the website and active local assets into `dist/`.
`vercel.json` configures Vercel to serve this directory as a static website.
Generated build files, private local configuration, and unused video source
copies are excluded from Git.

## Main files

- `index.html`: prerendered page and responsive variants.
- `components/ui/`: headline, gallery, video previews, client profiles,
  testimonials, and contact buttons.
- `assets/`: styles, local channel images, and long-form video previews.
- `framerusercontent.com/`: cached runtime, modules, and active videos.
- `server.js`: local preview server.
- `scripts/build-static.js`: static deployment build.

Some sections exist in both the HTML and compiled Framer runtime modules.
Keep both versions synchronized when editing those sections.
