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
  <meta charset="utf-8" />
  <title>FANCODE LIVE STREAM</title>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <meta name="referrer" content="no-referrer"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.css"/>
  <style>
    :root{
      --bg:#000;
      --card:#111;
      --muted:#9b9b9b;
      --accent:#00a4ff;
      --panel:#1f1f1f;
      --white:#fff;
    }
    html,body{height:100%;margin:0;background:var(--bg);color:var(--white);font-family:Inter,system-ui,Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;}
    .container{max-width:900px;margin:0 auto;padding:8px;display:flex;flex-direction:column;min-height:100vh;box-sizing:border-box;}
    /* Video area */
    .player-wrap{position:relative;border-radius:12px;overflow:hidden;background:#000;}
    video#player{width:100%;height:52vh;object-fit:cover;display:block;background:#000;}
    .logo{position:absolute;top:10px;left:12px;z-index:30;width:110px;filter:drop-shadow(0 3px 6px #000);}
    .live-badge{position:absolute;top:12px;right:12px;background:#e53935;color:#fff;padding:6px 8px;border-radius:18px;font-weight:700;font-size:12px;z-index:30;box-shadow:0 4px 12px rgba(0,0,0,.6);}
    /* Make large overlaid play button similar to screenshot */
    .plyr__control.plyr__control--overlaid{width:64px;height:64px;border-radius:50%;background:var(--accent)!important;display:flex;align-items:center;justify-content:center;}
    .plyr__control.plyr__control--overlaid svg{transform:translateX(2px);}
    /* Controls style tweaks */
    .plyr--full-ui .plyr__controls{background:linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.45));}
    .plyr__progress input[type=range]::-webkit-slider-runnable-track{background:#ffd100;}
    /* Icons row (four buttons) */
    .icons-row{display:flex;gap:12px;margin-top:12px;}
    .icon-btn{flex:1;background:var(--panel);padding:12px;border-radius:12px;text-align:center;color:var(--white);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;box-shadow:0 6px 18px rgba(0,0,0,.6);cursor:pointer;border:1px solid rgba(255,255,255,0.02);}
    .icon-btn small{display:block;font-size:12px;color:var(--muted);font-weight:600;margin-top:-4px;}
    .icon-btn .ico{font-size:22px;}
    /* Match info card like screenshot */
    .match-card{margin-top:14px;background:linear-gradient(180deg,#232323,#161616);padding:14px;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,0.6);display:flex;flex-direction:column;gap:8px;}
    .match-title{font-size:18px;font-weight:800;}
    .match-meta{display:flex;gap:12px;flex-wrap:wrap;color:var(--muted);font-size:13px;align-items:center;}
    .match-meta span{display:inline-flex;align-items:center;gap:8px;}
    .match-meta .dot{width:10px;height:10px;background:#F44336;border-radius:50%;display:inline-block;}
    /* Visitor counter (replace favorite) */
    .visitor {
      display:flex;align-items:center;gap:10px;
      background:linear-gradient(90deg,#ff9f43,#ff6b6b);
      color:#111;padding:6px 10px;border-radius:999px;font-weight:800;font-size:13px;
      box-shadow:0 6px 18px rgba(255,110,110,0.12);
    }
    /* Responsive smaller screens */
    @media (max-width:420px){
      video#player{height:46vh;}
      .logo{width:86px;}
      .match-title{font-size:16px;}
      .icon-btn{padding:10px;}
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="player-wrap">
      <video id="player" controls autoplay playsinline muted></video>
      <img class="logo" src="https://files.catbox.moe/8e0bg3.jpeg" alt="logo"/>
      <div class="live-badge">LIVE</div>
    </div>

    <!-- icons row: Visitor counter | Share | Watch More | Join Now -->
    <div class="icons-row" style="margin-top:14px;">
      <div class="icon-btn" id="visitor-btn" title="Visitors">
        <div class="visitor" id="visitor-pill">🔢 Loading</div>
        <small>Visitors</small>
      </div>

      <div class="icon-btn" id="share-btn" title="Share">
        <div class="ico">🔗</div>
        <small>Share</small>
      </div>

      <div class="icon-btn" onclick="location.href='https://famcode.onrender.com/'" title="Watch More">
        <div class="ico">▶️</div>
        <small>Watch More</small>
      </div>

      <div class="icon-btn" id="join-btn" title="Join Now" onclick="location.href='https://wa.me/918972767390?text=I%20want%20to%20join'">
        <div class="ico">👥</div>
        <small>Join Now</small>
      </div>
    </div>

    <!-- Match info card (like the screenshot) -->
    <div class="match-card" role="region" aria-label="Match details">
      <div class="match-title">Lincoln City F.C. <span style="opacity:.6;font-weight:600;">vs</span> Chelsea</div>
      <div class="match-meta">
        <span>🏆 Carabao Cup 2025-2026</span>
        <span>⏱ Start: 12:15:00 AM 24-09-2025</span>
        <span style="margin-left:auto;color:#4caf50;font-weight:700;">Status: LIVE</span>
      </div>
    </div>

    <!-- error area -->
    <div id="error" style="color:#fff;text-align:center;margin-top:18px;display:none;"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.4.0/dist/hls.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.min.js"></script>
  <script>
    const video = document.getElementById('player');
    const errorDiv = document.getElementById('error');
    const shareBtn = document.getElementById('share-btn');
    const visitorPill = document.getElementById('visitor-pill');
    const m3u8 = ${m3u8 ? '`' + m3u8.replace(/`/g, '\\`') + '`' : 'null'};

    // Visitor counter image (you can change page param)
    function refreshVisitorCount() {
      // using visit-counter.vercel.app image (same as you used). We will fetch the image URL and display count by reading alt text fallback.
      // Simpler: display the image inside pill (small). But pill here uses text — let's fetch a numeric value via a small JSON-free approach:
      // We'll point to a simple counter image URL and show it as an <img> inside the pill.
      const img = document.createElement('img');
      img.src = 'https://visit-counter.vercel.app/counter.png?page=' + encodeURIComponent(window.location.hostname) + '&s=38&c=ffff00&bg=00000000&no=1&ff=digi';
      img.style.height = '26px';
      img.style.objectFit = 'contain';
      img.alt = 'visits';
      visitorPill.innerHTML = '';
      visitorPill.appendChild(img);
    }
    refreshVisitorCount();
    // refresh every 60s
    setInterval(refreshVisitorCount, 60000);

    // Share button
    shareBtn.addEventListener('click', async () => {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href
        });
      } catch (e) {
        alert('Share not supported in this browser.');
      }
    });

    if (!m3u8) {
      video.style.display = 'none';
      errorDiv.style.display = 'block';
      errorDiv.innerHTML = 'No video link found.<br>Use format: <code>/ios=YOUR_M3U8_URL</code>';
    } else {
      // HLS playback with hls.js if supported
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 60,
          liveSyncDuration: 30,
          fragLoadingRetry: 8,
          manifestLoadingRetry: 5,
          enableWorker: true
        });
        hls.loadSource(m3u8);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          // collect available heights
          const qualities = hls.levels.map(l => l.height).filter(Boolean).sort((a,b)=>a-b);
          // init Plyr
          window.player = new Plyr(video, {
            controls: ['play-large','play','progress','current-time','mute','volume','settings','airplay','fullscreen'],
            settings: ['quality'],
            quality: {
              default: qualities.includes(360)?360: (qualities[0]||null),
              options: qualities,
              forced: true,
              onChange: q => {
                const levelIndex = hls.levels.findIndex(l => l.height === q);
                if (levelIndex !== -1) hls.currentLevel = levelIndex;
              },
            }
          });
        });

        hls.on(Hls.Events.ERROR, function(event, data) {
          console.warn('HLS error', data);
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
                errorDiv.textContent = 'Could not load video (fatal error).';
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari iOS native HLS
        video.src = m3u8;
        window.player = new Plyr(video, { controls: ['play-large','play','progress','current-time','mute','volume','settings','airplay','fullscreen'] });
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
      headers: { 'content-type': 'text/html; charset=UTF-8', 'cache-control':'no-store' }
    });
  }
};
