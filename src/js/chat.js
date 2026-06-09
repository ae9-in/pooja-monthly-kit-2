// Divine Support Assistant Chatbot Module

const PREDEFINED_ANSWERS = {
  choose: "Hari Om! We offer three convenient subscription plans to fit your ritual needs:<br>1. <strong>Monthly Subscription</strong>: ₹450/month (auto-renew)<br>2. <strong>3-Month Subscription</strong>: ₹1,299 (save more)<br>3. <strong>6-Month Subscription</strong>: ₹2,499 (maximum savings).<br>All plans come with free shipping across India.",
  custom: "Our Monthly Pooja Kit contains 7 daily essentials:<br>• Agarbakthi - 100g<br>• Camphor - 100g<br>• Deepam Oil - 800mL<br>• Dhoop Stick - 100g<br>• Cotton Wicks - 40 Nos<br>• Harshina Kumkuma Packet - 1 Packet<br>• Shuddodaka - 1 Bottle.<br>You can customize which items to include in your kit in our Interactive Customizer to adjust your pricing!",
  track: "Tracking is easy! Click 'Dashboard' in the top navigation bar, log in with your checkout email, and check the live order timeline from Packed to Delivered. We also send SMS and email updates.",
  purity: "Ritual purity (Sattva) is our highest promise. Our products are sourced directly from traditional temple-grade suppliers: 100% pure Bhimseni camphor, charcoal-free agarbakthi, premium deepam oil, and natural vermilion Kumkum. Shuddodaka is bottled pure.",
  menu: "How else can I guide you today? Select an option below or type a query."
};

const CHAT_OPTIONS = [
  { text: "🕯️ View Subscription Plans", action: "choose" },
  { text: "📦 What's inside the Pooja Kit?", action: "custom" },
  { text: "🚚 How to track my order delivery?", action: "track" },
  { text: "🌸 Are the ingredients pure?", action: "purity" }
];

export function initChatbot() {
  const toggleBtn = document.getElementById('chat-widget-toggle');
  const chatContainer = document.getElementById('chat-widget-container');
  const closeBtn = document.getElementById('chat-close-btn');
  const sendBtn = document.getElementById('chat-send-btn');
  const chatInput = document.getElementById('chat-user-input');

  if (!toggleBtn) return;

  // Toggle chat window
  toggleBtn.addEventListener('click', () => {
    chatContainer.classList.toggle('active');
    // Seed initial message if empty
    const history = document.getElementById('chat-history-pane');
    if (history && history.children.length === 0) {
      sendBotMessage("Hari Om! I am your Samskara Assistant. How may I guide your spiritual practice today?", CHAT_OPTIONS);
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chatContainer.classList.remove('active');
    });
  }

  // Handle user typed send
  const triggerUserSend = () => {
    const text = chatInput.value.trim();
    if (!text) return;
    addUserMessage(text);
    chatInput.value = '';
    
    // Simulate typing
    showTypingIndicator();
    
    setTimeout(() => {
      removeTypingIndicator();
      respondToText(text);
    }, 1000);
  };

  if (sendBtn) sendBtn.addEventListener('click', triggerUserSend);
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') triggerUserSend();
    });
  }
}

function scrollHistory() {
  const history = document.getElementById('chat-history-pane');
  if (history) {
    history.scrollTop = history.scrollHeight;
  }
}

function addUserMessage(text) {
  const history = document.getElementById('chat-history-pane');
  if (!history) return;

  const msg = document.createElement('div');
  msg.className = 'chat-message-bubble user';
  msg.textContent = text;
  history.appendChild(msg);
  scrollHistory();
}

function sendBotMessage(text, options = []) {
  const history = document.getElementById('chat-history-pane');
  if (!history) return;

  const msg = document.createElement('div');
  msg.className = 'chat-message-bubble bot';
  msg.innerHTML = `<div>${text}</div>`;

  if (options.length > 0) {
    const optionsWrapper = document.createElement('div');
    optionsWrapper.className = 'bot-options-list';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'bot-option-btn';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => {
        // Remove options after selecting
        optionsWrapper.remove();
        addUserMessage(opt.text);
        showTypingIndicator();
        setTimeout(() => {
          removeTypingIndicator();
          handleOptionClick(opt.action);
        }, 1000);
      });
      optionsWrapper.appendChild(btn);
    });
    msg.appendChild(optionsWrapper);
  }

  history.appendChild(msg);
  scrollHistory();
}

function handleOptionClick(action) {
  const answer = PREDEFINED_ANSWERS[action];
  const nextOptions = [
    { text: "↩️ Back to main menu", action: "menu" },
    { text: "❌ Close support assistant", action: "close" }
  ];

  if (action === 'menu') {
    sendBotMessage(answer, CHAT_OPTIONS);
  } else if (action === 'close') {
    sendBotMessage("May peace and divine blessings be with you. Hari Om! Call us at 8431119696 if you need further help.", []);
    setTimeout(() => {
      document.getElementById('chat-widget-container').classList.remove('active');
    }, 1200);
  } else {
    sendBotMessage(answer, nextOptions);
  }
}

function showTypingIndicator() {
  const history = document.getElementById('chat-history-pane');
  if (!history) return;
  const indicator = document.createElement('div');
  indicator.id = 'chat-typing-indicator';
  indicator.className = 'chat-message-bubble bot';
  indicator.style.fontStyle = 'italic';
  indicator.style.color = 'var(--text-muted)';
  indicator.textContent = 'Assistant is typing...';
  history.appendChild(indicator);
  scrollHistory();
}

function removeTypingIndicator() {
  const indicator = document.getElementById('chat-typing-indicator');
  if (indicator) indicator.remove();
}

function respondToText(text) {
  const lower = text.toLowerCase();
  let response = '';

  if (lower.includes('price') || lower.includes('cost') || lower.includes('subscription') || lower.includes('option')) {
    response = "Our subscription plans are: Monthly (₹450/month), 3-Month (₹1299), and 6-Month (₹2499). All kits are priced at an offer discount from the ₹665 MRP.";
  } else if (lower.includes('deliver') || lower.includes('shipping') || lower.includes('pincode') || lower.includes('india')) {
    response = "Yes, we deliver across India with 100% free home shipping. Orders are dispatched via speed post to arrive on time.";
  } else if (lower.includes('cancel') || lower.includes('pause') || lower.includes('stop')) {
    response = "You can easily pause, resume, or cancel your monthly delivery at any time from your Devotee Dashboard. There are no lock-in periods.";
  } else if (lower.includes('phone') || lower.includes('contact') || lower.includes('number') || lower.includes('whatsapp')) {
    response = "You can contact our temple managers directly at <strong>8431119696</strong> or tap the floating WhatsApp icon to chat with us!";
  } else {
    response = "Thank you for reaching out. Your query is logged. For urgent matters, call us at 8431119696. May your prayers bring peace.";
  }

  const menuOptions = [{ text: "↩️ Back to main menu", action: "menu" }];
  sendBotMessage(response, menuOptions);
}
