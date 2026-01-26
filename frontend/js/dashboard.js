// Client Dashboard Handler
(function () {
  const API_BASE = (location.hostname === 'localhost') ? 'http://localhost:3000/api' : '/api';

  const shipmentsContainer = document.getElementById('shipmentsContainer');
  const userNameEl = document.getElementById('userName');
  const logoutBtn = document.getElementById('logoutBtn');

  const token = localStorage.getItem('authToken');
  const userName = localStorage.getItem('userName');

  // Check authentication
  if (!token) {
    window.location.href = 'login.html';
  }

  userNameEl.textContent = `Welcome, ${userName || 'User'}`;

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
  });

  // Load shipments
  async function loadShipments() {
    try {
      const res = await fetch(`${API_BASE}/user/shipments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = 'login.html';
        }
        throw new Error('Failed to load shipments');
      }

      const shipments = await res.json();

      if (shipments.length === 0) {
        shipmentsContainer.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">No shipments found</p>';
        return;
      }

      shipmentsContainer.innerHTML = '';

      shipments.forEach(shipment => {
        const latestMovement = shipment.movements && shipment.movements.length > 0 
          ? shipment.movements[shipment.movements.length - 1]
          : null;

        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary hover:shadow-xl transition';
        card.innerHTML = `
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-bold text-primary">${shipment.tracking_code}</h3>
              <p class="text-gray-600 text-sm">${shipment.owner_name}</p>
            </div>
            <span class="bg-${shipment.status === 'delivered' ? 'green' : shipment.status === 'in-transit' ? 'blue' : 'yellow'}-100 text-${shipment.status === 'delivered' ? 'green' : shipment.status === 'in-transit' ? 'blue' : 'yellow'}-800 px-3 py-1 rounded-full text-xs font-semibold">
              ${shipment.status ? shipment.status.toUpperCase() : 'PENDING'}
            </span>
          </div>

          <div class="space-y-2 mb-4 text-sm">
            <p><strong>From:</strong> ${shipment.origin}</p>
            <p><strong>To:</strong> ${shipment.destination}</p>
            <p><strong>Weight:</strong> ${shipment.weight || 'N/A'}</p>
            <p><strong>Service:</strong> ${shipment.service ? shipment.service.toUpperCase() : 'N/A'}</p>
            <p><strong>ETA:</strong> ${shipment.eta || 'Not set'}</p>
          </div>

          ${latestMovement ? `
            <div class="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
              <p class="font-semibold text-gray-700"><i class="fas fa-map-marker-alt text-primary mr-2"></i>${latestMovement.location}</p>
              <p class="text-gray-600 text-xs">${new Date(latestMovement.timestamp).toLocaleString()}</p>
              <p class="text-gray-700 mt-2">${latestMovement.note}</p>
            </div>
          ` : ''}

          <button onclick="toggleMovements('movements-${shipment.id}')" class="text-primary font-semibold text-sm hover:underline">
            <i class="fas fa-list mr-1"></i> View all updates (${shipment.movements ? shipment.movements.length : 0})
          </button>

          <div id="movements-${shipment.id}" class="hidden mt-4 border-t pt-4">
            ${shipment.movements && shipment.movements.length > 0 ? shipment.movements.map(m => `
              <div class="flex gap-3 mb-3 last:mb-0">
                <div class="flex flex-col items-center">
                  <div class="w-3 h-3 bg-primary rounded-full"></div>
                  <div class="w-0.5 h-8 bg-gray-300"></div>
                </div>
                <div class="text-sm flex-1">
                  <p class="font-semibold">${m.location}</p>
                  <p class="text-gray-600 text-xs">${new Date(m.timestamp).toLocaleString()}</p>
                  <p class="text-gray-700">${m.note}</p>
                </div>
              </div>
            `).join('') : '<p class="text-gray-600">No movements recorded</p>'}
          </div>
        `;
        shipmentsContainer.appendChild(card);
      });
    } catch (err) {
      console.error('Failed to load shipments:', err);
      shipmentsContainer.innerHTML = `<p class="text-red-600 col-span-full text-center py-8">Failed to load shipments</p>`;
    }
  }

  window.toggleMovements = function(id) {
    const el = document.getElementById(id);
    el.classList.toggle('hidden');
  };

  loadShipments();
})();
