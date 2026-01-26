// Admin Shipments List Handler
(function () {
  const API_BASE = window.location.origin || 'http://localhost:3000';

  const shipmentsTable = document.getElementById('shipmentsTable');
  const searchInput = document.getElementById('searchInput');
  const filterStatus = document.getElementById('filterStatus');
  const shipmentCount = document.getElementById('shipmentCount');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const totalShipmentsEl = document.getElementById('totalShipments');
  const inTransitCountEl = document.getElementById('inTransitCount');
  const deliveredCountEl = document.getElementById('deliveredCount');
  const authModal = document.getElementById('authModal');
  const tokenInput = document.getElementById('tokenInput');
  const loginBtn = document.getElementById('loginBtn');

  let allShipments = [];
  let filteredShipments = [];
  let currentPage = 0;
  const itemsPerPage = 10;

  // Initialize auth
  function initAuth() {
    const token = localStorage.getItem('adminToken');
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
      loadShipments();
    }
  }

  function handleLogin() {
    const token = tokenInput.value.trim();
    if (!token) {
      alert('Please enter a token');
      return;
    }
    localStorage.setItem('adminToken', token);
    authModal.classList.add('hidden');
    tokenInput.value = '';
    loadShipments();
  }

  // Load all shipments
  async function loadShipments() {
    try {
      // show loading state
      if (shipmentsTable) {
        shipmentsTable.innerHTML = `
          <tr>
            <td colspan="8" class="px-6 py-8 text-center text-gray-500">
              <i class="fas fa-spinner fa-spin mr-2"></i> Loading shipments...
            </td>
          </tr>
        `;
      }
      const token = localStorage.getItem('adminToken');
      if (!token) {
        initAuth();
        return;
      }

      const res = await fetch(`${API_BASE}/admin/shipments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (Array.isArray(data)) {
        allShipments = data;
      } else {
        allShipments = [];
      }
      
      filteredShipments = allShipments;
      updateStats();
      renderShipments();
    } catch (err) {
      console.error('Error loading shipments:', err);
      shipmentsTable.innerHTML = `
        <tr>
          <td colspan="8" class="px-6 py-8 text-center text-red-600">
            <i class="fas fa-exclamation-circle mr-2"></i> Failed to load shipments: ${err.message}
          </td>
        </tr>
      `;
    }
  }

  // Update statistics
  function updateStats() {
    totalShipmentsEl.textContent = allShipments.length;
    inTransitCountEl.textContent = allShipments.filter(s => s.status === 'in-transit' || s.status === 'In transit').length;
    deliveredCountEl.textContent = allShipments.filter(s => s.status === 'delivered' || s.status === 'Delivered').length;
  }

  // Filter and search shipments
  function applyFilters() {
    let result = allShipments;

    // Search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
      result = result.filter(s =>
        s.tracking_code.toLowerCase().includes(searchTerm) ||
        s.owner_name.toLowerCase().includes(searchTerm) ||
        (s.owner_email && s.owner_email.toLowerCase().includes(searchTerm))
      );
    }

    // Status filter
    const statusFilter = filterStatus.value;
    if (statusFilter) {
      result = result.filter(s => {
        const status = (s.status || 'pending').toLowerCase().replace(/\s+/g, '-');
        return status === statusFilter.toLowerCase();
      });
    }

    filteredShipments = result;
    currentPage = 0;
    renderShipments();
  }

  // Render shipments table
  function renderShipments() {
    if (filteredShipments.length === 0) {
      shipmentsTable.innerHTML = `
        <tr>
          <td colspan="8" class="px-6 py-8 text-center text-gray-500">
            <i class="fas fa-inbox mr-2"></i> No shipments found
          </td>
        </tr>
      `;
      shipmentCount.textContent = '0 shipments';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageShipments = filteredShipments.slice(startIndex, endIndex);

    shipmentsTable.innerHTML = pageShipments.map((s, index) => `
      <tr class="border-b hover:bg-gray-50 transition">
        <td class="px-6 py-4">
          <span class="font-mono text-sm bg-primary text-white px-3 py-1 rounded-full">${s.id}</span>
        </td>
        <td class="px-6 py-4">
          <span class="font-semibold text-primary">${s.tracking_code}</span>
        </td>
        <td class="px-6 py-4">
          <div>
            <p class="font-semibold">${s.owner_name || '-'}</p>
            <p class="text-sm text-gray-600">${s.owner_email || '-'}</p>
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="text-sm">${s.origin || '-'} → ${s.destination || '-'}</span>
        </td>
        <td class="px-6 py-4">
          <span class="text-sm font-semibold capitalize">${s.service || '-'}</span>
        </td>
        <td class="px-6 py-4">
          <span class="px-3 py-1 rounded-full text-xs font-semibold ${
            s.status === 'delivered' || s.status === 'Delivered'
              ? 'bg-green-100 text-green-800'
              : s.status === 'in-transit' || s.status === 'In transit'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }">
            ${s.status || 'Pending'}
          </span>
        </td>
        <td class="px-6 py-4">
          <span class="text-sm">${s.eta || '-'}</span>
        </td>
        <td class="px-6 py-4 text-center">
          <button onclick="copyToClipboard('${s.id}')" class="text-primary hover:text-darkRed text-sm font-semibold" title="Copy Shipment ID">
            <i class="fas fa-copy mr-1"></i> Copy ID
          </button>
        </td>
      </tr>
    `).join('');

    // Update pagination info
    const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
    shipmentCount.textContent = `Showing ${startIndex + 1} to ${Math.min(endIndex, filteredShipments.length)} of ${filteredShipments.length} shipments`;

    // Update pagination buttons
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1;
  }

  // Copy to clipboard
  window.copyToClipboard = function (text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Shipment ID copied to clipboard!');
    });
  };

  // Event listeners (guarded)
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (filterStatus) filterStatus.addEventListener('change', applyFilters);

  prevBtn.addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage--;
      renderShipments();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
    if (currentPage < totalPages - 1) {
      currentPage++;
      renderShipments();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Logout handlers
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    window.location.href = 'index.html';
  });

  document.getElementById('sidebarLogoutBtn').addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    window.location.href = 'index.html';
  });

  // Load shipments on page load
  initAuth();
  setInterval(loadShipments, 30000); // Refresh every 30 seconds
})();
