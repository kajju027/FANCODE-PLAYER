export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    let m3u8 = null;
    const iosMatch = path.match(/^\/ios=(.+)$/);
    if (iosMatch && iosMatch[1]) {
      m3u8 = decodeURIComponent(iosMatch[1]);
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>FANCODE LIVE STREAM</title>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <meta name="referrer" content="no-referrer"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.css"/>
  <style>
    body{background:#000;margin:0;padding:0;font-family:sans-serif;display:flex;flex-direction:column;min-height:100vh;}
    video{width:100%;height:70vh;max-width:100%;background:#000;}
    .plyr{height:70vh;}
    .error-message{color:#fff;text-align:center;margin-top:20px;font-size:1rem;}

    /* Visitor counter box */
    #visit-counter {
      position: fixed;
      bottom: 90px;
      right: 16px;
      background: rgba(20,20,20,0.9);
      padding: 8px 14px;
      border-radius: 12px;
      z-index: 1000;
      box-shadow: 0 2px 8px #000a;
    }
    #visit-counter img {height:28px;}

    /* Extra section */
    .extras {
      display: grid;
      grid-template-columns: repeat(2,1fr);
      gap: 12px;
      padding: 16px;
      background:#111;
      flex-grow:1;
    }
    .extra-card {
      background:#1e1e1e;
      color:#fff;
      border-radius:14px;
      text-align:center;
      padding:24px 12px;
      font-size:1.1rem;
      font-weight:600;
      box-shadow:0 2px 12px #0007;
      cursor:pointer;
      transition:transform 0.2s;
    }
    .extra-card:hover {
      transform:scale(1.05);
      background:#2a2a2a;
    }
  </style>
</head>
<body>
  <video id="player" controls autoplay playsinline></video>
  <div id="error" class="error-message" style="display:none;"></div>

  <!-- visitor counter -->
  <div id="visit-counter">
    <img src="https://visit-counter.vercel.app/counter.png?page=https%3A%2F%2Fjio-fancode.pages.dev&s=46&c=00ffea&bg=00000000&no=1&ff=digii" alt="visits">
  </div>

  <!-- Extra Section -->
  <div class="extras">
    <div class="extra-card">📺 Watch More</div>
    <div class="extra-card">⚖️ Fair</div>
    <div class="extra-card">⭐ Favourite</div>
    <div class="extra-card">📞 Contact</div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.4.0/dist/hls.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.min.js"></script>
  <script>
    const video = document.getElementById('player');
    const errorDiv = document.getElementById('error');
    const m3u8 = ${m3u8 ? '`' + m3u8.replace(/`/g, '\\`') + '`' : 'null'};

    if (!m3u8) {
      video.style.display = 'none';
      errorDiv.style.display = 'block';
      errorDiv.innerHTML = 'No video link found.<br>Use format: <code>/ios=YOUR_M3U8_URL</code>';
    } else {
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 60,
          liveSyncDuration: 30,
          fragLoadingRetry: 10,
          manifestLoadingRetry: 5,
          enableWorker: true
        });
        hls.loadSource(m3u8);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, function(event, data) {
          if (data && data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn("Network error, trying to recover...");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn("Media error, trying to recover...");
                hls.recoverMediaError();
                break;
              default:
                video.style.display = 'none';
                errorDiv.style.display = 'block';
                errorDiv.textContent = 'Could not load video.';
                hls.destroy();
                break;
            }
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          const availableQualities = hls.levels.map(l=>l.height).filter(Boolean).sort((a,b)=>a-b);
          window.player = new Plyr(video, {
            controls: ['play-large','rewind','play','fast-forward','progress','current-time','mute','volume','settings','pip','airplay','fullscreen'],
            settings: ['quality'],
            quality: {
              default: availableQualities[0],
              options: availableQualities,
              forced: true,
              onChange: q=>{
                const lvl = hls.levels.findIndex(l=>l.height===q);
                if(lvl!==-1) hls.currentLevel=lvl;
              }
            }
          });
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = m3u8;
        window.player = new Plyr(video);
      } else {
        video.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Your browser does not support HLS playback.';
      }
    }
  </script>
</body>
</html>`;
    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=UTF-8','cache-control':'no-store' }
    });
  }
};
