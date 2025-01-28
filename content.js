// Create and inject CSS
const style = document.createElement("style");
style.id = "tts-extension-styles";
style.textContent = `
#tts-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  background-color: #007BFF;
  border: 2px solid #007BFF;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1000;
  background-image: url('${chrome.runtime.getURL("icons/main-icon.png")}');
  background-size: cover;
  transition: transform 0.4s;
}

#tts-button:hover {
  transform: scale(1.1);
}

#tts-popup {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 250px;
  padding: 5px;
  background-color: var(--background-color);
  color: var(--text-color);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  z-index: 1000;
  display: none;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.control-group {
  margin-bottom: 10px;
  display: flex;
  align-items: center;

}

.control-group select {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: var(--input-background);
  color: var(--text-color);
}

.control-group-2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 10px;
}

.control-group-2 .middle {
  width: 76%;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.range-slider {
border:2px solid;
  width: 100%;
  height: 8px;
  background: var(--slider-background);
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
  border-radius: 5px;
}

.range-slider:hover {
  opacity: 1;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #007BFF;
  cursor: pointer;
  border-radius: 50%;
}

.range-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #007BFF;
  cursor: pointer;
  border-radius: 50%;
}

#speak-button {
  width: 45px;
  height: 44px;
  background-color: #007BFF;
  background-image: url('${chrome.runtime.getURL("icons/icon-play.png")}');
  background-size: 100%;
  background-position: center;
  background-repeat: no-repeat;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

#speak-button:hover {
  background-color: #0056b3;
}

.audio-wave {
  width: 125%;
  height: 4vh;
  visibility: hidden; 
}

.audio-wave .wave {
  height: 20px;
  width: 40px;
  margin-top: 5px;
  display: inline-block;
  background-image: url('${chrome.runtime.getURL("icons/audio-wave.gif")}');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.audio-wave :first-child {
  position: relative;
  left: 38px;
  top: 4px;
}
.audio-wave :nth-child(2) {
  position: relative;
  left: 6px;
  top: 4px;
}
.audio-wave :nth-child(3) {
  position: relative;
  right: 1px;
  top: 4px;
}
.audio-wave :nth-child(4) {
  position: relative;
  right: 26px;
  top: 4px;
}
.audio-wave :nth-child(5) {
  position: relative;
  right: 39px;
  top: 4px;
}


hr {
  width: 64%;
  height: 2px;
  margin: 0 auto;
  background: rgb(147, 39, 223);
  border: none;
}

/* Dark theme variables */
@media (prefers-color-scheme: dark) {
  :root {
    --background-color: #1e1e1e;
    --text-color: #ffffff;
    --border-color: #444;
    --input-background: #333;
    --slider-background: #555;
  }
}

/* Light theme variables */
@media (prefers-color-scheme: light) {
  :root {
    --background-color: #ffffff;
    --text-color: #000000;
    --border-color: #ccc;
    --input-background: #f9f9f9;
    --slider-background: #ddd;
  }
}
`;

document.head.appendChild(style);

// Create floating button
const button = document.createElement("button");
button.id = "tts-button";
button.title = "TTS Controls";
document.body.appendChild(button);

// Create popup container
const popup = document.createElement("div");
popup.id = "tts-popup";
popup.innerHTML = `
  <div class="control-group">
    <select id="voices"></select>
  </div>

  <div class="control-group-2"> 
    <button id="speak-button"></button>

    <div class="middle">
      <input type="range" id="rate" class="range-slider" min="0.8" max="1.4" step="0.04" value="1">
  
      <div class="audio-wave">
      
        <span class="wave"></span>
        <span class="wave"></span>
        <span class="wave"></span>
        <span class="wave"></span>
        <span class="wave"></span>
        <hr style="visibility: visible"/>
    </div>
  </div>
`;
document.body.appendChild(popup);

// Initialize variables
let voices = [];
let selectedVoice = null;
let speechRate = 1;
let isSpeaking = false;
let utterance = null;

// Populate voices
function populateVoices() {
  voices = speechSynthesis.getVoices();
  const voicesSelect = document.getElementById("voices");
  voicesSelect.innerHTML = "";
  voices.forEach((voice, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${voice.name} (${voice.lang})`;
    voicesSelect.appendChild(option);
  });
  // Load saved voice from storage
  chrome.storage.local.get(["selectedVoice"], (result) => {
    if (result.selectedVoice !== undefined && voices[result.selectedVoice]) {
      voicesSelect.value = result.selectedVoice;
      selectedVoice = voices[result.selectedVoice];
    } else {
      selectedVoice = voices[0];
    }
  });
}

populateVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoices;
}

// Handle rate change
const rateInput = document.getElementById("rate");
const rateValue = document.getElementById("rate-value");
rateInput.addEventListener("input", () => {
  speechRate = rateInput.value;
  rateValue.textContent = speechRate;
  chrome.storage.local.set({ speechRate });
});

// Load saved rate from storage
chrome.storage.local.get(["speechRate"], (result) => {
  if (result.speechRate !== undefined) {
    rateInput.value = result.speechRate;
    rateValue.textContent = result.speechRate;
    speechRate = result.speechRate;
  }
});

// Handle voice selection
const voicesSelect = document.getElementById("voices");
voicesSelect.addEventListener("change", () => {
  selectedVoice = voices[voicesSelect.value];
  chrome.storage.local.set({ selectedVoice: voicesSelect.value });
});

// Handle speak button
const speakButton = document.getElementById("speak-button");
const audioWave = document.querySelector(".audio-wave");

speakButton.addEventListener("click", () => {
  if (isSpeaking && !isPaused) {
    // Pause speech
    speechSynthesis.pause();
    togglePaused(true);
  } else if (isSpeaking && isPaused) {
    // Resume speech
    speechSynthesis.resume();
    togglePaused(false);
  } else {
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      utterance = new SpeechSynthesisUtterance(selectedText);
      utterance.voice = selectedVoice;
      utterance.rate = speechRate;
      speechSynthesis.speak(utterance);
      toggleSpeaking(true);

      utterance.onend = () => {
        toggleSpeaking(false);
        togglePaused(false);
      };

      utterance.onerror = () => {
        toggleSpeaking(false);
        togglePaused(false);
        alert("An error occurred during speech synthesis.");
      };
    } else {
      alert("No text selected.");
    }
  }
});

// Toggle speaking state
function toggleSpeaking(state) {
  isSpeaking = state;
  isPaused = false;
  speakButton.style.backgroundImage = isSpeaking
    ? `url('${chrome.runtime.getURL("icons/icon-pause.png")}')`
    : `url('${chrome.runtime.getURL("icons/icon-play.png")}')`;
  audioWave.style.visibility = isSpeaking ? "visible" : "hidden"; // Show/hide audio wave
}

function togglePaused(state) {
  isPaused = state;
  speakButton.style.backgroundImage = isPaused
    ? `url('${chrome.runtime.getURL("icons/icon-play.png")}')`
    : `url('${chrome.runtime.getURL("icons/icon-pause.png")}')`;
}

// Toggle popup visibility
button.addEventListener("click", (e) => {
  e.stopPropagation();
  popup.style.display =
    popup.style.display === "none" || popup.style.display === ""
      ? "block"
      : "none";
});

// Hide popup when clicking outside
document.addEventListener("click", (event) => {
  if (!popup.contains(event.target) && !button.contains(event.target)) {
    popup.style.display = "none";
  }
});
