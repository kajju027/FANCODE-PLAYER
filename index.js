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
    video{width:100%;height:50vh;max-width:100%;background:#000;margin-top:6px;margin-bottom:6px;}
    .plyr{height:50vh;}
    .error-message{color:#fff;text-align:center;margin-top:20px;font-size:1rem;}

    /* Extra section */
    .extras {
      display: grid;
      grid-template-columns: repeat(2,1fr);
      gap: 6px;
      padding: 10px;
      background:#111;
      flex-grow:1;
    }
    .extra-card {
      background:#1e1e1e;
      color:#fff;
      border-radius:8px;
      text-align:center;
      padding:10px 6px;
      font-size:0.8rem;
      font-weight:600;
      box-shadow:0 1px 6px #0007;
      cursor:pointer;
      transition:transform 0.2s;
    }
    .extra-card:hover {
      transform:scale(1.04);
      background:#2a2a2a;
    }

    /* Overlay play button size */
    .plyr__control.plyr__control--overlaid {
      width: 60px !important;
      height: 60px !important;
      font-size: 22px !important;
    }

    /* Progress bar + buffer color (yellow only) */
    .plyr--full-ui input[type=range] {
      color: yellow !important;
    }
    .plyr__progress input[type=range]::-webkit-slider-runnable-track {background:yellow !important;}
    .plyr__progress input[type=range]::-moz-range-track {background:yellow !important;}
    .plyr__progress input[type=range]::-ms-track {background:yellow !important;}

    /* Logo on video (top-right) */
    #logo {
      position:absolute;
      top:8px;
      right:8px;
      width:40px;
      height:auto;
      z-index:20;
    }
  </style>
</head>
<body>
  <div style="position:relative;">
    <video id="player" controls autoplay playsinline muted></video>
    <img id="logo" src="https://files.catbox.moe/8e0bg3.jpeg" alt="logo"/>
  </div>
  <div id="error" class="error-message" style="display:none;"></div>

  <!-- Extra Section -->
  <div class="extras">
    <div class="extra-card" onclick="location.href='https://famcode.onrender.com/'">📺 WATCH MORE</div>
    <div class="extra-card" onclick="location.href='https://wa.me/918972767390?text=Hi%2C%20I%20am%20coming%20from%20your%20FANCODE%20website'">⚖️ CONTACT US</div>
    <div class="extra-card">
      <img src="https://visit-counter.vercel.app/counter.png?page=https%3A%2F%2Fjio-fancode.pages.dev&s=38&c=ffff00&bg=00000000&no=1&ff=digii" alt="visits"/>
    </div>
    <div class="extra-card" id="share-btn">🔗 SHARE</div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.4.0/dist/hls.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.min.js"></script>
  <script>
    const video = document.getElementById('player');
    const errorDiv = document.getElementById('error');
    const shareBtn = document.getElementById('share-btn');
    const m3u8 = ${m3u8 ? '`' + m3u8.replace(/`/g, '\\`') + '`' : 'null'};

    // Share button
    shareBtn.addEventListener('click', async () => {
      try {
        await navigator.share({
          title: 'Watch Live Stream',
          url: window.location.href
        });
      } catch(e) {
        alert("Share not supported in this browser.");
      }
    });

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
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
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
            autoplay:true,
            controls: ['play-large','rewind','play','fast-forward','progress','current-time','mute','volume','settings','pip','airplay','fullscreen'],
            settings: ['quality'],
            quality: {
              default: 360,
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
        window.player = new Plyr(video, {autoplay:true});
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
