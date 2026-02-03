// Admin Dashboard Handler
(function () {
  const API_BASE = '';

  async function loadDashboardStats() {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      // Load chats
      const chatsRes = await fetch(`${API_BASE}/admin/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => null);

      const chats = (chatsRes && chatsRes.ok) ? await chatsRes.json() : [];

      // Load recent shipments
      const shipmentsRes = await fetch(`${API_BASE}/admin/shipments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => null);

      const shipments = (shipmentsRes && shipmentsRes.ok) ? await shipmentsRes.json() : [];

      // Update stats (guard elements)
      const statsShipmentsEl = document.getElementById('statsShipments');
      const statsChatsEl = document.getElementById('statsChats');
      const statsMovementsEl = document.getElementById('statsMovements');
      const statsMessagesEl = document.getElementById('statsMessages');

      if (statsShipmentsEl) statsShipmentsEl.textContent = shipments.length || 0;
      if (statsChatsEl) statsChatsEl.textContent = chats.length || 0;
      if (statsMovementsEl) statsMovementsEl.textContent = 'N/A';
      if (statsMessagesEl) statsMessagesEl.textContent = 'N/A';

      // Load pending chats
      const pendingChats = chats.filter(c => !c.replied);
      const pendingChatsDiv = document.getElementById('pendingChats');
      if (pendingChatsDiv) {
        if (pendingChats.length === 0) {
          pendingChatsDiv.innerHTML = '<p class="text-gray-500 text-sm">No pending chats</p>';
        } else {
          pendingChatsDiv.innerHTML = pendingChats.slice(0, 5).map(c => `
            <div class="border-b pb-2 last:border-0">
              <p class="font-semibold text-sm">${c.name}</p>
              <p class="text-gray-600 text-xs">${c.email}</p>
              <p class="text-gray-700 text-sm truncate">${c.message}</p>
            </div>
          `).join('');
        }
      }

      // Display recent shipments
      const recentShipmentsDiv = document.getElementById('recentShipments');
      if (recentShipmentsDiv) {
        displayRecentShipments(shipments.slice(0, 5), recentShipmentsDiv);
      }

    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  }

  function displayRecentShipments(shipments, container) {
    if (!container) return;
    if (!Array.isArray(shipments) || shipments.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-sm">No recent shipments</p>';
      return;
    }

    container.innerHTML = shipments.map(s => `
      <div class="border-b pb-4 last:border-0 bg-gradient-to-r from-gray-50 to-white p-3 rounded-lg">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs font-bold mb-2">
              ${s.tracking_code}
            </div>
            <p class="font-semibold text-sm text-gray-800 mt-1">${s.owner_name || 'Unknown'}</p>
            <p class="text-gray-600 text-xs mt-1"><i class="fas fa-map-marker-alt text-primary mr-1"></i>${s.origin || '-'} → ${s.destination || '-'}</p>
            <p class="text-gray-500 text-xs mt-1">Service: <span class="font-semibold">${s.service || 'Standard'}</span></p>
            <p class="text-gray-500 text-xs">ETA: <span class="font-semibold">${s.eta || 'N/A'}</span></p>
          </div>
          <button onclick="deleteShipment('${s.id}', '${s.tracking_code}')" class="text-red-600 hover:text-red-800 text-xs font-semibold ml-2 whitespace-nowrap" title="Delete shipment">
            <i class="fas fa-trash mr-1"></i> Delete
          </button>
        </div>
      </div>
    `).join('');
  }

  // Delete shipment function
  window.deleteShipment = async function(shipmentId, trackingCode) {
    if (!confirm(`Delete shipment ${trackingCode}? This cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/admin/delete_shipment/${shipmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => null);

      const json = res && res.ok ? await res.json() : { error: 'Request failed' };
      if (json.ok) {
        alert(`Shipment ${trackingCode} deleted successfully`);
        loadDashboardStats();
      } else {
        alert('Error: ' + (json.error || 'Failed to delete'));
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete shipment');
    }
  };

  // Load stats on page load
  loadDashboardStats();
  setInterval(loadDashboardStats, 30000); // Refresh every 30 seconds
})();
