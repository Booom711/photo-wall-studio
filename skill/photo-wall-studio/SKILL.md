---
name: photo-wall-studio
description: Help a user turn up to 200 photos plus optional music into a beat-synced photo-wall video or key-frame images using Photo Wall Studio (照片墙), a local-first browser app with ten templates and four aspect ratios. Use for 照片墙/卡点视频/photo slideshow/photo collage video, Douyin/TikTok/Reels/Shorts-style memories, polaroid/film/3D-ring/Christmas-tree photo videos, or still key frames/contact sheets.
---

# Photo Wall Studio (照片墙)

Photo Wall Studio is a local-first browser app bundled in this folder (`index.html` plus `assets/demo/`). It needs no account, and imported photos, music, cut-outs, rendering and encoding stay in the user's browser. The user imports original photos (and optionally a song), picks a template and aspect ratio, and exports an MP4/WebM video or key-frame images.

You (the agent) normally **guide the user** through the page; the rendering happens in their browser. Do not ask the user to upload their photos to you or to any service.

## 1. Get the page to the user
Pick whichever works for them:
- **Online (easiest):** https://booom711.github.io/photo-wall-studio/
- **Offline bundle:** give them this skill folder, keeping `index.html` and `assets/demo/` together. Open `index.html` in a browser. The demo assets may require a small local static server in browsers that block `fetch()` from `file://`; imported photos and exports still stay local.
- Repo with screenshots and demo videos: https://github.com/Booom711/photo-wall-studio

Recommend **desktop Chrome or Edge (latest)** — they export MP4 (H.264) directly. Safari works; Firefox exports WebM only. Phones are fine for preview and key frames; use a computer for exporting longer videos.

## 2. Walk the user through it
1. **See the result first**: before any upload, twelve bundled hand-drawn demo images fill all template cards and the main canvas. Switch templates or press 「▶ 预览」 to understand the effect. Video/key-frame export stays disabled until real photos are imported.
2. **① Import**: click the compact import box (or drag files in) and select **original photos** — up to 200 (JPG/PNG/WebP; convert HEIC to JPG first). The first real import replaces the demos rather than appending to them. Optionally click 「添加音乐」 to add mp3/m4a/wav; beats are detected automatically.
3. **② Choose template**: template cards sit above the main preview and use a uniform, larger thumbnail size. Pick a card and press 「▶ 预览」. Each template re-lays out for portrait/landscape.
4. **Order and select**: click/tap photos to multi-select. Drag a photo directly onto another photo to swap positions; the target area itself is the drop zone. Selected photos have a strong outline. Use the delete action for the current selection. On phones, long-press then drag. There are no move-front/move-back/hero/retouch button rows.
5. **Read the notices** (yellow/blue boxes under ③) — they name the specific photos that need something and how to fix it (see table below). Thumbnails get badges like ✂ 主角, ⚠ 无人像, ⚠ 偏宽 / ⚠ 偏高.
6. **③ Adjust**: choose 「画面比例」 — 9:16 (1080×1920), 16:9 (1920×1080), 3:4 (1080×1440), or 4:3 (1440×1080) — then edit title, timing and template-specific options. Most settings rebuild the preview instantly.
7. **Export**:
   - 「⬇ 导出视频」: records the video in real time (an N-second video takes N seconds). Keep the tab visible and in front; do not switch tabs or minimise. File name includes template and ratio, e.g. `标题_3D 圆环_16x9.mp4`. Format selector: 自动（优先 MP4）/ WebM.
   - 「🖼 导出关键帧」: current frame or N auto-picked key frames (favours beat/transition moments); untick unwanted ones; PNG or JPG; download individually, as a ZIP, or as one contact-sheet image. On iPhone use ZIP or 「分享 / 存到相册」.

