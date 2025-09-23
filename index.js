export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname || "/";
    let m3u8 = null;
    const iosMatch = path.match(/^\/ios=(.+)$/);
    if (iosMatch && iosMatch[1]) {
      try {
        m3u8 = decodeURIComponent(iosMatch[1]);
      } catch (e) {
        m3u8 = iosMatch[1];
      }
    }

    const safeM3u8 = m3u8 ? m3u8.replace(/`/g, '\\`') : null;

    const html = `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
<title>FANCODE LIVE — Player</title>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.css"/>

<style>
  :root{
    --bg:#000;
    --card:#111;
    --accent: #ffd800; /* হলুদ (progress) */
    --muted:#9aa0a6;
  }
  html,body{height:100%;margin:0;background:var(--bg);color:#fff;font-family:Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;}
  .container{max-width:1100px;margin:12px auto 40px;padding:0 12px;display:flex;flex-direction:column;gap:12px;}
  /* Player area */
  .player-wrap{position:relative;display:block;background:#000;border-radius:12px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.6);}
  video, audio{width:100%;height:calc(70vh);display:block;background:#000;outline:none;}
  /* Move player slightly up visually by negative margin effect */
  .player-wrap { transform: translateY(-6px); }

  /* Plyr small controls style */
  .plyr--full-ui .plyr__controls { padding:6px 8px; }
  .plyr__control { padding:6px !important; border-radius:8px; min-width:34px; min-height:34px; }
  .plyr__controls .plyr__control svg { width:16px; height:16px; }

  /* Override played progress color to yellow (accent) */
  .plyr__progress--played { background: var(--accent) !important; }
  .plyr__seek-tooltip { background: rgba(0,0,0,0.85); color:#fff; }

  /* Error */
  .error-message { text-align:center;padding:18px;color:#fff;background:#1a1a1a;border-radius:8px;display:none; }

  /* small visitor toggle */
  #visit-toggle { position: fixed; right: 16px; bottom: 16px; z-index:1200; background: rgba(255,255,255,0.06); padding:8px;border-radius:10px; backdrop-filter: blur(6px); cursor:pointer; display:flex; align-items:center; gap:8px; border:1px solid rgba(255,255,255,0.04); }
  #visit-toggle span { font-size:13px; color:var(--muted); }
  #visit-box { position:fixed; right:16px; bottom:64px; z-index:1200; display:none; background:rgba(20,20,20,0.95); padding:10px 12px; border-radius:10px; box-shadow:0 8px 30px rgba(0,0,0,0.6); }
  #visit-box img{ height:28px; display:block; }

  /* Extras (cards) */
  .extras { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-top:6px; }
  .card { background:var(--card); padding:12px 10px; border-radius:10px; text-align:center; font-weight:600; cursor:pointer; user-select:none; font-size:13px; box-shadow:0 6px 18px rgba(0,0,0,0.6); transition:transform .14s ease, box-shadow .14s ease; display:flex;flex-direction:column;align-items:center;gap:8px; }
  .card:hover{ transform:translateY(-6px); box-shadow:0 14px 30px rgba(0,0,0,0.7); }
  .card small { color:var(--muted); font-weight:500; display:block; }

  /* make cards visually compact (small buttons) */
  .card .mini { font-size:12px; padding:6px 10px; border-radius:8px; background:rgba(255,255,255,0.03); }

  /* Responsive */
  @media (max-width:880px){
    .extras { grid-template-columns:repeat(2,1fr); }
    video, audio { height:46vh; }
  }
  @media (max-width:480px){
    .extras { grid-template-columns:repeat(1,1fr); gap:8px; }
    .card { padding:10px; font-size:14px; }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="player-wrap" id="playerWrap">
      <!-- video element (or audio for mp3) will be injected/used -->
      <video id="player" playsinline controls crossorigin="anonymous"></video>
      <div id="error" class="error-message"></div>
    </div>

    <div class="extras" id="extras">
      <a class="card" id="watchMore" href="https://example.com/watch-more" target="_blank" rel="noopener">
        <div class="mini">📺 Watch More</div>
        <small>Latest streams & replays</small>
      </a>

      <button class="card" id="fairBtn" type="button">
        <div class="mini">⚖️ Share / Fair</div>
        <small>Share this page</small>
      </button>

      <a class="card" id="favLink" href="https://example.com/favourites" target="_blank" rel="noopener">
        <div class="mini">⭐ Favourite</div>
        <small>Add to your list</small>
      </a>

      <a class="card" id="contactLink" href="https://example.com/contact" target="_blank" rel="noopener">
        <div class="mini">📞 Contact</div>
        <small>Get support</small>
      </a>
    </div>
  </div>

  <!-- Visitor toggle + box -->
  <div id="visit-toggle" title="Visitor counter">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="opacity:.95"><path d="M12 5c-7 0-11 6.5-11 7s4 7 11 7 11-6.5 11-7-4-7-11-7z" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <span>Visitors</span>
  </div>
  <div id="visit-box">
    <button id="closeVisit" style="float:right;background:transparent;border:none;color:#fff;font-size:16px;cursor:pointer;margin:-6px -6px 6px 0">×</button>
    <div style="clear:both"></div>
    <img id="visit-img" src="https://visit-counter.vercel.app/counter.png?page=https%3A%2F%2Fjio-fancode.pages.dev&s=46&c=00ffea&bg=00000000&no=1&ff=digii" alt="visits">
  </div>

<script src="https://cdn.jsdelivr.net/npm/hls.js@1.4.0/dist/hls.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.min.js"></script>
<script>
  (function(){
    const rawURL = ${safeM3u8 ? '`' + safeM3u8 + '`' : 'null'};
    const video = document.getElementById('player');
    const errorDiv = document.getElementById('error');
    const visitToggle = document.getElementById('visit-toggle');
    const visitBox = document.getElementById('visit-box');
    const closeVisit = document.getElementById('closeVisit');

    // Visitor toggle behavior
    visitToggle.addEventListener('click', ()=> {
      visitBox.style.display = visitBox.style.display === 'block' ? 'none' : 'block';
    });
    closeVisit.addEventListener('click', ()=> visitBox.style.display = 'none');

    // Card links (replaceable by you later)
    document.getElementById('watchMore').href = "https://example.com/watch-more"; // change later
    document.getElementById('favLink').href = "https://example.com/favourites";
    document.getElementById('contactLink').href = "https://example.com/contact";

    // Fair (share) behavior: will share this site link (current origin)
    document.getElementById('fairBtn').addEventListener('click', async () => {
      const shareUrl = location.href;
      if (navigator.share) {
        try {
          await navigator.share({ title: document.title, url: shareUrl });
        } catch (e) {
          // user cancelled or error -> fallback to copy
          copyToClipboard(shareUrl);
          alert('Link copied to clipboard.');
        }
      } else {
        copyToClipboard(shareUrl);
        alert('Link copied to clipboard.');
      }
    });

    function copyToClipboard(text){
      try {
        navigator.clipboard.writeText(text);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy'); ta.remove();
      }
    }

    // graceful show error
    function showError(msg){
      errorDiv.style.display = 'block';
      errorDiv.textContent = msg;
    }

    // If no source provided, show usage hint
    if (!rawURL) {
      video.style.display = 'none';
      showError('No video link found. Use format: /ios=YOUR_M3U8_URL  (apply URL-encoding)');
      return;
    }

    // Helper: choose default level index (prefers 360)
    function findDefaultLevel(levels) {
      if (!levels || levels.length === 0) return -1;
      // try find exact 360
      let idx = levels.findIndex(l => l.height === 360);
      if (idx !== -1) return idx;
      // otherwise try nearest to 360
      const heights = levels.map(l => l.height || 0);
      let nearest = 0, bestDiff = Infinity;
      heights.forEach((h,i) => {
        const d = Math.abs((h||0) - 360);
        if (d < bestDiff) { bestDiff = d; nearest = i; }
      });
      return nearest;
    }

    // If the URL looks like .mp3 or audio only, use audio tag fallback
    const isMp3 = rawURL.toLowerCase().includes('.mp3');
    // For some direct mp4 or other progressive formats, the browser may handle them natively
    const isMp4 = rawURL.toLowerCase().includes('.mp4');

    if (window.Hls && Hls.isSupported() && !isMp3 && (rawURL.toLowerCase().includes('.m3u8') || rawURL.toLowerCase().includes('.m3u'))) {
      // HLS.js path
      const hls = new Hls({
        maxBufferLength: 90,
        liveSyncDuration: 30,
        fragLoadingRetryDelay: 1000,
        fragLoadingMaxRetry: 6,
        manifestLoadingMaxRetry: 6,
        enableWorker: true,
        lowLatencyMode: false,
      });

      let recoverAttempt = 0;

      function attach() {
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, function(){
          hls.loadSource(rawURL);
        });
      }

      hls.on(Hls.Events.ERROR, function(event, data) {
        console.warn('HLS error', data);
        if (data && data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // try to reload
              recoverAttempt++;
              if (recoverAttempt <= 8) {
                console.warn('network error — retrying load', recoverAttempt);
                setTimeout(()=>{ try{ hls.startLoad(); hls.loadSource(rawURL);}catch(e){} }, 1000 * recoverAttempt);
              } else {
                showError('Network error — cannot load stream.');
                hls.destroy();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              showError('Could not load video. Try a different stream.');
              hls.destroy();
              break;
          }
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, function(_, data) {
        // Setup Plyr with qualities
        const available = hls.levels.map(l=>l.height).filter(Boolean).sort((a,b)=>a-b);
        // pick default level index
        const defaultIdx = findDefaultLevel(hls.levels);
        if (defaultIdx !== -1) hls.currentLevel = defaultIdx;

        // Plyr instance and quality integration
        window.player = new Plyr(video, {
          controls: ['play-large','rewind','play','fast-forward','progress','current-time','mute','volume','settings','pip','airplay','fullscreen'],
          settings: ['quality'],
          quality: {
            default: hls.levels[defaultIdx] ? hls.levels[defaultIdx].height : available[0],
            options: available.length ? available : [360],
            forced: true,
            onChange: q=> {
              const idx = hls.levels.findIndex(l => l.height === q);
              if (idx !== -1) hls.currentLevel = idx;
            }
          }
        });

        // Try to autoplay
        video.play().catch(()=>{ /* user gesture may be required */ });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, function(evt, data){
        // nothing extra for now
      });

      attach();
      // safety: if manifest or segments fail after some time, show error
      setTimeout(()=> {
        if (!hls.levels || hls.levels.length === 0) {
          // still empty -> show message but allow manual attempts
          // keep video visible; let user try
          console.warn('No levels found in HLS manifest.');
        }
      }, 8000);

    } else if (isMp3 || isMp4 || video.canPlayType('application/vnd.apple.mpegurl')) {
      // Browser native path or audio
      if (isMp3) {
        // replace with audio element for better UX on audio-only streams
        const aud = document.createElement('audio');
        aud.controls = true;
        aud.autoplay = true;
        aud.style.width = '100%';
        aud.src = rawURL;
        const wrap = document.getElementById('playerWrap');
        wrap.replaceChild(aud, video);
        window.player = new Plyr(aud, { controls: ['play','progress','current-time','volume'] });
        aud.addEventListener('error', ()=> showError('Could not load audio stream.'));
      } else {
        // mp4 or native m3u8-playable
        video.src = rawURL;
        window.player = new Plyr(video, {
          controls: ['play-large','play','progress','current-time','mute','volume','settings','fullscreen'],
          settings: ['quality']
        });
        video.addEventListener('error', ()=> showError('Could not load video. Try another stream.'));
        video.addEventListener('loadedmetadata', ()=> {
          video.play().catch(()=>{});
        });
      }
    } else {
      video.style.display = 'none';
      showError('Your browser does not support HLS playback. Use a browser with HLS or provide a direct MP4/MP3 link.');
    }

  })();
</script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  }
};
