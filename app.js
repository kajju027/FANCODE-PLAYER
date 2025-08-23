// Helper: get m3u8 from URL via '?i=' or '/i='
function getStreamFromLocation() {
  const href = String(window.location.href);
  const idx = href.indexOf('i=');
  if (idx === -1) return null;
  let raw = href.slice(idx + 2);
  // Cut off anything after & or # or ? if user chained params
  for (const cut of ['&', '#', '?']) {
    const pos = raw.indexOf(cut);
    if (pos !== -1) raw = raw.slice(0, pos);
  }
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

// DOM
const video = document.getElementById('video');
const playPause = document.getElementById('playPause');
const mute = document.getElementById('mute');
const volume = document.getElementById('volume');
const speed = document.getElementById('speed');
const quality = document.getElementById('quality');
const pip = document.getElementById('pip');
const fullscreen = document.getElementById('fullscreen');
const seek = document.getElementById('seek');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const liveBadge = document.getElementById('liveBadge');
const srcInput = document.getElementById('srcInput');
const loadBtn = document.getElementById('loadBtn');

let hls = null;
let isLive = false;

function formatTime(sec) {
  if (!isFinite(sec)) return '--:--';
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  if (hh > 0) return `${hh.toString().padStart(2,'0')}:${mm.toString().padStart(2,'0')}:${rem.toString().padStart(2,'0')}`;
  return `${mm.toString().padStart(2,'0')}:${rem.toString().padStart(2,'0')}`;
}

function setupQualityLevels(hlsInstance) {
  // Fill quality dropdown
  quality.innerHTML = '<option value="auto">Auto</option>';
  const levels = hlsInstance.levels || [];
  levels.forEach((lvl, i) => {
    const label = lvl.height ? `${lvl.height}p` : (lvl.bitrate ? `${Math.round(lvl.bitrate/1000)}kbps` : `Level ${i}`);
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = label;
    quality.appendChild(opt);
  });
  quality.value = 'auto';
}

function markLiveState() {
  // An approximation: treat Infinity or live playlist type as live
  const dur = video.duration;
  const nearLive = isFinite(dur) ? (dur - video.currentTime < 3) : true;
  liveBadge.style.visibility = nearLive ? 'visible' : 'hidden';
}

async function loadStream(src) {
  if (!src) return;
  // Update input
  srcInput.value = src;

  // Destroy existing
  if (hls) {
    hls.destroy();
    hls = null;
  }

  // Native HLS
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
    video.addEventListener('loadedmetadata', () => {
      video.play().catch(()=>{});
    }, { once: true });
    isLive = !isFinite(video.duration);
  } else if (window.Hls) {
    hls = new Hls({
      // Low-latency friendly defaults
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    });
    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setupQualityLevels(hls);
      video.play().catch(()=>{});
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
      // Could update UI if needed
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      console.warn('HLS error', data);
    });

    isLive = true; // most m3u8 here will be live as per requirement
  } else {
    alert('এই ব্রাউজারে HLS সমর্থন নেই। Chrome/Edge/Firefox ব্যবহার করুন।');
    return;
  }
}

// Controls wiring
playPause.addEventListener('click', () => {
  if (video.paused) video.play(); else video.pause();
});

mute.addEventListener('click', () => {
  video.muted = !video.muted;
});

volume.addEventListener('input', () => {
  video.volume = parseFloat(volume.value);
});

speed.addEventListener('change', () => {
  video.playbackRate = parseFloat(speed.value);
});

quality.addEventListener('change', () => {
  if (!hls) return;
  const val = quality.value;
  if (val === 'auto') {
    hls.currentLevel = -1;
  } else {
    hls.currentLevel = parseInt(val, 10);
  }
});

pip.addEventListener('click', async () => {
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      await video.requestPictureInPicture();
    }
  } catch {}
});

fullscreen.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    video.requestFullscreen?.() || video.parentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});

seek.addEventListener('input', () => {
  const dur = video.duration;
  if (isFinite(dur) && dur > 0) {
    video.currentTime = (parseFloat(seek.value) / 100) * dur;
  }
});

video.addEventListener('timeupdate', () => {
  const dur = video.duration;
  if (isFinite(dur) && dur > 0) {
    const val = (video.currentTime / dur) * 100;
    seek.value = String(val);
  }
  currentTimeEl.textContent = formatTime(video.currentTime);
  durationEl.textContent = isFinite(dur) ? formatTime(dur) : '--:--';
  markLiveState();
});

// Load button
loadBtn.addEventListener('click', () => {
  const src = srcInput.value.trim();
  if (src) {
    const u = new URL(window.location.href);
    // Put into ?i= param for shareable link
    u.searchParams.set('i', src);
    history.replaceState(null, '', u.toString());
    loadStream(src);
  }
});

// Autoload from URL
const initial = getStreamFromLocation();
if (initial) {
  loadStream(initial);
}

// Fallback: focus the input for quick paste
if (!initial) {
  srcInput.focus();
}
