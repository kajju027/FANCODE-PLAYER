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
  <title>FANCODE LIVE STREAM ®</title>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <meta name="referrer" content="no-referrer"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.css"/>
  <style>
    :root{
      --bg:#000;
      --card:#111;
      --muted:#bbb;
      --accent:#FFD400; /* changed to yellow */
      --panel:#1f1f1f;
      --white:#fff;

      /* plyr main color override */
      --plyr-color-main: var(--accent);
    }

    html,body{height:100%;margin:0;background:var(--bg);color:var(--white);font-family:Inter,system-ui,Arial,Helvetica,sans-serif;}
    .container{max-width:900px;margin:0 auto;padding:10px;display:flex;flex-direction:column;min-height:100vh;box-sizing:border-box;}

    /* Player wrapper: default (not fullscreen) show a good height on mobile & desktop */
    .player-wrap{position:relative;border-radius:12px;overflow:hidden;background:#000;height:50vh;min-height:260px;}
    /* When plyr initializes it wraps the video in .plyr - make sure it fills wrapper */
    .player-wrap .plyr, .player-wrap video, .player-wrap .plyr__video-wrapper{
      width:100%;
      height:100%;
      display:block;
    }

    /* Default video style (non-fullscreen) */
    video#player{width:100%;height:100%;object-fit:contain;background:#000;display:block;}

    .logo{position:absolute;top:10px;left:12px;z-index:60;width:110px;}
    .live-badge{position:absolute;top:12px;right:12px;background:#e53935;color:#fff;padding:6px 10px;border-radius:18px;font-weight:700;font-size:12px;z-index:60;}

    /* Overlaid big play button style */
    .plyr__control.plyr__control--overlaid{
      width:56px;height:56px;border-radius:50%;
      background:var(--accent)!important;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 6px 18px rgba(0,0,0,0.6);
    }

    /* Make plyr controls use accent (yellow) */
    .plyr--video .plyr__controls button.plyr__control,
    .plyr__controls [class*="plyr__control"]{
      color:var(--panel);
    }
    /* progress and played bar */
    .plyr__progress--played, .plyr__progress__buffer {
      background: linear-gradient(90deg, rgba(255,212,0,1), rgba(255,212,0,0.8)) !important;
    }
    .plyr__progress__container .plyr__progress__buffer { opacity: 0.25 !important; }
    .plyr__tooltip, .plyr__menu__container { color: #111; }

    /* Controls background slightly dark with yellow accents */
    .plyr__controls { background: rgba(0,0,0,0.15); backdrop-filter: blur(4px); }

    .icons-row{display:flex;gap:12px;margin-top:14px;}
    .icon-btn{flex:1;background:var(--panel);padding:12px;border-radius:12px;text-align:center;cursor:pointer;
      display:flex;flex-direction:column;align-items:center;gap:6px;
      box-shadow:0 4px 12px rgba(0,0,0,0.6);}
    .icon-btn small{font-size:12px;color:var(--muted);font-weight:600;}
    .icon-btn .ico{font-size:22px;}

    .visitor{display:flex;align-items:center;justify-content:center;padding:6px 10px;}

    /* Popup */
    .popup-overlay {
      position:fixed;
      top:0;left:0;
      width:100%;height:100%;
      background:rgba(0,0,0,0.85);
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:1000;
    }
    .popup {
      background:#111;
      padding:24px;
      border-radius:16px;
      text-align:center;
      width:300px;
      box-shadow:0 0 20px rgba(0,0,0,0.8);
    }
    .popup h2 { margin:0 0 10px; color:var(--accent); }
    .popup p { margin:0 0 20px; color:#ccc; font-size:14px; }
    .popup button { display:block; width:100%; padding:12px; border:none; border-radius:8px; font-size:15px; font-weight:600; margin-bottom:12px; cursor:pointer; }
    .popup .join { background:linear-gradient(90deg,#FFD400,#FFB200); color:#111; }
    .popup .already { background:#000; color:#fff; }

    /* --- FULLSCREEN fixes --- */
    /* When plyr enters fullscreen it adds class .plyr--fullscreen to its root.
       Force the plyr element to occupy full viewport (some browsers use different fullscreen roots) */
    .plyr--fullscreen,
    .plyr--fullwindow {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      max-width: 100% !important;
      z-index: 999999 !important;
      border-radius: 0 !important;
    }

    /* Ensure video fills the fullscreen container */
    .plyr--fullscreen video,
    .plyr--fullwindow video {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important; /* fills screen; change to 'contain' if you prefer letterbox */
    }

    /* Hide rounded borders when fullscreen */
    .plyr--fullscreen .player-wrap,
    .plyr--fullwindow .player-wrap {
      border-radius: 0 !important;
      overflow: visible !important;
    }

    /* Ensure controls visible over video in fullscreen */
    .plyr--fullscreen .plyr__controls,
    .plyr--fullwindow .plyr__controls {
      background: linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.45));
    }

    /* small responsive tweak */
    @media (max-width:540px){
      .logo{width:92px;top:8px;left:8px;}
      .player-wrap{height:46vh;}
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="player-wrap">
      <video id="player" controls autoplay playsinline muted></video>
      <img class="logo" src="https://files.catbox.moe/mr8fws.png" alt="logo"/>
      <div class="live-badge">LIVE</div>
    </div>

    <!-- Icons row -->
    <div class="icons-row">
      <div class="icon-btn">
        <div class="visitor">
          <img src="https://www.counter12.com/img-8DZW85Ydz45105A3-6.gif" alt="visits" height="24"/>
        </div>
        <small>Live Visitor</small>
      </div>
      <div class="icon-btn" id="share-btn"><div class="ico">⫸</div><small>Share</small></div>
      <div class="icon-btn" onclick="location.href='https://famcode.onrender.com/'"><div class="ico">✵</div><small>Watch More</small></div>
      <div class="icon-btn" onclick="location.href='https://wa.me/918972767390'"><div class="ico">☜</div><small>Contact Us</small></div>
    </div>

    <div id="error" style="color:#fff;text-align:center;margin-top:18px;display:none;"></div>
  </div>

  <!-- Popup -->
  <div class="popup-overlay" id="popup">
    <div class="popup">
      <h2>Support Us!</h2>
      <p>Join our WhatsApp for latest updates.</p>
      <button class="join" onclick="window.open('https://whatsapp.com/channel/0029VaeylYYBPzjVNomWuZ0T','_blank')">Join Now</button>
      <button class="already" onclick="document.getElementById('popup').style.display='none'">Already Joined</button>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.4.0/dist/hls.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.min.js"></script>
  <script>
    const video = document.getElementById('player');
    const errorDiv = document.getElementById('error');
    const shareBtn = document.getElementById('share-btn');
    const m3u8 = ${m3u8 ? '`' + m3u8.replace(/`/g, '\\`') + '`' : 'null'};

    // Share
    shareBtn.addEventListener('click', async () => {
      try {
        await navigator.share({title:document.title,url:window.location.href});
      } catch(e) {
        alert('Share not supported.');
      }
    });

    function initPlyrWithQuality(hlsInstance, qualities){
      // create Plyr with fullscreen control and quality menu
      window.player = new Plyr(video,{
        controls:['play-large','play','progress','current-time','mute','volume','settings','airplay','fullscreen'],
        settings:['quality'],
        quality:{
          default:qualities[0]||360,
          options:qualities,
          forced:true,
          onChange: q => {
            const lvl = hlsInstance.levels.findIndex(l => l.height === q);
            if(lvl !== -1) hlsInstance.currentLevel = lvl;
          }
        }
      });

      // Make sure Plyr uses our accent variable for its inline styles (some browsers)
      try{
        const root = document.documentElement;
        const accent = getComputedStyle(root).getPropertyValue('--accent') || '#FFD400';
        // plyr uses --plyr-color-main variable already set in CSS
      }catch(e){}
    }

    if (!m3u8) {
      video.style.display = 'none';
      errorDiv.style.display = 'block';
      errorDiv.innerHTML = 'No video link found.<br>Use format: <code>/ios=YOUR_M3U8_URL</code>';
    } else {
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(m3u8);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          const qualities = hls.levels.map(l=>l.height).filter(Boolean).sort((a,b)=>a-b);
          // ensure unique & sorted
          const uniq = Array.from(new Set(qualities)).sort((a,b)=>a-b);
          initPlyrWithQuality(hls, uniq);
        });

        // Some streams change levels runtime; ensure plyr quality options remain consistent
        hls.on(Hls.Events.LEVEL_SWITCHED, function(event, data){
          // no-op, Hls currentLevel will sync with plyr when plyr triggers onChange
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = m3u8;
        window.player = new Plyr(video, {
          controls:['play-large','play','progress','current-time','mute','volume','settings','airplay','fullscreen']
        });
      } else {
        video.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Your browser does not support HLS.';
      }
    }

    // Optional: close popup after a few seconds (feel free to remove)
    setTimeout(()=>{ const p=document.getElementById('popup'); if(p) p.style.display='none'; }, 7000);
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=UTF-8', 'cache-control':'no-store' }
    });
  }
};