## 3. Templates and what they need
| Template | Good for | Extra needs / notices |
|---|---|---|
| 回忆快闪 Memory Flash | fast beat-cut flashes, 5 transitions | Option 「照片适配」: auto shows mismatched-orientation photos whole on a blurred background; 「铺满裁切」 crops them (warned). |
| 胶片滚动 Film Roll | nostalgic film strip, date stamp | Direction 自动 (vertical in portrait, horizontal in landscape). Date stamp uses EXIF date or custom text. |
| 九宫格出框 3×3 Pop-out | social 3×3 grid, center person pops out | **Needs a photo with a person in each group of 9.** Auto cut-out runs locally (a few seconds). If a group shows ⚠ 无人像: drag a person photo into that group, ★ a person photo, or paint the outline with the brush editor / upload a transparent PNG. |
| 音乐播放器 Music Player | vinyl/cover + karaoke lyrics | Title = song name; one lyric line per photo (lines loop); can show photo dates instead. |
| 3D 圆环 3D Ring | rotating ring / panorama / ferris wheel | 「环上张数」 sets cards on the ring; 200 photos cycle through. |
| 伸缩卡片 Flex Cards | expanding card carousel | Warns when the expanded card shape crops many photos (⚠ 偏宽/偏高): switch 方向, raise 同屏张数 / lower 展开程度, or change ratio. |
| 球幕照片墙 Dome Gallery | photos on a rotating sphere | Draggable in preview. <20 photos repeat on the sphere. |
| 无限螺旋 Infinite Spiral | 3D spiral fly-through | Draggable in preview. <8–10 photos repeat. |
| 照片圣诞树 Christmas Tree | festive tree of glowing photos | Greeting text editable; optional webcam wave gesture is preview-only (not in export). |
| 拍立得散落 Polaroid Pile | polaroids dropping into a pile | Handwritten date/custom captions; with >120 photos the final pile shows each photo small. |

## 4. Troubleshooting
- **Exported WebM instead of MP4** → browser can't record MP4; use latest desktop Chrome/Edge, or convert (e.g. CapCut/剪映, HandBrake, ffmpeg `ffmpeg -i in.webm -c:v libx264 -c:a aac out.mp4`).
- **Video stutters / is shorter / has frozen parts** → the tab was hidden or the computer was busy during real-time recording. Re-export with the tab in front, close heavy apps, or reduce photo count.
- **Ratio selector doesn't respond** → a recording is in progress; wait until it finishes.
- **3×3 Pop-out shows oval stickers** → no person detected in that group; see the template table above.
- **HEIC photos won't load** → convert to JPG first (iPhone: Settings › Camera › Formats › Most Compatible, or export as JPG).
- **Photos look cropped** → choose a ratio matching most photos' orientation, use 回忆快闪 「照片适配: 自动」, or follow the template's notice.
- **Nothing happens on a phone when exporting key frames** → use 「打包 ZIP」 or 「分享 / 存到相册」.
- **Beat sync feels off** → it needs a song with a clear beat; without music the page uses an even tempo. Adjust per-photo duration.

## 5. Limits (tell the user up front when relevant)
- Max 200 photos per project; settings are not saved between sessions (only the aspect ratio is remembered).
- Video export is real-time and needs the page to stay in the foreground.
- Only 9:16, 16:9, 3:4, 4:3; no custom sizes and no smart subject-aware cropping.
- Cut-out works for people only.
- Key-frame export is slower while preview is playing.

## 6. If you can run a browser yourself
If you have a browser and the user explicitly gives you photos to process locally, serve this folder over localhost, upload files to `#fImg` (photos) and `#fAud` (music), choose a ratio with the `#ratios` select (`9:16`, `16:9`, `3:4`, `4:3`), choose a template with `.tpl[data-id=<id>]` (ids: flash, film, grid, player, ring, flex, dome, spiral, xmas, polaroid), and click `#bExport` (video) or `#bKf` (key frames). Confirm that demo assets were replaced before export. Keep everything local; never send the user's photos to external services.

License: MIT (own code); embedded MediaPipe Selfie Segmenter weights Apache-2.0, Caveat font OFL-1.1 — see the repository's THIRD_PARTY_NOTICES.md.
