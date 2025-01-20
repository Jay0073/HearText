// // Create the button element
// const floatingButton = document.createElement('div');
// floatingButton.id = 'speak-button';
// floatingButton.classList.add('floating-button');
// document.body.appendChild(floatingButton);

// // Create the options panel
// const optionsPanel = document.createElement('div');
// optionsPanel.id = 'options-panel';
// optionsPanel.classList.add('options-panel');
// optionsPanel.style.display = 'none'; // Initially hidden
// document.body.appendChild(optionsPanel);

// //Add Options to optionsPanel
// optionsPanel.innerHTML = `
//     <button id="speak-option">Speak</button>
//     <label for="rate-slider">Rate:</label>
//     <input type="range" id="rate-slider" min="0.5" max="2" step="0.1" value="1">
//     <select id="voice-select">
//     </select>
// `;

// // Fetch voices and populate the select element
// // chrome.tts.getVoices(voices => {
// //     const voiceSelect = document.getElementById('voice-select');
// //     voices.forEach(voice => {
// //         const option = document.createElement('option');
// //         option.value = voice.voiceName;
// //         option.text = voice.voiceName;
// //         voiceSelect.appendChild(option);
// //     });
// // });

// // Fetch voices and populate the select element
// async function populateVoices() {
//     try {
//         const voices = await chrome.tts.getVoices();
//         const voiceSelect = document.getElementById('voice-select');
//         voices.forEach(voice => {
//             const option = document.createElement('option');
//             option.value = voice.voiceName;
//             option.text = voice.voiceName;
//             voiceSelect.appendChild(option);
//         });
//     } catch (error) {
//         console.error("Error getting voices:", error);
//         // Handle the error appropriately, e.g., display a message to the user
//     }
// }

// populateVoices();

// // Button click handler
// floatingButton.addEventListener('click', () => {
//     optionsPanel.style.display = optionsPanel.style.display === 'block' ? 'none' : 'block';
//     floatingButton.classList.toggle('expanded');
//     const selectedText = window.getSelection().toString();
//     if(selectedText && !floatingButton.classList.contains('expanded')){
//         const rate = document.getElementById('rate-slider').value;
//         const voiceName = document.getElementById('voice-select').value;
//         chrome.runtime.sendMessage({ action: "speak", text: selectedText, rate: rate, voiceName: voiceName });
//     }
// });

// document.getElementById('speak-option').addEventListener('click', () => {
//         const selectedText = window.getSelection().toString();
//         if(selectedText){
//             const rate = document.getElementById('rate-slider').value;
//             const voiceName = document.getElementById('voice-select').value;
//             chrome.runtime.sendMessage({ action: "speak", text: selectedText, rate: rate, voiceName: voiceName });
//         }
// });


console.log(chrome)
const floatingButton = document.createElement('div');
floatingButton.id = 'speak-button';
floatingButton.classList.add('floating-button');

floatingButton.innerHTML = `
    <button id="speak-option">Speak</button>
    <button id="options-toggle">&#9650;</button>
`;

document.body.appendChild(floatingButton);

const optionsPanel = document.createElement('div');
optionsPanel.id = 'options-panel';
optionsPanel.classList.add('options-panel');
optionsPanel.style.display = 'none';
document.body.appendChild(optionsPanel);

optionsPanel.innerHTML = `
    <label for="rate-slider">Rate:</label>
    <input type="range" id="rate-slider" min="0.5" max="2" step="0.1" value="1">
    <select id="voice-select">
    </select>
`;

async function populateVoices() {
    try {
        const voices = await chrome.tts.getVoices();
        const voiceSelect = document.getElementById('voice-select');
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.voiceName;
            option.text = voice.voiceName;
            voiceSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error getting voices:", error);
    }
}

populateVoices();

const speakOption = document.getElementById('speak-option');
const optionsToggle = document.getElementById('options-toggle');

speakOption.addEventListener('click', () => {
    const selectedText = window.getSelection().toString();
    if (selectedText) {
        const rate = document.getElementById('rate-slider').value;
        const voiceName = document.getElementById('voice-select').value;
        chrome.runtime.sendMessage({ action: "speak", text: selectedText, rate: rate, voiceName: voiceName });
    }
});

optionsToggle.addEventListener('click', () => {
    optionsPanel.style.display = optionsPanel.style.display === 'block' ? 'none' : 'block';
});