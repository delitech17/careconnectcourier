/**
 * Barcode Utility Functions
 * Provides barcode generation and display functionality using JsBarcode library
 */

const BarcodeUtils = {
  /**
   * Get responsive barcode options based on viewport width
   * @returns {object} - Responsive options for JsBarcode
   */
  getResponsiveOptions: function() {
    const width = window.innerWidth;
    
    // Mobile (< 480px)
    if (width < 480) {
      return {
        format: "CODE128",
        width: 1.2,
        height: 60,
        displayValue: true,
        fontSize: 10,
        margin: 5
      };
    }
    // Tablet (480px - 768px)
    else if (width < 768) {
      return {
        format: "CODE128",
        width: 1.5,
        height: 80,
        displayValue: true,
        fontSize: 12,
        margin: 8
      };
    }
    // Desktop (> 768px)
    else {
      return {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 14,
        margin: 10
      };
    }
  },

  /**
   * Generate and display a barcode in a container element
   * @param {string} code - The tracking code to encode
   * @param {HTMLElement|string} container - Container element or selector ID
   * @param {object} options - Optional configuration
   * @returns {boolean} - True if successful, false otherwise
   */
  generate: function(code, container, options = {}) {
    if (!code) {
      console.warn('BarcodeUtils: No code provided');
      return false;
    }

    // Handle string selector or element
    let containerEl = container;
    if (typeof container === 'string') {
      containerEl = document.getElementById(container);
    }

    if (!containerEl) {
      console.warn('BarcodeUtils: Container not found');
      return false;
    }

    try {
      // Get responsive options
      const responsiveOptions = this.getResponsiveOptions();
      const finalOptions = { ...responsiveOptions, ...options };

      // Clear previous content
      containerEl.innerHTML = '';

      // Create SVG element
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'barcode-' + Math.random().toString(36).substr(2, 9);
      svg.setAttribute('style', 'background: white; border-radius: 4px; max-width: 100%; height: auto;');
      containerEl.appendChild(svg);

      // Generate barcode using JsBarcode
      if (typeof JsBarcode === 'undefined') {
        console.error('BarcodeUtils: JsBarcode library not loaded');
        containerEl.innerHTML = '<p style="color: #dc2626; text-align: center; font-size: 0.875rem;">Barcode library not available</p>';
        return false;
      }

      JsBarcode(`#${svg.id}`, code, finalOptions);
      return true;

    } catch (err) {
      console.error('BarcodeUtils: Error generating barcode -', err);
      containerEl.innerHTML = `<p style="color: #dc2626; text-align: center; font-size: 0.875rem;">Error generating barcode</p>`;
      return false;
    }
  },

  /**
   * Generate barcode and append text info below it
   * @param {string} code - The tracking code
   * @param {HTMLElement|string} container - Container element or selector
   * @param {object} options - Optional configuration
   */
  generateWithText: function(code, container, options = {}) {
    const success = this.generate(code, container, options);
    
    if (!success) return;

    // Handle string selector
    let containerEl = container;
    if (typeof container === 'string') {
      containerEl = document.getElementById(container);
    }

    // Add code text below barcode
    const textEl = document.createElement('p');
    textEl.style.marginTop = '0.5rem';
    textEl.style.fontSize = window.innerWidth < 480 ? '0.75rem' : '0.875rem';
    textEl.style.color = '#6b7280';
    textEl.style.textAlign = 'center';
    textEl.style.fontWeight = '600';
    textEl.style.letterSpacing = '1px';
    textEl.style.wordBreak = 'break-all';
    textEl.textContent = `Code: ${code}`;
    containerEl.appendChild(textEl);
  },

  /**
   * Display barcode in a formatted container with title
   * @param {string} code - The tracking code
   * @param {HTMLElement|string} container - Container element
   * @param {string} title - Optional title for the barcode section
   * @param {object} options - Optional configuration
   */
  displayInContainer: function(code, container, title = 'Shipment Barcode', options = {}) {
    // Handle string selector
    let containerEl = container;
    if (typeof container === 'string') {
      containerEl = document.getElementById(container);
    }

    if (!containerEl) {
      console.warn('BarcodeUtils: Container not found');
      return false;
    }

    try {
      const isMobile = window.innerWidth < 480;
      const isTablet = window.innerWidth < 768;

      // Clear container
      containerEl.innerHTML = '';

      // Create title
      const titleEl = document.createElement('h5');
      titleEl.style.fontWeight = '700';
      titleEl.style.color = '#d91e63'; // primary color
      titleEl.style.marginBottom = isMobile ? '1rem' : '1.5rem';
      titleEl.style.fontSize = isMobile ? '0.9rem' : isTablet ? '1rem' : '1.125rem';
      titleEl.textContent = title;
      containerEl.appendChild(titleEl);

      // Create wrapper for barcode
      const wrapper = document.createElement('div');
      wrapper.id = 'barcodeWrapper-' + Math.random().toString(36).substr(2, 9);
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'center';
      wrapper.style.width = '100%';
      wrapper.style.background = 'white';
      wrapper.style.padding = isMobile ? '0.75rem' : isTablet ? '1rem' : '1.5rem';
      wrapper.style.borderRadius = '0.5rem';
      wrapper.style.border = '1px solid #e5e7eb';
      wrapper.style.marginBottom = isMobile ? '0.75rem' : '1rem';
      wrapper.style.overflowX = 'auto';
      wrapper.style.boxSizing = 'border-box';
      containerEl.appendChild(wrapper);

      // Generate barcode in wrapper with responsive options
      this.generate(code, wrapper, options);

      // Add barcode info text
      const infoEl = document.createElement('p');
      infoEl.style.fontSize = isMobile ? '0.7rem' : isTablet ? '0.8rem' : '0.875rem';
      infoEl.style.color = '#6b7280';
      infoEl.style.textAlign = 'center';
      infoEl.style.fontWeight = '600';
      infoEl.style.letterSpacing = isMobile ? '0.5px' : '1px';
      infoEl.style.wordBreak = 'break-all';
      infoEl.style.margin = isMobile ? '0.5rem 0 0 0' : '0.5rem 0 0 0';
      infoEl.textContent = `Tracking Code: ${code}`;
      containerEl.appendChild(infoEl);

      return true;

    } catch (err) {
      console.error('BarcodeUtils: Error displaying barcode -', err);
      return false;
    }
  },

  /**
   * Add window resize listener to regenerate barcodes responsively
   * @param {string} containerId - ID of the container with barcode
   * @param {string} code - The tracking code
   * @param {string} title - Title for the barcode
   */
  makeResponsive: function(containerId, code, title = 'Shipment Barcode') {
    const self = this;
    let resizeTimeout;

    window.addEventListener('resize', function() {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        self.displayInContainer(code, containerId, title);
      }, 250);
    });
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BarcodeUtils;
}
