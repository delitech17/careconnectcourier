// Admin Movements Handler
(function () {
  const API_BASE = '';

  const trackingCodeInput = document.getElementById('trackingCodeInput');
  const searchBtn = document.getElementById('searchBtn');
  const shipmentDetailsBox = document.getElementById('shipmentDetailsBox');
  const noShipmentBox = document.getElementById('noShipmentBox');
  const movementDetailsSection = document.getElementById('movementDetailsSection');
  const statusSection = document.getElementById('statusSection');
  const submitSection = document.getElementById('submitSection');
  const trackingCodeField = document.getElementById('trackingCode');
  const addMovementForm = document.getElementById('addMovementForm');
  const movementStatus = document.getElementById('movementStatus');
  
  // Barcode elements
  const barcode = document.getElementById('barcode');
  const barcodeText = document.getElementById('barcodeText');

  // Generate barcode
  function generateBarcode(code) {
    try {
      JsBarcode("#barcode", code, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 14,
        margin: 10
      });
      barcodeText.innerHTML = `<i class="fas fa-check text-green-600 mr-2"></i>Barcode: <strong>${code}</strong>`;
    } catch (err) {
      console.error('Barcode error:', err);
      barcodeText.textContent = 'Error generating barcode';
    }
  }

  // Search for shipment
  searchBtn.addEventListener('click', async () => {
    const code = trackingCodeInput.value.trim().toUpperCase();
    
    if (!code) {
      alert('Please enter a tracking code');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/track/${encodeURIComponent(code)}`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const shipment = await res.json();

      if (shipment.error) {
        shipmentDetailsBox.classList.add('hidden');
        noShipmentBox.classList.remove('hidden');
        movementDetailsSection.classList.add('hidden');
        statusSection.classList.add('hidden');
        submitSection.classList.add('hidden');
        barcodeText.innerHTML = '<i class="fas fa-exclamation-circle text-red-500 mr-2"></i>Shipment not found';
      } else {
        // Show shipment details
        document.getElementById('detailsOwner').textContent = shipment.owner_name || '-';
        document.getElementById('detailsCode').textContent = shipment.tracking_code || '-';
        document.getElementById('detailsOrigin').textContent = shipment.origin || '-';
        document.getElementById('detailsDestination').textContent = shipment.destination || '-';
        trackingCodeField.value = shipment.tracking_code;

        shipmentDetailsBox.classList.remove('hidden');
        noShipmentBox.classList.add('hidden');
        movementDetailsSection.classList.remove('hidden');
        statusSection.classList.remove('hidden');
        submitSection.classList.remove('hidden');

        // Generate barcode
        generateBarcode(shipment.tracking_code);
      }
    } catch (err) {
      console.error('Error:', err);
      shipmentDetailsBox.classList.add('hidden');
      noShipmentBox.classList.remove('hidden');
      movementDetailsSection.classList.add('hidden');
      statusSection.classList.add('hidden');
      submitSection.classList.add('hidden');
      barcodeText.innerHTML = '<i class="fas fa-exclamation-circle text-red-500 mr-2"></i>Error loading shipment';
    }
  });

  // Allow Enter key to search
  trackingCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });

  // Submit movement
  addMovementForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminJWT');

    if (!token) {
      alert('Please login first');
      window.location.href = 'index.html';
      return;
    }

    const trackingCode = trackingCodeField.value;
    if (!trackingCode) {
      alert('Please search for a shipment first');
      return;
    }

    const data = Object.fromEntries(new FormData(addMovementForm).entries());
    movementStatus.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
    movementStatus.textContent = '⏳ Adding movement...';

    try {
      const res = await fetch(`${API_BASE}/admin/add_movement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const json = await res.json();

      if (json.ok) {
        movementStatus.className = 'p-4 rounded-lg text-center font-semibold bg-green-100 text-green-800';
        movementStatus.innerHTML = `
          <i class="fas fa-check-circle mr-2"></i> Movement added successfully!<br>
          <span class="text-sm mt-2 block">Email notification has been sent to the customer</span>
        `;
        addMovementForm.reset();
        trackingCodeInput.value = '';
        trackingCodeInput.focus();
        shipmentDetailsBox.classList.add('hidden');
        movementDetailsSection.classList.add('hidden');
        statusSection.classList.add('hidden');
        submitSection.classList.add('hidden');
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      } else {
        movementStatus.className = 'p-4 rounded-lg text-center font-semibold bg-red-100 text-red-800';
        movementStatus.textContent = '✗ ' + (json.error || 'Failed to add movement');
      }
    } catch (err) {
      movementStatus.className = 'p-4 rounded-lg text-center font-semibold bg-red-100 text-red-800';
      movementStatus.textContent = '✗ Network error: ' + err.message;
    }
  });
})();
