export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname || "/";
    let m3u8 = null;
    const iosMatch = path.match(/^\/ios=(.+)$/);
    if (iosMatch && iosMatch[1]) {
      try { m3u8 = decodeURIComponent(iosMatch[1]); }
      catch(e){ m3u8 = iosMatch[1]; }
    }
    const safeM3u8 = m3u8 ? m3u8.replace(/`/g, '\\`') : null;

    const html = `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<title>FANCODE LIVE — Modern Player</title>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.css"/>

<style>
  /* --- Theme --- */
  :root{
    --bg: #060607;
    --panel: #0f1113;
    --muted: #9aa0a6;
    --accent: #ffd600; /* yellow accent for progress & highlights */
    --glass: rgba(255,255,255,0.03);
    --shadow: 0 12px 34px rgba(2,6,23,0.7);
    --radius: 14px;
  }
  *{box-sizing:border-box}
  html,body{height:100%;margin:0;background:linear-gradient(180deg,#040405 0%, #0b0b0d 100%);font-family:Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;color:#e8eef6;-webkit-font-smoothing:antialiased;}
  .wrap{max-width:1100px;margin:18px auto;padding:12px;display:flex;flex-direction:column;gap:14px;}
  /* Player card */
  .player-card{
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow:hidden;
    border: 1px solid rgba(255,255,255,0.03);
  }
  .player-top{
    display:flex;align-items:center;justify-content:space-between;padding:12px 14px;
    gap:8px;
  }
  .title {font-weight:700;font-size:16px}
  .meta {color:var(--muted);font-size:13px}

  /* video area */
  .video-area{background:#000;position:relative;}
  video, audio{width:100%;height:62vh;max-height:72vh;display:block;background:#000;outline:none;}
  @media(max-width:880px){ video, audio{height:44vh;} }

  /* Plyr custom sizes */
  .plyr--full-ui .plyr__controls { padding:6px 8px; }
  .plyr__control{ padding:6px !important; border-radius:8px; min-width:36px; min-height:36px; }
  .plyr__controls .plyr__control svg{ width:16px;height:16px; }

  /* override progress played color to yellow */
  .plyr__progress--played { background: var(--accent) !important; }

  /* small buttons row under player */
  .mini-actions{display:flex;gap:8px;align-items:center;padding:10px 14px;background:transparent;}
  .btn {
    background:var(--glass); border:1px solid rgba(255,255,255,0.04);
    color:#fff;padding:8px 10px;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;display:inline-flex;gap:8px;align-items:center;
    transition:transform .12s ease, box-shadow .12s ease;
  }
  .btn:hover{ transform:translateY(-4px); box-shadow:0 10px 26px rgba(0,0,0,0.5); }
  .btn.small{ padding:6px 8px;font-size:12px; border-radius:8px; }

  /* extras area (like YouTube suggestions) */
  .extras { display:flex; gap:10px; margin-top:8px; overflow-x:auto; padding-bottom:6px;}
  .card { flex:0 0 210px; background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border-radius:12px; padding:10px; min-height:110px; display:flex;flex-direction:column; justify-content:space-between; cursor:pointer; border:1px solid rgba(255,255,255,0.03); }
  .thumb { height:86px; border-radius:8px; background:#020202; display:flex;align-items:center;justify-content:center;color:var(--muted); font-size:12px; }
  .card h4{ margin:8px 0 4px; font-size:14px; }
  .card p{ margin:0; color:var(--muted); font-size:12px; }

  /* visitor counter popup */
  #visitToggle{ position:fixed; right:18px; bottom:18px; z-index:1400; }
  #visitToggle .btn{ display:flex; align-items:center; gap:8px; background:linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); }
  #visitPopup{ position:fixed; right:18px; bottom:72px; z-index:1400; display:none; background:var(--panel); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.03); box-shadow:0 12px 34px rgba(0,0,0,0.6); }
  #visitPopup img{ height:28px; display:block; }

  /* error notice */
  .error { padding:12px; background:#1a0d0d;border-radius:10px;color:#ffd6d6;font-weight:600; display:none; }

  /* small helper text */
  .hint{color:var(--muted);font-size:12px;margin-top:4px}
</style>
</head>
<body>
  <div class="wrap">
    <div class="player-card" role="main" aria-label="Live player">
      <div class="player-top">
        <div>
          <div class="title">FANCODE LIVE — Stream</div>
          <div class="meta">Auto-play | Default: 360p (if available) | Robust HLS recovery</div>
        </div>
        <div class="meta">Powered by Plyr • HLS.js</div>
      </div>

      <div class="video-area">
        <video id="player" playsinline controls crossorigin="anonymous" preload="auto"></video>
        <div id="error" class="error" role="alert"></div>
      </div>

      <div class="mini-actions" aria-hidden="false">
        <button id="shareBtn" class="btn small" title="Share page">🔗 Share</button>
        <button id="visitBtn" class="btn small" title="Toggle visitors">👁‍🗨 Visitors</button>
        <button id="retryBtn" class="btn small" title="Retry stream">↻ Retry</button>
        <div style="flex:1"></div>
        <div class="hint">No button required — stream starts automatically.</div>
      </div>

      <div style="padding:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="font-weight:700">Watch More</div>
          <div style="color:var(--muted);font-size:13px">Suggested</div>
        </div>

        <div class="extras" id="extras">
          <!-- Cards inserted by JS -->
        </div>
      </div>
    </div>
  </div>

  <!-- Visitor popup -->
  <div id="visitToggle">
    <button id="visitToggleBtn" class="btn small">👁‍🗨 Show Visitors</button>
  </div>
  <div id="visitPopup">
    <button id="closeVisit" class="btn small" style="float:right;padding:4px 8px;margin:-8px -8px 8px 0">✕</button>
    <div style="clear:both"></div>
    <img id="visitImg" src="https://visit-counter.vercel.app/counter.png?page=https%3A%2F%2Fjio-fancode.pages.dev&s=55&c=ffd600&bg=00000000&no=1&ff=digii" alt="visits">
  </div>

  <!-- libs -->
  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.4.0/dist/hls.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.min.js"></script>

<script>
(function(){
  const raw = ${safeM3u8 ? '`' + safeM3u8 + '`' : 'null'};
  const playerEl = document.getElementById('player');
  const err = document.getElementById('error');
  const shareBtn = document.getElementById('shareBtn');
  const visitBtn = document.getElementById('visitToggleBtn');
  const visitPopup = document.getElementById('visitPopup');
  const closeVisit = document.getElementById('closeVisit');
  const retryBtn = document.getElementById('retryBtn');
  const extras = document.getElementById('extras');

  // Small suggestion cards (replace links/titles later)
  const suggestions = [
    {title:'Match Highlights',desc:'Replays & best moments',link:'https://example.com/highlights'},
    {title:'Upcoming Streams',desc:'Schedule & fixtures',link:'https://example.com/schedule'},
    {title:'Favourite List',desc:'Your saved streams',link:'https://example.com/favourites'},
    {title:'Support / Contact',desc:'Get help',link:'https://example.com/contact'}
  ];
  // render suggestions
  suggestions.forEach(s => {
    const c = document.createElement('a');
    c.className = 'card';
    c.href = s.link; c.target = '_blank'; c.rel = 'noopener';
    c.innerHTML = '<div class="thumb">THUMB</div><div><h4>'+s.title+'</h4><p>'+s.desc+'</p></div>';
    extras.appendChild(c);
  });

  // visitor popup toggle
  visitBtn.addEventListener('click', ()=> {
    visitPopup.style.display = visitPopup.style.display === 'block' ? 'none' : 'block';
  });
  document.getElementById('visitToggleBtn').addEventListener('click', ()=> {
    visitPopup.style.display = visitPopup.style.display === 'block' ? 'none' : 'block';
  });
  closeVisit.addEventListener('click', ()=> visitPopup.style.display = 'none');

  // share button: navigator.share OR copy link to clipboard
  shareBtn.addEventListener('click', async () => {
    const shareUrl = location.href;
    try {
      if (navigator.share) {
        await navigator.share({title: document.title, url: shareUrl});
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard.');
      }
    } catch(e) {
      try { await navigator.clipboard.writeText(shareUrl); alert('Link copied to clipboard.'); } catch(err){ alert('Cannot copy link.'); }
    }
  });

  // retry button: reloads the stream attempt
  retryBtn.addEventListener('click', ()=> initStream(true));

  function showError(msg) {
    err.style.display = 'block';
    err.textContent = msg;
  }
  function hideError() { err.style.display = 'none'; err.textContent = ''; }

  if (!raw) {
    playerEl.style.display = 'none';
    showError('No stream provided. Use format: /ios=URL (URL-encode the value).');
    return;
  }

  // choose default level index preferring 360
  function findDefaultLevel(levels) {
    if (!levels || !levels.length) return -1;
    let idx = levels.findIndex(l => l.height === 360);
    if (idx !== -1) return idx;
    // nearest to 360
    let best = 0, bestDiff = Infinity;
    levels.forEach((l,i)=> {
      const h = l.height || 0;
      const d = Math.abs(h - 360);
      if (d < bestDiff) { bestDiff = d; best = i; }
    });
    return best;
  }

  // main init
  let hlsInstance = null;
  let plyrInstance = null;

  async function initStream(retry=false) {
    hideError();
    // cleanup previous
    try{ if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; } } catch(e){}
    try{ if (plyrInstance) { plyrInstance.destroy(); plyrInstance = null; } } catch(e){}

    // If it's an mp3 link, use audio element for UX
    const lower = raw.toLowerCase();
    const isMp3 = lower.includes('.mp3');
    const isMp4 = lower.includes('.mp4');
    const looksLikeHls = lower.includes('.m3u8') || lower.includes('.m3u');

    if (isMp3) {
      const audio = document.createElement('audio');
      audio.controls = true; audio.autoplay = true; audio.preload = 'auto';
      audio.src = raw;
      playerEl.parentNode.replaceChild(audio, playerEl);
      playerEl = audio;
      plyrInstance = new Plyr(audio, { controls: ['play', 'progress', 'current-time','volume'] });
      audio.addEventListener('error', ()=> showError('Could not load audio.'));
      return;
    }

    // If browser supports HLS natively and it's m3u8, set src
    if (playerEl.canPlayType && playerEl.canPlayType('application/vnd.apple.mpegurl') && looksLikeHls) {
      playerEl.src = raw;
      plyrInstance = new Plyr(playerEl, { controls: ['play-large','play','progress','current-time','mute','volume','settings','fullscreen'], settings:['quality'] });
      playerEl.addEventListener('loadedmetadata', ()=> { playerEl.play().catch(()=>{}); });
      playerEl.addEventListener('error', ()=> showError('Could not load video (native HLS).'));
      return;
    }

    // Use HLS.js for .m3u8 or when Hls.isSupported()
    if (window.Hls && Hls.isSupported() && looksLikeHls) {
      hlsInstance = new Hls({
        maxBufferLength: 90,
        liveSyncDuration: 30,
        fragLoadingMaxRetry: 8,
        fragLoadingRetryDelay: 1000,
        manifestLoadingMaxRetry: 6,
        manifestLoadingRetryDelay: 1000,
        enableWorker: true,
        lowLatencyMode: false
      });

      let networkAttempts = 0;
      hlsInstance.attachMedia(playerEl);
      hlsInstance.on(Hls.Events.MEDIA_ATTACHED, ()=> {
        try { hlsInstance.loadSource(raw); } catch(e){ showError('Load failed.'); }
      });

      hlsInstance.on(Hls.Events.ERROR, (evt, data) => {
        console.warn('HLS error', data);
        if (data && data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            networkAttempts++;
            if (networkAttempts <= 8) {
              setTimeout(()=> { try{ hlsInstance.startLoad(); hlsInstance.loadSource(raw); } catch(e){} }, 1000 * networkAttempts);
            } else {
              showError('Network: cannot load stream.');
              hlsInstance.destroy();
            }
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            try { hlsInstance.recoverMediaError(); } catch(e){ showError('Media error.'); }
          } else {
            showError('Playback error — try another stream.');
            hlsInstance.destroy();
          }
        }
      });

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, ()=> {
        const levels = hlsInstance.levels || [];
        const heights = levels.map(l=>l.height).filter(Boolean).sort((a,b)=>a-b);
        const defaultIdx = findDefaultLevel(levels);
        if (defaultIdx !== -1) hlsInstance.currentLevel = defaultIdx;
        // Plyr + quality integration
        plyrInstance = new Plyr(playerEl, {
          controls: ['play-large','rewind','play','fast-forward','progress','current-time','mute','volume','settings','pip','airplay','fullscreen'],
          settings: ['quality'],
          quality: {
            default: levels[defaultIdx] ? levels[defaultIdx].height : (heights[0] || 360),
            options: heights.length ? heights : [360],
            forced: true,
            onChange: q => {
              const idx = hlsInstance.levels.findIndex(l => l.height === q);
              if (idx !== -1) hlsInstance.currentLevel = idx;
            }
          }
        });
        // autoplay attempt
        playerEl.play().catch(()=>{ /* user gesture maybe required */ });
      });

      // fallback: after time, if no levels found show hint but keep trying
      setTimeout(()=> {
        if (hlsInstance && (!hlsInstance.levels || hlsInstance.levels.length === 0)) {
          console.warn('No levels in manifest yet.');
        }
      }, 7000);

      return;
    }

    // plain MP4 or unknown: try direct src
    if (isMp4 || !looksLikeHls) {
      playerEl.src = raw;
      plyrInstance = new Plyr(playerEl, { controls: ['play-large','play','progress','current-time','mute','volume','settings','fullscreen'] });
      playerEl.addEventListener('error', ()=> showError('Could not load video. Try different stream.'));
      playerEl.addEventListener('loadedmetadata', ()=> playerEl.play().catch(()=>{}));
      return;
    }

    // final fallback
    showError('Your browser cannot play this stream. Provide a .m3u8 or mp4 link or use a modern browser.');
  }

  // Start immediately
  initStream();

  // Expose a small reload mechanism if user wants
  window.__FANCODE_RELOAD = ()=> initStream(true);

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
