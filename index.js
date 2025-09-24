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
      --muted:#bbb;
      --accent:#00a4ff;
      --panel:#1f1f1f;
      --white:#fff;
    }
    html,body{height:100%;margin:0;background:var(--bg);color:var(--white);font-family:Inter,system-ui,Arial,Helvetica,sans-serif;}
    .container{max-width:900px;margin:0 auto;padding:10px;display:flex;flex-direction:column;min-height:100vh;box-sizing:border-box;}

    .player-wrap{position:relative;border-radius:12px;overflow:hidden;background:#000;}
    video#player{
      width:100%;
      height:50vh;
      object-fit:contain;
      background:#000;
      display:block;
    }
    .logo{position:absolute;top:10px;left:12px;z-index:30;width:110px;}
    .live-badge{position:absolute;top:12px;right:12px;background:#e53935;color:#fff;padding:6px 10px;border-radius:18px;font-weight:700;font-size:12px;z-index:30;}

    .plyr__control.plyr__control--overlaid{
      width:50px;height:64px;border-radius:50%;
      background:var(--accent)!important;
      display:flex;align-items:center;justify-content:center;
    }

    .icons-row{display:flex;gap:12px;margin-top:14px;}
    .icon-btn{flex:1;background:var(--panel);padding:12px;border-radius:12px;text-align:center;cursor:pointer;
      display:flex;flex-direction:column;align-items:center;gap:6px;
      box-shadow:0 4px 12px rgba(0,0,0,0.6);}
    .icon-btn small{font-size:12px;color:var(--muted);font-weight:600;}
    .icon-btn .ico{font-size:22px;}

    .visitor{
      display:flex;align-items:center;justify-content:center;
      padding:6px 10px;
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
          <img src="https://visit-counter.vercel.app/counter.png?page=https%3A%2F%2Ffancodez.kajju3864.workers.dev%2F&s=45&c=30ffea&bg=00000000&no=1&ff=digi&tb=&ta=" alt="visits" height="24"/>
        </div>
        <small>Visitors</small>
      </div>
      <div class="icon-btn" id="share-btn"><div class="ico">⫸</div><small>𝗦𝗵𝗮𝗿𝗲</small></div>
      <div class="icon-btn" onclick="location.href='https://famcode.onrender.com/'"><div class="ico">█</div><small>𝗪𝗮𝘁𝗰𝗵 𝗠𝗼𝗿𝗲</small></div>
      <div class="icon-btn" onclick="location.href='https://wa.me/918972767390?text=I'm%20to%20Fancode%20visitor"><div class="ico">☜</div><small>𝗖𝗼𝗻𝘁𝗮𝗰𝘁 𝗨𝘀</small></div>
    </div>

    <div id="error" style="color:#fff;text-align:center;margin-top:18px;display:none;"></div>
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
          window.player = new Plyr(video,{
            controls:['play-large','play','progress','current-time','mute','volume','settings','airplay','fullscreen'],
            settings:['quality'],
            quality:{default:qualities[0]||360,options:qualities,forced:true,onChange:q=>{
              const lvl=hls.levels.findIndex(l=>l.height===q);
              if(lvl!==-1) hls.currentLevel=lvl;
            }}
          });
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = m3u8;
        window.player = new Plyr(video);
      } else {
        video.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Your browser does not support HLS.';
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
