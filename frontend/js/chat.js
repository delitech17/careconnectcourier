// Chat Widget Handler
(function () {
  const API_BASE = (location.hostname === 'localhost') ? 'http://localhost:3000/api' : '/api';
  
  const chatToggleBtn = document.getElementById('chatToggleBtn');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatBox = document.getElementById('chatBox');
  const chatForm = document.getElementById('chatForm');
  const chatMessages = document.getElementById('chatMessages');

  // Toggle chat box
  chatToggleBtn.addEventListener('click', () => {
    chatBox.classList.toggle('hidden');
  });

  chatCloseBtn.addEventListener('click', () => {
    chatBox.classList.add('hidden');
  });

  // Send chat message
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(chatForm).entries());

    try {
      const res = await fetch(`${API_BASE}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();

      if (json.ok) {
        // Add message to chat display
        const msgDiv = document.createElement('div');
        msgDiv.className = 'bg-primary text-white p-3 rounded-lg mb-2 text-sm';
        msgDiv.innerHTML = `<strong>${data.name}:</strong> ${data.message}`;
        chatMessages.appendChild(msgDiv);

        // Clear form
        chatForm.reset();

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Show confirmation
        setTimeout(() => {
          const confirmDiv = document.createElement('div');
          confirmDiv.className = 'bg-green-100 text-green-800 p-2 rounded text-sm mb-2';
          confirmDiv.textContent = '✓ Message sent! We will reply soon.';
          chatMessages.appendChild(confirmDiv);
        }, 300);
      }
    } catch (err) {
      console.error('Failed to send chat', err);
      const errDiv = document.createElement('div');
      errDiv.className = 'bg-red-100 text-red-800 p-2 rounded text-sm mb-2';
      errDiv.textContent = '✗ Failed to send message';
      chatMessages.appendChild(errDiv);
    }
  });
})();
