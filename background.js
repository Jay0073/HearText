chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "speak") {
        chrome.tts.speak(request.text, { 'rate': parseFloat(request.rate), 'voiceName': request.voiceName });
    }
});