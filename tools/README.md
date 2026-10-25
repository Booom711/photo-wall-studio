# tools

- `seg/` — offline converter for the MediaPipe Selfie Segmenter model (`conv.py`: tflite → JSON + float16 base64), the hand-written JS inference (`seg.js`, inlined into `index.html`) and reference checks against the TFLite runtime (`ref.py`, `t.js`). Model license: Apache-2.0 (see ../THIRD_PARTY_NOTICES.md).
- `render/` — Node + puppeteer-core scripts that drive `index.html` in headless Chrome to render demo videos/stills with ffmpeg. They contain absolute paths from the build machine (`/workspace/...`) for Chrome, puppeteer-core, sample photos and music — adjust before use. Not needed to use the app.
