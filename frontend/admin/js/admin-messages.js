// Admin Messages Handler (Contact Forms)
(function () {
  const API_BASE = 'http://localhost:3000';

  const messagesList = document.getElementById('messagesList');
  const messageModal = document.getElementById('messageModal');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  let allMessages = [];

  // Load contact messages
  async function loadMessages() {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        window.location.href = 'index.html';
        return;
      }

      const res = await fetch(`${API_BASE}/api/admin/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        messagesList.innerHTML = '<p class="text-red-600 text-center py-8">Failed to load messages. Make sure admin token is valid.</p>';
        return;
      }

      allMessages = await res.json();
      updateStats();
      renderMessages(allMessages);
    } catch (err) {
      console.error('Error:', err);
      messagesList.innerHTML = '<p class="text-red-600 text-center py-8">Error loading messages. Please try refreshing the page.</p>';
    }
  }

  // Update stats
  function updateStats() {
    document.getElementById('totalMessages').textContent = allMessages.length;
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = allMessages.filter(m => new Date(m.created_at) > sevenDaysAgo).length;
    document.getElementById('recentMessages').textContent = recent;

    const unique = new Set(allMessages.map(m => m.email)).size;
    document.getElementById('uniqueSenders').textContent = unique;
  }

  // Render messages
  function renderMessages(messages) {
    if (messages.length === 0) {
      messagesList.innerHTML = '<p class="text-gray-500 text-center py-8">No messages found</p>';
      return;
    }

    messagesList.innerHTML = messages.map(msg => `
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer" onclick="openMessageModal('${msg.id}', '${msg.name.replace(/'/g, "\\'")}', '${msg.email.replace(/'/g, "\\'")}', '${(msg.subject || '').replace(/'/g, "\\'")}', '${msg.message.replace(/'/g, "\\'")}', '${msg.created_at}')">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="text-lg font-bold text-gray-800">${msg.name}</h3>
            <p class="text-primary text-sm font-mono">${msg.email}</p>
          </div>
          <span class="text-xs text-gray-500">
            ${new Date(msg.created_at).toLocaleDateString()}
          </span>
        </div>

        <div class="mb-3">
          ${msg.subject ? `<p class="text-sm font-semibold text-gray-700 mb-2">Subject: ${msg.subject}</p>` : ''}
          <p class="text-gray-700 line-clamp-2">${msg.message}</p>
        </div>

        <div class="flex justify-between items-center text-xs text-gray-500">
          <span><i class="fas fa-message mr-1"></i> Read full message</span>
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    `).join('');
  }

  // Search messages
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = allMessages.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.message.toLowerCase().includes(query)
    );
    renderMessages(filtered);
  });

  // Allow Enter to search
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });

  // Open message modal
  window.openMessageModal = function(id, name, email, subject, message, date) {
    document.getElementById('modalName').textContent = name;
    document.getElementById('modalEmail').textContent = email;
    document.getElementById('modalSubject').textContent = subject || 'No subject';
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modalDate').textContent = new Date(date).toLocaleString();
    messageModal.classList.remove('hidden');
  };

  // Close message modal
  window.closeMessageModal = function() {
    messageModal.classList.add('hidden');
  };

  // Compose email reply
  window.respondToMessage = function() {
    const email = document.getElementById('modalEmail').textContent;
    // In a real application, this would open an email composer
    window.open(`mailto:${email}?subject=Re: Your CareConnect Courier Message`, '_blank');
  };

  // Load messages on page load
  loadMessages();
  setInterval(loadMessages, 60000); // Refresh every minute
})();
