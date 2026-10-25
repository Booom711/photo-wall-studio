# Third-party notices / 第三方声明

Our own code is MIT-licensed (see `LICENSE`). The following third-party components are embedded or used and remain under their own licenses.

## 1. MediaPipe Selfie Segmenter (model weights, embedded in `index.html`)
- Model: `selfie_segmenter.tflite` (square 256×256, float16), © Google LLC
- License: **Apache License 2.0** — per the official model card:
  https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Selfie%20Segmentation.pdf
  Full text: https://www.apache.org/licenses/LICENSE-2.0
- Source: https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite
  (a copy is kept in `tools/seg/selfie_segmenter.tflite`)
- Modification: the graph was converted offline to JSON + float16 weights (base64) by `tools/seg/conv.py`; inference is re-implemented by hand in plain JavaScript (`tools/seg/seg.js`, inlined in `index.html`). No MediaPipe / TFLite runtime code is included.
- Verified against the official TFLite runtime: max abs diff < 1e-4 (`tools/seg/ref.py` + `tools/seg/t.js`).

## 2. Caveat (handwriting font, embedded in `index.html` as WOFF2)
- Source: https://github.com/googlefonts/caveat — Copyright 2014 The Caveat Project Authors
- License: **SIL Open Font License, Version 1.1** (https://openfontlicense.org)
- Modification: ASCII subset, instanced at weight 600, embedded under the font-family name `PSHand` (used for the Polaroid template captions). Bundled with the software, not sold separately.

## 3. Demo media (preview images in `docs/img/` and the demo videos in the GitHub Release)
- The photos shown in the previews/demo videos are from **Pexels** (https://www.pexels.com) under the Pexels License (https://www.pexels.com/license/). No original sample photos are included in this repository.
- Some landscape-format test images were center-crops of those Pexels photos (crops used only to render previews).
- Demo music `beat.mp3` is a synthetic beat generated for testing.
