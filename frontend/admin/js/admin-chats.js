// Admin Chats Handler
(function () {
  const API_BASE = '';

  const filterAll = document.getElementById('filterAll');
  const filterPending = document.getElementById('filterPending');
  const filterReplied = document.getElementById('filterReplied');
  const chatsList = document.getElementById('chatsList');
  const replyModal = document.getElementById('replyModal');
  const replyForm = document.getElementById('replyForm');
  const replyMessage = document.getElementById('replyMessage');
  const replyingChatId = document.getElementById('replyingChatId');
  const replyStatus = document.getElementById('replyStatus');
  const authModal = document.getElementById('authModal');
  const tokenInput = document.getElementById('tokenInput');
  const loginBtn = document.getElementById('loginBtn');

  let allChats = [];
  let currentFilter = 'all';

  // Initialize auth
  function initAuth() {
    const token = localStorage.getItem('adminJWT');
    if (!token) {
      authModal.classList.remove('hidden');
      if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
      }
      if (tokenInput) {
        tokenInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') handleLogin();
        });
      }
    } else {
      authModal.classList.add('hidden');
      loadChats();
    }
  }

  function handleLogin() {
    const token = tokenInput.value.trim();
    if (!token) {
      alert('Please enter a token');
      return;
    }
    localStorage.setItem('adminJWT', token);
    authModal.classList.add('hidden');
    tokenInput.value = '';
    loadChats();
  }

  // Load chats
  async function loadChats() {
    try {
      const token = localStorage.getItem('adminJWT');
      if (!token) {
        initAuth();
        return;
      }

      const res = await fetch(`${API_BASE}/admin/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (Array.isArray(data)) {
        allChats = data;
      } else {
        allChats = [];
      }
      
      renderChats();
    } catch (err) {
      console.error('Error loading chats:', err);
      chatsList.innerHTML = `<p class="text-red-600 text-center">Failed to load chats: ${err.message}</p>`;
    }
  }

  // Render chats based on filter
  function renderChats() {
    let filtered = allChats;

    if (currentFilter === 'pending') {
      filtered = allChats.filter(c => !c.replied);
    } else if (currentFilter === 'replied') {
      filtered = allChats.filter(c => c.replied);
    }

    if (filtered.length === 0) {
      chatsList.innerHTML = `<p class="text-gray-500 text-center py-8">No messages found</p>`;
      return;
    }

    chatsList.innerHTML = filtered.map(chat => `
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-800">${chat.name}</h3>
            <p class="text-gray-600 text-sm">${chat.email}</p>
            <p class="text-gray-500 text-xs mt-1">
              <i class="fas fa-clock mr-1"></i> ${new Date(chat.created_at).toLocaleString()}
            </p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-semibold ${chat.replied ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
            ${chat.replied ? '✓ Replied' : '⏳ Pending'}
          </span>
        </div>

        <div class="bg-gray-50 p-4 rounded-lg mb-4 border-l-4 border-primary">
          <p class="text-gray-800 font-semibold mb-2">Customer Message:</p>
          <p class="text-gray-700">${chat.message}</p>
        </div>

        ${chat.replied ? `
          <div class="bg-green-50 p-4 rounded-lg mb-4 border-l-4 border-green-500">
            <p class="text-gray-800 font-semibold mb-2">Your Reply:</p>
            <p class="text-gray-700">${chat.reply}</p>
            <p class="text-gray-500 text-xs mt-2">
              <i class="fas fa-check-circle mr-1"></i> Replied on ${new Date(chat.replied_at).toLocaleString()}
            </p>
          </div>
        ` : ``}

        <div class="flex gap-2">
          <button class="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-darkRed transition font-semibold copy-chat-btn" data-id="${chat.id}">
            <i class="fas fa-copy mr-2"></i> Copy ID
          </button>
          ${!chat.replied ? `
            <button class="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-semibold reply-chat-btn" data-id="${chat.id}" data-name="${chat.name.replace(/"/g, '&quot;')}" data-email="${chat.email.replace(/"/g, '&quot;')}" data-message="${chat.message.replace(/"/g, '&quot;')}">
              <i class="fas fa-reply mr-2"></i> Reply
            </button>
          ` : ``}
        </div>
      </div>
    `).join('');

    // Add copy button handlers
    document.querySelectorAll('.copy-chat-btn').forEach(btn => {
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

    // Add reply button handlers
    document.querySelectorAll('.reply-chat-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const id = this.getAttribute('data-id');
        const name = this.getAttribute('data-name');
        const email = this.getAttribute('data-email');
        const message = this.getAttribute('data-message');
        openReplyModal(id, name, email, message, email);
      });
    });
  }

  // Filter buttons
  filterAll.addEventListener('click', () => {
    currentFilter = 'all';
    filterAll.classList.add('bg-primary', 'text-white');
    filterPending.classList.remove('bg-yellow-500', 'text-white');
    filterReplied.classList.remove('bg-green-500', 'text-white');
    renderChats();
  });

  filterPending.addEventListener('click', () => {
    currentFilter = 'pending';
    filterAll.classList.remove('bg-primary', 'text-white');
    filterPending.classList.add('bg-yellow-500', 'text-white');
    filterReplied.classList.remove('bg-green-500', 'text-white');
    renderChats();
  });

  filterReplied.addEventListener('click', () => {
    currentFilter = 'replied';
    filterAll.classList.remove('bg-primary', 'text-white');
    filterPending.classList.remove('bg-yellow-500', 'text-white');
    filterReplied.classList.add('bg-green-500', 'text-white');
    renderChats();
  });

  // Open reply modal
  window.openReplyModal = function(chatId, name, email, message, replyEmail) {
    document.getElementById('originalName').textContent = name;
    document.getElementById('originalEmail').textContent = email;
    document.getElementById('originalMessage').textContent = message;
    replyingChatId.value = chatId;
    replyMessage.value = '';
    replyStatus.classList.add('hidden');
    replyModal.classList.remove('hidden');
    replyMessage.focus();
  };

  // Close reply modal
  window.closeReplyModal = function() {
    replyModal.classList.add('hidden');
  };

  // Submit reply
  replyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminJWT');
    const chatId = replyingChatId.value;
    const reply = replyMessage.value.trim();

    if (!chatId || !reply) {
      alert('Please fill in the reply');
      return;
    }

    replyStatus.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
    replyStatus.textContent = '⏳ Sending reply...';

    try {
      const res = await fetch(`${API_BASE}/admin/chat/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chat_id: chatId, reply })
      });

      const json = await res.json();

      if (json.ok) {
        replyStatus.className = 'p-4 rounded-lg text-center font-semibold bg-green-100 text-green-800';
        replyStatus.textContent = '✓ Reply sent and email notification delivered!';
        setTimeout(() => {
          closeReplyModal();
          loadChats();
        }, 1500);
      } else {
        replyStatus.className = 'p-4 rounded-lg text-center font-semibold bg-red-100 text-red-800';
        replyStatus.textContent = '✗ ' + (json.error || 'Failed to send reply');
      }
    } catch (err) {
      replyStatus.className = 'p-4 rounded-lg text-center font-semibold bg-red-100 text-red-800';
      replyStatus.textContent = '✗ Network error';
    }
  });

  // Load chats on page load
  initAuth();
  setInterval(loadChats, 60000); // Refresh every minute
})();
