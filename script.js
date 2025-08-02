let audioContext;
let analyser;
let microphone;
let dataArray;

const threshold = 200;
let blown = false;
let started = false;

async function initMic() {
  try {
    console.log("Requesting microphone access...");
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Microphone access granted.");

    microphone = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    microphone.connect(analyser);

    dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Wait a moment to avoid initial click triggering false blow
    setTimeout(() => {
      started = true;
      detectBlow();
    }, 1000);
  } catch (err) {
    alert("Microphone access is needed for this to work.");
    console.error("Error accessing microphone:", err);
  }
}

function detectBlow() {
  requestAnimationFrame(detectBlow);

  analyser.getByteFrequencyData(dataArray);
  let maxVolume = Math.max(...dataArray);

  console.log("Max frequency volume:", maxVolume);

  if (started && maxVolume > threshold && !blown) {
    console.log("Blow detected by frequency volume!");
    blowOutCandles();
  }
}

function blowOutCandles() {
  blown = true;
  const cake = document.getElementById("cake");
  cake.src = "assets/cake-blown.png";
  console.log("Cake image changed to blown version.");
  document.getElementById("hint").textContent = "Candles blown out! 🎉";
}

window.addEventListener("load", () => {
  console.log("Page loaded. Waiting for user interaction...");

  const modal = document.getElementById("celebrateModal");
  const startBtn = document.getElementById("startButton");

  startBtn.addEventListener("click", async () => {
    modal.style.display = "none";

    if (!audioContext || audioContext.state === "suspended") {
      await audioContext?.resume();
    }

    initMic();
  });
});
