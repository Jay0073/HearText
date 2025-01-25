// Create and inject CSS
const style = document.createElement('style');
style.id = 'tts-extension-styles';
style.textContent = `
#tts-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  background-color: #007BFF;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1000;
  background-image: url('${chrome.runtime.getURL('icons/main-ioc.png')}');
  background-size: cover;
  transition: transform 0.2s;
}
#tts-button:hover {
  transform: scale(1.1);
}
#tts-popup {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 220px;
  padding: 10px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  z-index: 1000;
  display: none;
  font-family: Arial, sans-serif;
}
#tts-popup h3 {
  text-align: center;
  margin-top: 0;
}
.control-group {
  margin-bottom: 10px;
}
.control-group label {
  display: block;
  margin-bottom: 5px;
}
.control-group select, .control-group input[type="range"] {
  width: 100%;
}
#rate-value {
  float: right;
}
#speak-button {
  width: 100%;
  padding: 8px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
#speak-button:hover {
  background-color: #0056b3;
}
`;

document.head.appendChild(style);

// Create floating button
const button = document.createElement('button');
button.id = 'tts-button';
button.title = 'TTS Controls';
document.body.appendChild(button);

// Create popup container
const popup = document.createElement('div');
popup.id = 'tts-popup';
popup.innerHTML = `
  <h3>TTS Controls</h3>
  <div class="control-group">
    <label for="voices">Voice:</label>
    <select id="voices"></select>
  </div>
  <div class="control-group">
    <label for="rate">Rate:</label>
    <input type="range" id="rate" min="0.5" max="2" step="0.1" value="1">
    <span id="rate-value">1</span>
  </div>
  <button id="speak-button">Speak</button>
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
  const voicesSelect = document.getElementById('voices');
  voicesSelect.innerHTML = '';
  voices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${voice.name} (${voice.lang})`;
    voicesSelect.appendChild(option);
  });
  // Load saved voice from storage
  chrome.storage.local.get(['selectedVoice'], (result) => {
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
const rateInput = document.getElementById('rate');
const rateValue = document.getElementById('rate-value');
rateInput.addEventListener('input', () => {
  speechRate = rateInput.value;
  rateValue.textContent = speechRate;
  chrome.storage.local.set({ speechRate });
});

// Load saved rate from storage
chrome.storage.local.get(['speechRate'], (result) => {
  if (result.speechRate !== undefined) {
    rateInput.value = result.speechRate;
    rateValue.textContent = result.speechRate;
    speechRate = result.speechRate;
  }
});

// Handle voice selection
const voicesSelect = document.getElementById('voices');
voicesSelect.addEventListener('change', () => {
  selectedVoice = voices[voicesSelect.value];
  chrome.storage.local.set({ selectedVoice: voicesSelect.value });
});

// Handle speak button
const speakButton = document.getElementById('speak-button');
speakButton.addEventListener('click', () => {
  if (isSpeaking) {
    speechSynthesis.cancel();
    toggleSpeaking(false);
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
      };

      utterance.onerror = () => {
        toggleSpeaking(false);
        alert('An error occurred during speech synthesis.');
      };
    } else {
      alert('No text selected.');
    }
  }
});

// Toggle speaking state
function toggleSpeaking(state) {
  isSpeaking = state;
  speakButton.textContent = isSpeaking ? 'Stop' : 'Speak';
  // Update button icon
  button.style.backgroundImage = isSpeaking ? `url('${chrome.runtime.getURL('icons/icon-play.png')}')` : `url('${chrome.runtime.getURL('icons/icon-pause.png')}')`;
}

// Toggle popup visibility
button.addEventListener('click', (e) => {
  e.stopPropagation();
  popup.style.display = popup.style.display === 'none' || popup.style.display === '' ? 'block' : 'none';
});

// Hide popup when clicking outside
document.addEventListener('click', (event) => {
  if (!popup.contains(event.target) && !button.contains(event.target)) {
    popup.style.display = 'none';
  }
});
