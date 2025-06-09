let players = [];
let loopStates = [];

function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function addLoopRow() {
  const container = document.getElementById('loops-container');
  const template = document.getElementById('loop-row-template');
  const clone = template.content.cloneNode(true);
  const rowIndex = players.length;

  const row = clone.querySelector('.loop-row');

  const urlInput = row.querySelector('.youtube-url');
  const loadBtn = row.querySelector('.load-video-btn');
  const showCheckbox = row.querySelector('.show-video-checkbox');
  const playerContainer = row.querySelector('.player-container');
  const tapBtn = row.querySelector('.tap-btn');
  const tapStatus = row.querySelector('.tap-status');
  const startInput = row.querySelector('.start-time');
  const endInput = row.querySelector('.end-time');
  const loopBtn = row.querySelector('.loop-btn');

  let tapState = 0;
  let startTime = 0;
  let endTime = 0;
  let isLooping = false;
  let loopInterval = null;

  function toggleVideoVisibility() {
    playerContainer.style.display = showCheckbox.checked ? 'block' : 'none';
  }

  function checkTimeLoop() {
    if (!players[rowIndex] || !isLooping) return;
    const currentTime = players[rowIndex].getCurrentTime();
    if (currentTime >= endTime) {
      players[rowIndex].seekTo(startTime);
      players[rowIndex].playVideo();
    }
  }

  function cancelLoop() {
    isLooping = false;
    loopBtn.classList.remove('looping');
    if (loopInterval) {
      clearInterval(loopInterval);
      loopInterval = null;
    }
    tapStatus.textContent = "Loop stopped";
  }

  function startLoop() {
    if (!players[rowIndex]) return;

    startTime = parseFloat(startInput.value) || 0;
    endTime = parseFloat(endInput.value) || 0;

    if (startTime >= endTime) {
      alert("End time must be greater than start time!");
      return;
    }

    isLooping = true;
    loopBtn.classList.add('looping');
    tapStatus.textContent = `Looping: ${startTime.toFixed(1)}s → ${endTime.toFixed(1)}s`;
    players[rowIndex].seekTo(startTime);
    players[rowIndex].playVideo();

    loopInterval = setInterval(checkTimeLoop, 20);
  }

  function handleTap() {
    if (!players[rowIndex]) return;
    const currentTime = players[rowIndex].getCurrentTime();

    if (tapState === 0) {
      startTime = currentTime;
      startInput.value = startTime.toFixed(1);
      tapStatus.textContent = `Start set: ${startTime.toFixed(1)}s. Tap again for end.`;
      tapState = 1;
    } else {
      endTime = currentTime;
      endInput.value = endTime.toFixed(1);
      tapStatus.textContent = `Loop set: ${startTime.toFixed(1)}s → ${endTime.toFixed(1)}s`;
      tapState = 0;
    }
  }

  loadBtn.onclick = () => {
    const videoId = extractVideoId(urlInput.value);
    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }

    if (players[rowIndex]) {
      cancelLoop();
      players[rowIndex].loadVideoById(videoId);
    } else {
      const playerDiv = document.createElement('div');
      playerContainer.innerHTML = '';
      playerContainer.appendChild(playerDiv);

      players[rowIndex] = new YT.Player(playerDiv, {
        videoId: videoId,
        events: {
          onReady: () => console.log("Player ready"),
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING && isLooping) checkTimeLoop();
          }
        }
      });
    }

    toggleVideoVisibility();
  };

  showCheckbox.onchange = toggleVideoVisibility;
  tapBtn.onclick = handleTap;
  loopBtn.onclick = () => isLooping ? cancelLoop() : startLoop();

  container.appendChild(row);
}

// YouTube API init
window.onYouTubeIframeAPIReady = function () {
  // Optionally auto-add first row
  addLoopRow();
};
