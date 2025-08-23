export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const match = pathname.match(/\/ios=(.+)$/i);
    let m3u8 = null;
    if (match && match[1]) m3u8 = decodeURIComponent(match[1]);
    let visitImg = "https://visit-counter.vercel.app/counter.png?page=https%3A%2F%2Fjio-fancode.pages.dev%2F&s=40&c=ff14c4&bg=00000000&no=8&ff=digi&tb=&ta=";
    let html = `<!DOCTYPE html>
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
  </style>
</head>
<body>
  <div id="eye-icon" title="Show visits">&#169;</div>
  <div id="visit-popup">
    <span id="visit-popup-close">&times;</span>
    <img src="${visitImg}" alt="visits">
  </div>
  <video id="player" controls autoplay playsinline style="background:#000"></video>
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
    // Video Player logic
    const video = document.getElementById('player');
    const m3u8 = ${JSON.stringify(m3u8)};
    if (!m3u8) {
      document.body.innerHTML = '<p style="color:#fff;text-align:center;margin-top:50px;">No video link found.<br>Use format: <code>/ios=YOUR_M3U8_URL</code></p>';
    } else {
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(m3u8);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function(event, data) {
          document.body.innerHTML = '<p style="color:#fff;text-align:center;margin-top:50px;">Failed to play video.<br>'+data.type+': '+data.details+'</p>';
        });
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          // Find 360p quality (height 360), set as default if exists
          let qual = hls.levels.findIndex(x=>x.height===360);
          if(qual===-1) qual=0;
          hls.currentLevel = qual;
          video.play();
          // Quality control integration with Plyr
          const availableQualities = hls.levels.map(level => level.height).filter(Boolean).sort((a,b)=>a-b);
          const defaultQuality = 360;
          window.player = new Plyr(video, {
            controls: ['play-large','play','mute','volume','settings','fullscreen'],
            settings: ['quality'],
            quality: {
              default: defaultQuality,
              options: availableQualities,
              forced: true,
              onChange: (q) => {
                // কি কোয়ালিটি সিলেক্ট করলো, সেই index খুঁজে সেট করুন
                const idx = hls.levels.findIndex(lvl=>lvl.height===q);
                if(idx!==-1) hls.currentLevel=idx;
              }
            }
          });
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = m3u8;
        video.addEventListener('loadedmetadata', function() {
          video.play();
        });
        window.player = new Plyr(video, { controls: ['play-large','play','mute','volume','settings','fullscreen'] });
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
