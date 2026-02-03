// Main frontend JS: testimonials fetch, contact & quote form handling, mobile menu, tracking
(function () {
  const API_BASE = (location.hostname === 'localhost') ? 'http://localhost:3000/api' : '/api';

  // ============ MOBILE MENU TOGGLE ============
  const menuBtn = document.getElementById('menuBtn');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuLinks = document.querySelectorAll('.menu-link');
  
  /**
   * Toggle mobile menu open/close with smooth animation
   * Prevents body scroll when menu is open
   */
  function toggleMenu() {
    const isOpen = document.body.classList.contains('menu-open');
    
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }
  
  /**
   * Open mobile menu with animation
   */
  function openMenu() {
    document.body.classList.add('menu-open');
    mobileMenu.focus();
    menuBtn.setAttribute('aria-expanded', 'true');
    
    // Trap focus within mobile menu (accessibility)
    const focusableElements = mobileMenu.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    mobileMenu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    });
  }
  
  /**
   * Close mobile menu with animation
   */
  function closeMenu() {
    document.body.classList.remove('menu-open');
    menuBtn.focus();
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  
  /**
   * Handle menu button click - toggle menu
   */
  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
  }
  
  /**
   * Handle close button click
   */
  if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }
  
  /**
   * Close menu when clicking overlay
   */
  if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
  }
  
  /**
   * Close menu when a navigation link is clicked
   */
  menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });
  
  /**
   * Close menu when pressing Escape key
   */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
      closeMenu();
    }
  });
  
  /**
   * Close menu when clicking outside on larger screens
   * (Already handled by CSS on md+ screens via hidden)
   */
  document.addEventListener('click', (e) => {
    const isMenuOpen = document.body.classList.contains('menu-open');
    const isClickOnMenu = mobileMenu.contains(e.target);
    const isClickOnButton = menuBtn.contains(e.target);
    
    if (isMenuOpen && !isClickOnMenu && !isClickOnButton) {
      closeMenu();
    }
  });

  // Load testimonials
  async function loadTestimonials() {
    try {
      const res = await fetch(`${API_BASE}/testimonials`);
      const items = await res.json();
      const grid = document.getElementById('testimonialsGrid');
      if (!grid) return;
      grid.innerHTML = '';
      (items || []).forEach(t => {
        const card = document.createElement('div');
        card.className = 'testimonial-card p-6 border rounded-lg shadow-lg text-left';
        card.innerHTML = `
          <p class="text-gray-800 mb-4">"${t.text}"</p>
          <p class="font-semibold">${t.name} <span class="text-sm text-gray-600">— ${t.company || ''}</span></p>
        `;
        grid.appendChild(card);
      });
    } catch (err) {
      console.error('Failed to load testimonials', err);
    }
  }

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(contactForm).entries());
      const status = document.getElementById('contactStatus');
      status.textContent = 'Sending...';
      try {
        const res = await fetch(`${API_BASE}/contact`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        const json = await res.json();
        if (json.ok) {
          status.textContent = 'Message sent — thank you.';
          contactForm.reset();
        } else {
          status.textContent = json.error || 'Failed to send';
        }
      } catch (err) {
        status.textContent = 'Error sending message';
      }
    });
  }

  // Quote form
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(quoteForm).entries());
      const status = document.getElementById('quoteStatus');
      status.textContent = 'Requesting...';
      try {
        const res = await fetch(`${API_BASE}/quote`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        const json = await res.json();
        if (json.ok) {
          status.textContent = 'Quote requested — we will contact you soon.';
          quoteForm.reset();
        } else {
          status.textContent = json.error || 'Failed to request quote';
        }
      } catch (err) {
        status.textContent = 'Error requesting quote';
      }
    });
  }

  // Tracking (from tracking.html)
  const trackButton = document.getElementById('trackButton');
  const trackingNumber = document.getElementById('trackingNumber');
  const trackResult = document.getElementById('trackResult');
  const details = document.getElementById('details');
  const notFound = document.getElementById('notFound');

  if (trackButton && trackingNumber) {
    trackButton.addEventListener('click', async () => {
      const code = trackingNumber.value.trim().toUpperCase();
      if (!code) return;
      
      const baseUrl = (location.hostname === 'localhost') ? 'http://localhost:3000' : '';
      const url = `${baseUrl}/api/track/${encodeURIComponent(code)}`;
      
      trackResult.classList.remove('hidden');
      details.classList.add('hidden');
      notFound.classList.add('hidden');
      
      try {
        const res = await fetch(url);
        if (res.status === 404) {
          notFound.classList.remove('hidden');
          notFound.textContent = 'Tracking code not found.';
          return;
        }
        const data = await res.json();
        
        document.getElementById('code').textContent = `Tracking: ${data.tracking_code}`;
        document.getElementById('owner').textContent = `Owner: ${data.owner_name || ''}`;
        document.getElementById('company').textContent = `Company: ${data.company || ''}`;
        document.getElementById('desc').textContent = `Description: ${data.description || ''}`;
        document.getElementById('route').textContent = `Route: ${data.origin || ''} → ${data.destination || ''}`;
        document.getElementById('eta').textContent = `ETA: ${data.eta || 'N/A'}`;
        document.getElementById('weight').textContent = `Weight: ${data.weight || 'N/A'}`;

        // Generate Barcode
        try {
          JsBarcode("#shipmentBarcode", data.tracking_code, {
            format: "CODE128",
            width: 2,
            height: 50,
            displayValue: true,
            fontSize: 14,
            margin: 10
          });
          document.getElementById('barcodeInfo').textContent = `Barcode: ${data.tracking_code}`;
        } catch (err) {
          console.error('Barcode error:', err);
        }

        // Static Map Image
        const mapContainer = document.getElementById('mapContainer');
        const staticMapImage = document.getElementById('staticMapImage');
        const mapInfo = document.getElementById('mapInfo');
        if (data.dest_lat && data.dest_lng) {
          mapContainer.classList.remove('hidden');
          const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${data.dest_lat},${data.dest_lng}&zoom=7&size=600x400&markers=color:red%7C${data.dest_lat},${data.dest_lng}&style=feature:all|element:labels|visibility:off&style=feature:water|color:0xb3d9ff&style=feature:land|color:0xf3f3f3&key=AIzaSyDummyKey`;
          staticMapImage.src = mapUrl;
          mapInfo.textContent = `Destination: ${data.destination || 'N/A'} (${data.dest_lat.toFixed(4)}, ${data.dest_lng.toFixed(4)})`;
        } else {
          mapContainer.classList.add('hidden');
        }

        const movements = document.getElementById('movements');
        movements.innerHTML = '';
        (data.movements || []).forEach(m => {
          const li = document.createElement('li');
          li.textContent = `${m.timestamp?.substring(0, 10) || ''} — ${m.location || ''} — ${m.status || ''} ${m.note ? `(${m.note})` : ''}`;
          movements.appendChild(li);
        });

        details.classList.remove('hidden');
      } catch (err) {
        notFound.textContent = 'Error contacting tracking service.';
        notFound.classList.remove('hidden');
        console.error('Track error:', err);
      }
    });
  }

  // Initialize
  loadTestimonials();
})();
