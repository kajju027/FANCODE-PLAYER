
**4. The video player will open with quality set to 360p by default (if available). Users can change quality from the settings (gear) button.**

---

## ✨ Features

- **HLS (M3U8) Streaming:** Paste any `.m3u8` link after `/ios=`
- **Default 360p Quality:** If 360p is available, stream starts at 360p. If not, lowest available quality is used.
- **Plyr Video Player:** Modern, mobile/tablet/desktop friendly, with intuitive UI and quality switcher.
- **Error Handling:**  
- If no video link is provided, user-friendly message is shown  
- If stream fails, "Could not load video. Please try again later." is displayed  
- *No technical/buffering error shown to end user*
- **Visitor Counter:** Click the © icon (top right) to see page visits.
- **No Backend/Database Needed:** Everything runs in the browser via Worker.

---

## 🛠️ How it Works (Technical)

- The Cloudflare Worker reads the `/ios=...` part of the URL to extract the M3U8 link.
- The HTML page is rendered and served by the Worker (no static files needed).
- [Hls.js](https://github.com/video-dev/hls.js/) is used for HLS playback in browsers.
- [Plyr](https://github.com/sampotts/plyr) powers the player UI and quality selection.
- Video quality is set to 360p on load (if available).
- All error states are handled gracefully, with no blank screens or technical error codes shown to users.

---

## 🔗 Example Links

- **No video link:**  
`https://fancodez.kajju3864.workers.dev/`
- **With video:**  
`https://fancodez.kajju3864.workers.dev/ios=https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`

---

## 📦 File Structure

---

## 📝 Customization

- You may change the visitor counter, branding, or styling in the HTML section inside `index.js`.
- For custom logic or analytics, edit the Worker code as needed.

---

## ❓ FAQ

**Q: Why does it default to 360p?**  
A: To save bandwidth and ensure smooth playback for most users.

**Q: What if 360p is not available?**  
A: The lowest available quality will be used.

**Q: Does it work on mobile?**  
A: Yes, it is mobile and desktop friendly.

**Q: Does it support DRM or encrypted streams?**  
A: No, only public/unencrypted `.m3u8` streams are supported.

---

## 💡 Credits

- [Plyr Video Player](https://github.com/sampotts/plyr)
- [hls.js](https://github.com/video-dev/hls.js)
- [Visit Counter Service](https://visit-counter.vercel.app/)

---

**Made with ❤️ for live streamers using Cloudflare Workers!**
