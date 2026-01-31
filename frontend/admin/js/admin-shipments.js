// Admin Shipments Handler
(function () {
  const API_BASE = window.location.origin;
  
  const createShipmentForm = document.getElementById('createShipmentForm');
  const shipmentStatus = document.getElementById('shipmentStatus');

  createShipmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    if (!token) {
      alert('Please login first');
      window.location.href = 'index.html';
      return;
    }

    const data = Object.fromEntries(new FormData(createShipmentForm).entries());
    shipmentStatus.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
    shipmentStatus.textContent = '⏳ Creating shipment...';

    try {
      const res = await fetch(`${API_BASE}/admin/create_shipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const json = await res.json();

      if (json.ok) {
        shipmentStatus.className = 'p-4 rounded-lg text-center font-semibold bg-green-100 text-green-800';
        shipmentStatus.innerHTML = `
          <i class="fas fa-check-circle mr-2"></i> Shipment created successfully!<br>
          <span class="text-lg font-bold mt-2 block">Tracking Code: <code class="bg-white px-3 py-1 rounded">${json.tracking_code}</code></span>
        `;
        createShipmentForm.reset();
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      } else {
        shipmentStatus.className = 'p-4 rounded-lg text-center font-semibold bg-red-100 text-red-800';
        shipmentStatus.textContent = '✗ ' + (json.error || 'Failed to create shipment');
      }
    } catch (err) {
      shipmentStatus.className = 'p-4 rounded-lg text-center font-semibold bg-red-100 text-red-800';
      shipmentStatus.textContent = '✗ Network error: ' + err.message;
    }
  });
})();
