// Admin Messages Handler (Contact Forms)
(function () {
  const API_BASE = '';

  const messagesList = document.getElementById('messagesList');
  const messageModal = document.getElementById('messageModal');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  let allMessages = [];

  // Load contact messages
  async function loadMessages() {
    try {
      const token = localStorage.getItem('adminJWT');
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
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
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

        <div class="flex gap-2">
          <button class="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-darkRed transition text-sm copy-msg-btn" data-id="${msg.id}">
            <i class="fas fa-copy mr-2"></i> Copy ID
          </button>
          <button class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm view-msg-btn" data-id="${msg.id}" data-name="${msg.name.replace(/"/g, '&quot;')}" data-email="${msg.email.replace(/"/g, '&quot;')}" data-subject="${(msg.subject || '').replace(/"/g, '&quot;')}" data-message="${msg.message.replace(/"/g, '&quot;')}" data-date="${msg.created_at}">
            <i class="fas fa-envelope-open mr-2"></i> View
          </button>
        </div>
      </div>
    `).join('');

    // Add copy button handlers
    document.querySelectorAll('.copy-msg-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const id = this.getAttribute('data-id');
        navigator.clipboard.writeText(id).then(() => {
          const originalHTML = this.innerHTML;
          this.innerHTML = '<i class="fas fa-check mr-2"></i> Copied!';
          setTimeout(() => {
            this.innerHTML = originalHTML;
          }, 2000);
        }).catch(() => {
          alert('Failed to copy ID');
        });
      });
    });

    // Add view button handlers
    document.querySelectorAll('.view-msg-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const id = this.getAttribute('data-id');
        const name = this.getAttribute('data-name');
        const email = this.getAttribute('data-email');
        const subject = this.getAttribute('data-subject');
        const message = this.getAttribute('data-message');
        const date = this.getAttribute('data-date');
        openMessageModal(id, name, email, subject, message, date);
      });
    });
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
