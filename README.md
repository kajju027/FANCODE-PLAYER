# Sayan TV — Live HLS (m3u8) Player

Single-file website to play any `m3u8` URL. Mobile-friendly. Custom controls. Auto-reads the stream URL from the page URL.

## How to use

- Host these files anywhere static (GitHub Pages, Netlify, Vercel, Nginx).
- Open the site and pass your HLS URL after `?i=` or `/i=`

Examples:

```
https://yourdomain.com/index.html?i=https%3A%2F%2Fexample.com%2Flive%2Findex.m3u8
https://yourdomain.com/i=https%3A%2F%2Fexample.com%2Flive%2Findex.m3u8
```

Or paste the URL in the input box and click **Load**.

## Notes

- Uses the hls.js CDN. Works in Chrome, Edge, and Firefox. Safari can play HLS natively.
- Cross-origin streams must send proper CORS headers. Otherwise playback will fail due to browser security.
- The **Quality** menu appears when the stream exposes multiple levels in the master playlist.
- Live detection is heuristic. DVR seeking works only if the stream provides a sliding window and the server allows it.
