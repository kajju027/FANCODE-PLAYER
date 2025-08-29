export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    let m3u8 = null;
    const iosMatch = path.match(/^\/ios=(.+)$/);
    if (iosMatch && iosMatch[1]) {
      m3u8 = decodeURIComponent(iosMatch[1]);
    }

    // HTML response
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>FANCODE LIVE STREAM</title>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <meta name="referrer" content="no-referrer"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.css"/>
  <style>
    body{background:#000;margin:0;padding:0;overflow:hidden;}
    html,body{height:100%;}
    video{width:100%;height:100%;max-width:100%;}
    .plyr{height:100%;}
    #eye-icon {
      position: absolute;
      top: 12px;
      right: 16px;
      z-index: 1002;
      background:rgba(20,20,20,0.7);
      border-radius:50%;
      width:28px;height:28px;
      display:flex;
      align-items:center;
      justify-content:center;
      cursor:pointer;
      color:#fff;
      font-size:19px;
      transition:background 0.2s;
      box-shadow:0 1px 4px #0008;
    }
    #eye-icon:hover {background:rgba(255,20,196,0.7);}
    #visit-popup {
      display:none; position:fixed; top:48px; right:16px;
      background:rgba(0,0,0,0.92); padding:8px 16px; border-radius:12px;
      z-index:2000; box-shadow:0 2px 16px #000b;
    }
    #visit-popup img {vertical-align:middle;}
    #visit-popup-close {
      position:absolute; top:3px; right:8px; color:#fff; font-size:15px; cursor:pointer;
    }
    .error-message {
      color: #fff;
      text-align: center;
      margin-top: 60px;
      font-size: 1.2rem;
    }
  </style>
</head>
<body>
  <div id="eye-icon" title="Show visits">&#169;</div>
  <div id="visit-popup">
    <span id="visit-popup-close">&times;</span>
    <img src="https://visit-counter.vercel.app/counter.png?page=${encodeURIComponent(url.origin)}&s=40&c=ff14c4&bg=00000000&no=8&ff=digi&tb=&ta=" alt="visits">
  </div>
  <video id="player" controls autoplay playsinline style="background:#000"></video>
  <div id="error" class="error-message" style="display:none;"></div>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.1.4/dist/hls.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.min.js"></script>
  <script>
    // Popup logic for eye icon
    document.getElementById('eye-icon').onclick = function() {
      var v = document.getElementById('visit-popup');
      v.style.display = (v.style.display=='block')?'none':'block';
    };
    document.getElementById('visit-popup-close').onclick = function() {
      document.getElementById('visit-popup').style.display = 'none';
    };

    const video = document.getElementById('player');
    const errorDiv = document.getElementById('error');
    const m3u8 = ${m3u8 ? '`' + m3u8.replace(/`/g, '\\`') + '`' : 'null'};

    if (!m3u8) {
      video.style.display = 'none';
      errorDiv.style.display = 'block';
      errorDiv.innerHTML = 'No video link found.<br>Use format: <code>/ios=YOUR_M3U8_URL</code>';
    } else {
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(m3u8);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, function(event, data) {
          if (data && data.fatal) {
            video.style.display = 'none';
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Could not load video. Please try again later.';
            hls.destroy();
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          // Force 360p as default (if not present, use lowest)
          let qual = hls.levels.findIndex(x=>x.height===360);
          if(qual===-1) qual=0;
          hls.currentLevel = qual;

          const availableQualities = hls.levels.map(level => level.height).filter(Boolean).sort((a,b)=>a-b);
          window.player = new Plyr(video, {
            controls: ['play-large','play','mute','volume','settings','fullscreen'],
            settings: ['quality'],
            quality: {
              default: 360,
              options: availableQualities,
              forced: true,
              onChange: (q) => {
                const idx = hls.levels.findIndex(lvl=>lvl.height===q);
                if(idx!==-1) hls.currentLevel=idx;
              }
            }
          });
          video.play();
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = m3u8;
        video.addEventListener('error', function() {
          video.style.display = 'none';
          errorDiv.style.display = 'block';
          errorDiv.textContent = 'Could not load video. Please try again later.';
        });
        video.addEventListener('loadedmetadata', function() {
          video.play();
        });
        window.player = new Plyr(video, { controls: ['play-large','play','mute','volume','settings','fullscreen'] });
      } else {
        video.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Your browser does not support HLS playback.';
      }
    }
  </script>
</body>
</html>
`;

    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=UTF-8',
        'cache-control': 'no-store',
      },
    });
  }
};
