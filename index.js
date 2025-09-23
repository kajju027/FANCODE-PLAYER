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
    video{width:100%;height:65vh;max-width:100%;background:#000;}
    .plyr{height:65vh;}
    .error-message{color:#fff;text-align:center;margin-top:20px;font-size:1rem;}

    /* Change progress bar color to yellow */
    :root {
      --plyr-color-main: #ffcc00;
    }

    /* Channel logo on video */
    #channel-logo {
      position:absolute;
      top:8px;
      right:8px;
      width:48px;
      height:auto;
      border-radius:6px;
      z-index:1000;
      opacity:0.9;
    }

    /* Extra section */
    .extras {
      display: grid;
      grid-template-columns: repeat(2,1fr);
      gap: 8px;
      padding: 12px;
      background:#111;
      flex-grow:1;
    }
    .extra-card {
      background:#1e1e1e;
      color:#fff;
      border-radius:10px;
      text-align:center;
      padding:10px 6px;
      font-size:0.85rem;
      font-weight:600;
      box-shadow:0 2px 8px #0007;
      cursor:pointer;
      transition:transform 0.2s;
    }
    .extra-card:hover {
      transform:scale(1.05);
      background:#2a2a2a;
    }
  </style>
</head>
<body style="position:relative;">
  <video id="player" controls autoplay playsinline></video>
  <img id="channel-logo" src="https://files.catbox.moe/8e0bg3.jpeg" alt="Logo">
  <div id="error" class="error-message" style="display:none;"></div>

  <!-- Extra Section -->
  <div class="extras">
    <div class="extra-card" onclick="window.open('https://example.com/watchmore','_blank')">📺 Watch More</div>
    <div class="extra-card" id="share-btn">🔗 Share</div>
    <div class="extra-card" onclick="window.open('https://example.com/favourite','_blank')">⭐ Favourite</div>
    <div class="extra-card" id="visit-btn">👁 Visitor Count</div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.4.0/dist/hls.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.min.js"></script>
  <script>
    const video = document.getElementById('player');
    const errorDiv = document.getElementById('error');
    const visitBtn = document.getElementById('visit-btn');
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
        window.player = new Plyr(video);
      } else {
        video.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Your browser does not support HLS playback.';
      }
    }

    // Share button
    document.getElementById('share-btn').addEventListener('click', async ()=>{
      if (navigator.share) {
        await navigator.share({
          title: 'Fancode Live',
          text: 'Watch Live Stream Here:',
          url: window.location.href
        });
      } else {
        alert('Sharing not supported on this browser.');
      }
    });

    // Visitor Count inside button
    visitBtn.addEventListener('click', ()=>{
      visitBtn.innerHTML = '👁 <img src="https://visit-counter.vercel.app/counter.png?page=https%3A%2F%2Fjio-fancode.pages.dev&s=24&c=ffcc00&bg=00000000&no=1&ff=digi" alt="visits" style="height:14px;vertical-align:middle;">';
    });
  </script>
</body>
</html>`;
    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=UTF-8','cache-control':'no-store' }
    });
  }
};
