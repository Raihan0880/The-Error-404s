// Text-to-Speech (TTS) for agent responses and agent-initiated prompts
const synth = window.speechSynthesis;

function speak(text, lang = 'en-US') {
  if (!synth) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  synth.speak(utter);
}

// Example: Agent-initiated greeting (can be called on page load or after inactivity)
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    speak('Hi! I am your AI Farmer Agent. What region are you in? This helps me give you weather-based advice!', getSelectedLang());
  }, 1000);
});

// Helper to get selected language from dropdown (if present)
function getSelectedLang() {
  const sel = document.getElementById('lang-select');
  return sel ? sel.value : 'en-US';
}

// Listen for new agent messages and speak them
const chatWindow = document.getElementById('chat-window');
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === 1 && node.classList.contains('ai-message')) {
        speak(node.textContent, getSelectedLang());
      }
    }
  }
});
if (chatWindow) {
  observer.observe(chatWindow, { childList: true });
}

// Agent-initiated follow-up after user inactivity
let followUpTimeout;
function scheduleFollowUp() {
  clearTimeout(followUpTimeout);
  followUpTimeout = setTimeout(() => {
    speak('Is there anything else I can help you with? You can ask about plant health, weather, or farming tips.', getSelectedLang());
    showVoiceIndicator(true);
    setTimeout(() => showVoiceIndicator(false), 4000);
  }, 45000); // 45 seconds of inactivity
}
// Reset follow-up timer on user input
const userInput = document.getElementById('user-input');
userInput.addEventListener('input', scheduleFollowUp);
document.getElementById('chat-form').addEventListener('submit', scheduleFollowUp);
// Speak errors if they appear
const chatError = document.getElementById('chat-error');
const errorObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (!chatError.classList.contains('hidden') && chatError.textContent) {
      speak(chatError.textContent, getSelectedLang());
      showVoiceIndicator(true);
      setTimeout(() => showVoiceIndicator(false), 3000);
    }
  }
});
errorObserver.observe(chatError, { childList: true, attributes: true });

// To use: Add class 'ai-message' to agent response elements in the chat UI. 