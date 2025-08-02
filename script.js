let audioContext;
let analyser;
let microphone;
let dataArray;

const threshold = 50; // You can lower this if detection is too insensitive
let blown = false;

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
    detectBlow();
  } catch (err) {
    alert("Microphone access is needed for this to work.");
    console.error("Error accessing microphone:", err);
  }
}

function detectBlow() {
  requestAnimationFrame(detectBlow);

  analyser.getByteTimeDomainData(dataArray);

  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const deviation = dataArray[i] - 128;
    sum += deviation * deviation;
  }

  const volume = Math.sqrt(sum / dataArray.length);

  console.log("Volume detected:", volume.toFixed(2)); // DEBUG

  if (volume > threshold && !blown) {
    console.log("Blow detected! Volume exceeded threshold.");
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
  console.log("Page loaded. Initializing mic...");
  initMic();
});
