# Thankush Portfolio - AI Developer Guide & Architecture

This repository is a self-contained, standalone production build of the **Thankush / Ankush Video Editor Portfolio** website.

## 🚀 Quick Start
Run the local dev server:
```bash
npm start
# or: node server.js
```
Then visit **http://localhost:3003** in any browser.

---

## 📁 Repository Structure
- **`index.html`**: The root HTML file containing the pre-rendered SSR layout and video cards.
- **`server.js`**: Native zero-dependency Node.js HTTP server. Crucially supports HTTP 206 partial content (Range requests) so video scrubbing and autoplay work smoothly.
- **`assets/jayzee-videos/`**: Contains all 11 downloaded HD short-form video reels (1080p 60fps MP4):
  1. `jayzee_metaman_ad.mp4` (MetaMan commercial)
  2. `jayzee_kl_rahul_1.mp4` (KL Rahul documentary reel 1)
  3. `jayzee_kl_rahul_2.mp4` (KL Rahul documentary reel 2)
  4. `jayzee_commercial_ad.mp4` (Brand commercial ad)
  5. `jayzee_metamen_perfume.mp4` (MetaMen perfume commercial)
  6. `jayzee_short_minimal_1.mp4` (Minimal aesthetic short 1)
  7. `jayzee_short_minimal_2.mp4` (Minimal aesthetic short 2)
  8. `jayzee_vsl_edit.mp4` (VSL master edit)
  9. `jayzee_trailer_longform.mp4` (Cinematic trailer)
  10. `jayzee_short_minimal_3.mp4` (Short reel 3)
  11. `jayzee_short_minimal_4.mp4` (Short reel 4)
- **`framerusercontent.com/assets/`**: Where the active video files are served locally for the website.
- **`framerusercontent.com/modules/ptwbrReVhZEATFrapP73/8GPprxk4RwIxtjHhP4WR/E6lROjLVU.js`**: The compiled React component bundle that renders the portfolio project cards.

---

## 📐 Video Cards & Spacing Architecture
The videos integrated from Jayzee's portfolio are **9:16 vertical reels** (portrait format).

### How to adjust spacing and card layout:
1. **Container Height & Aspect Ratio**:
   - The card wrapper elements in `index.html` have CSS classes controlling aspect ratio and height.
   - For vertical 9:16 videos, ensure card containers have sufficient height (e.g. `aspect-ratio: 9/16` or minimum height ~500px–650px on desktop) so vertical reels display naturally without heavy top/bottom cropping.
2. **Framer Component Sync**:
   - In `E6lROjLVU.js`, the Framer video components receive `srcFile` and `srcUrl` props. Keep these pointing to `/framerusercontent.com/assets/<filename>.mp4`.
3. **Autoplay & Loop**:
   - All `<video>` tags should include `autoplay loop muted playsinline preload="auto"`.

---

## 🛠️ Notes for AI Assistants
- There are NO build tools (no webpack, no vite required). Changes to `index.html` or CSS take effect immediately upon refreshing the browser.
- Port: By default, `server.js` runs on port 3003 (configurable via `PORT=...` environment variable).
