export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);

    // Extract m3u8 link from /ios=... in pathname
    const match = pathname.match(/\/ios=([^\/\?\#]+)/i);
    let m3u8 = null;
    if (match && match[1]) m3u8 = decodeURIComponent(match[1]);

    // HTML response
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Live Stream Player</title>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <meta name="referrer" content="no-referrer"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.css"/>
  <style>
    body { background:#000; margin:0; padding:0; overflow:hidden;}
    html,body { height:100%;}
    video { width:100%; height:100%; max-width:100%;}
    .plyr { height:100%; }
  </style>
</head>
<body>
  <video id="player" autoplay muted controls crossorigin playsinline></video>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.1.4/dist/hls.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.min.js"></script>
  <script>
    const m3u8 = ${JSON.stringify(m3u8)};
    if (!m3u8) {
      document.body.innerHTML = '<p style="color:#fff;text-align:center;margin-top:50px;">No video link found.<br>Use format: <code>/ios=YOUR_M3U8_URL</code></p>';
    } else {
      const video = document.getElementById('player');
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({ maxMaxBufferLength: 100 });
        hls.loadSource(m3u8);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const availableQualities = hls.levels.map(level => level.height);
          const defaultQuality = availableQualities[0];
          new Plyr(video, {
            controls: ['play-large','play','mute','volume','settings','fullscreen'],
            quality: {
              default: defaultQuality,
              options: availableQualities,
              forced: true,
              onChange: (quality) => {
                hls.levels.forEach((level, levelIndex) => {
                  if (level.height === quality) hls.currentLevel = levelIndex;
                });
              }
            }
          });
          document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
              if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{});
            } else {
              if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock().catch(()=>{});
            }
          });
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = m3u8;
        new Plyr(video);
      } else {
        document.body.innerHTML = '<p>Your browser does not support HLS playback.</p>';
      }
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=UTF-8',
        'x-frame-options': 'SAMEORIGIN',
      }
    });
  }
}
