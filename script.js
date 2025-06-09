let player;
let tapState = 0;
let startTime = 0;
let endTime = 0;
let loopInterval;
let isLooping = false;
const CHECK_INTERVAL = 20; // Уменьшенный интервал до 20 мс

function toggleVideoVisibility() {
  const showVideo = document.getElementById('show-video').checked;
  document.getElementById('player-container').style.display = showVideo ? 'block' : 'none';
}

function loadVideo() {
  const url = document.getElementById('youtube-url').value;
  const videoId = extractVideoId(url);

  if (!player) {
    player = new YT.Player('player', {
      videoId: videoId,
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  } else {
    cancelLoop();
    player.loadVideoById(videoId);
  }
  
  if (document.getElementById('show-video').checked) {
    document.getElementById('player-container').style.display = 'block';
  }
}

function onPlayerReady(event) {
  console.log("Player is ready");
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING && isLooping) {
    checkTimeLoop();
  }
}

function checkTimeLoop() {
  if (!player || !isLooping) return;

  const currentTime = player.getCurrentTime();
  if (currentTime >= endTime) {
    player.seekTo(startTime);
    player.playVideo();
  }
}

function handleTap() {
  if (!player) return;

  const currentTime = player.getCurrentTime();
  
  if (tapState === 0) {
    startTime = currentTime;
    document.getElementById('start-time').value = startTime.toFixed(1);
    document.getElementById('tap-status').textContent = `Start set: ${startTime.toFixed(1)}s. Tap again for end.`;
    tapState = 1;
  } else {
    endTime = currentTime;
    document.getElementById('end-time').value = endTime.toFixed(1);
    document.getElementById('tap-status').textContent = `Loop set: ${startTime.toFixed(1)}s → ${endTime.toFixed(1)}s`;
    tapState = 0;
  }
}

function toggleLoop() {
  if (isLooping) {
    cancelLoop();
  } else {
    startLoop();
  }
}

function startLoop() {
  if (!player) return;
  
  startTime = parseFloat(document.getElementById('start-time').value) || 0;
  endTime = parseFloat(document.getElementById('end-time').value) || 0;
  
  if (startTime >= endTime) {
    alert("End time must be greater than start time!");
    return;
  }

  isLooping = true;
  document.getElementById('loop-btn').classList.add('looping');
  
  player.seekTo(startTime);
  player.playVideo();
  
  loopInterval = setInterval(checkTimeLoop, CHECK_INTERVAL);
  document.getElementById('tap-status').textContent = `Looping: ${startTime.toFixed(1)}s → ${endTime.toFixed(1)}s`;
}

function cancelLoop() {
  isLooping = false;
  document.getElementById('loop-btn').classList.remove('looping');
  
  if (loopInterval) {
    clearInterval(loopInterval);
    loopInterval = null;
  }
  document.getElementById('tap-status').textContent = "Loop stopped";
}

function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Инициализация YouTube API
window.onYouTubeIframeAPIReady = function() {
  if (player) return;
  const videoId = extractVideoId(document.getElementById('youtube-url').value);
  if (videoId) {
    player = new YT.Player('player', {
      videoId: videoId,
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  }
};
