// Admin Dashboard JS
(function () {
  const API_BASE = (location.hostname === 'localhost') ? 'http://localhost:3000' : '';
  let adminToken = null;

  // Login
  const loginBtn = document.getElementById('loginBtn');
  const adminToken_input = document.getElementById('adminToken');
  const authStatus = document.getElementById('authStatus');
  const adminSection = document.getElementById('adminSection');

  loginBtn.addEventListener('click', () => {
    const token = adminToken_input.value.trim();
    if (!token) {
      authStatus.textContent = 'Please enter a token';
      return;
    }
    adminToken = token;
    authStatus.textContent = '✓ Logged in successfully';
    adminToken_input.value = '';
    adminSection.classList.remove('hidden');
    loadShipments();
    loadChats();
  });

  // Tab switching
  window.switchTab = function(tab) {
    document.getElementById('shipments-tab').classList.add('hidden');
    document.getElementById('chats-tab').classList.add('hidden');
    document.getElementById(`${tab}-tab`).classList.remove('hidden');
    
    document.getElementById('tab-shipments').classList.remove('text-primary', 'border-b-2', 'border-primary');
    document.getElementById('tab-chats').classList.remove('text-primary', 'border-b-2', 'border-primary');
    document.getElementById(`tab-${tab}`).classList.add('text-primary', 'border-b-2', 'border-primary');
  };

  // Create Shipment
  const createShipmentForm = document.getElementById('createShipmentForm');
  createShipmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(createShipmentForm).entries());
    const status = document.getElementById('shipmentStatus');
    status.textContent = 'Creating...';

    try {
      const res = await fetch(`${API_BASE}/admin/create_shipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.ok) {
        status.className = 'text-sm text-center text-green-600 font-semibold';
        status.textContent = `✓ Shipment created: ${json.tracking_code}`;
        createShipmentForm.reset();
        loadShipments();
        setTimeout(() => status.textContent = '', 5000);
      } else {
        status.className = 'text-sm text-center text-red-600';
        status.textContent = json.error || 'Failed to create shipment';
      }
    } catch (err) {
      status.className = 'text-sm text-center text-red-600';
      status.textContent = 'Error creating shipment';
    }
  });

  // Add Movement
  const addMovementForm = document.getElementById('addMovementForm');
  addMovementForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(addMovementForm).entries());
    const status = document.getElementById('movementStatus');
    status.textContent = 'Adding...';

    try {
      const res = await fetch(`${API_BASE}/admin/add_movement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.ok) {
        status.className = 'text-sm text-center text-green-600 font-semibold';
        status.textContent = '✓ Movement added & email sent to customer';
        addMovementForm.reset();
        loadShipments();
        setTimeout(() => status.textContent = '', 5000);
      } else {
        status.className = 'text-sm text-center text-red-600';
        status.textContent = json.error || 'Failed to add movement';
      }
    } catch (err) {
      status.className = 'text-sm text-center text-red-600';
      status.textContent = 'Error adding movement';
    }
  });

  // Load and display shipments
  async function loadShipments() {
    const list = document.getElementById('shipmentsList');
    list.innerHTML = '<p class="text-gray-600">Loading shipments...</p>';
    // Note: We'd need a GET /admin/shipments endpoint to fully implement this
    list.innerHTML = '<p class="text-gray-600">✓ Admin can create and manage shipments using the forms above.</p>';
  }

  // Load and display chat messages
  async function loadChats() {
    const chatsList = document.getElementById('chatsList');
    if (!chatsList) return;
    
    chatsList.innerHTML = '<p class="text-gray-600">Loading messages...</p>';

    try {
      const res = await fetch(`${API_BASE}/admin/chats`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const chats = await res.json();

      if (chats.length === 0) {
        chatsList.innerHTML = '<p class="text-gray-600">No chat messages yet.</p>';
        return;
      }

      chatsList.innerHTML = '';
      chats.forEach(chat => {
        const chatCard = document.createElement('div');
        chatCard.className = 'border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition';
        chatCard.innerHTML = `
          <div class="flex justify-between items-start mb-2">
            <div>
              <p class="font-semibold">${chat.name}</p>
              <p class="text-sm text-gray-600">${chat.email}</p>
            </div>
            <span class="text-xs ${chat.replied ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} px-2 py-1 rounded">
              ${chat.replied ? 'REPLIED' : 'PENDING'}
            </span>
          </div>
          <p class="text-gray-800 mb-3"><strong>Message:</strong> ${chat.message}</p>
          ${chat.replied ? `<p class="text-gray-700 mb-3 bg-white p-2 rounded border-l-4 border-green-500"><strong>Your Reply:</strong> ${chat.reply}</p>` : ''}
          <p class="text-xs text-gray-500 mb-3">${new Date(chat.created_at).toLocaleString()}</p>
          
          ${!chat.replied ? `
            <div class="flex gap-2">
              <input type="text" id="reply-input-${chat.id}" placeholder="Type your reply..." class="flex-1 p-2 border rounded text-sm" />
              <button onclick="replyToChat('${chat.id}')" class="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-darkRed transition">
                <i class="fas fa-reply mr-1"></i> Reply
              </button>
            </div>
          ` : ''}
        `;
        chatsList.appendChild(chatCard);
      });
    } catch (err) {
      console.error('Failed to load chats:', err);
      chatsList.innerHTML = '<p class="text-red-600">Failed to load messages</p>';
    }
  }

  // Reply to chat
  window.replyToChat = async function(chatId) {
    const replyInput = document.getElementById(`reply-input-${chatId}`);
    const reply = replyInput.value.trim();

    if (!reply) {
      alert('Please type a reply');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/chat/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ chat_id: chatId, reply })
      });
      const json = await res.json();

      if (json.ok) {
        alert('✓ Reply sent & email notification sent to customer');
        loadChats();
      } else {
        alert(json.error || 'Failed to send reply');
      }
    } catch (err) {
      alert('Error sending reply');
    }
  };

  // Load on init
  adminSection.classList.add('hidden');
})();
