/**
 * BARCODE FUNCTION USAGE GUIDE
 * 
 * The barcode system is now fully responsive and works on desktop, tablet, and mobile screens.
 * It uses the JsBarcode library to generate professional CODE128 barcodes.
 */

// ============================================
// 1. BASIC BARCODE GENERATION
// ============================================

/**
 * Generate a barcode in a container
 * The barcode size automatically adapts to screen size:
 * - Mobile (<480px): Small size (60px height)
 * - Tablet (480-768px): Medium size (80px height)
 * - Desktop (>768px): Large size (100px height)
 */

// Example HTML:
// <div id="barcodeContainer"></div>

// JavaScript:
const trackingCode = 'CC123456789';
BarcodeUtils.generate(trackingCode, 'barcodeContainer');

// Or with custom options:
BarcodeUtils.generate(trackingCode, 'barcodeContainer', {
  format: "CODE128",
  width: 1.5,
  height: 80
});


// ============================================
// 2. BARCODE WITH TEXT LABEL
// ============================================

/**
 * Generate barcode with tracking code text displayed below
 * Text size also adapts to screen size
 */

BarcodeUtils.generateWithText(trackingCode, 'barcodeContainer');


// ============================================
// 3. FULL BARCODE DISPLAY CONTAINER
// ============================================

/**
 * Display barcode in a formatted container with:
 * - Title
 * - Responsive wrapper
 * - Barcode
 * - Tracking code text below
 * 
 * All styling is responsive and works on all screen sizes
 */

// Example HTML:
// <div id="barcodeDisplay"></div>

// JavaScript:
BarcodeUtils.displayInContainer(
  trackingCode,
  'barcodeDisplay',
  'Shipment Barcode'
);


// ============================================
// 4. RESPONSIVE RESIZE HANDLING
// ============================================

/**
 * Enable responsive barcode that regenerates when window resizes
 * Useful for when user rotates device or resizes browser
 */

BarcodeUtils.makeResponsive('barcodeContainer', trackingCode, 'Shipment Barcode');


// ============================================
// 5. IN ADMIN PAGES - DISPLAY SHIPMENT BARCODES
// ============================================

/**
 * Example: Display barcode for each shipment in admin list
 */

const shipments = [
  { id: 1, tracking_code: 'CC001' },
  { id: 2, tracking_code: 'CC002' },
  { id: 3, tracking_code: 'CC003' }
];

shipments.forEach(shipment => {
  const container = document.getElementById(`barcode-${shipment.id}`);
  if (container) {
    BarcodeUtils.displayInContainer(
      shipment.tracking_code,
      container,
      'Tracking Barcode'
    );
  }
});


// ============================================
// 6. SCREEN SIZE REFERENCE
// ============================================

/**
 * Mobile (<480px):
 * - Barcode height: 60px
 * - Bar width: 1.2px
 * - Font size: 10px
 * - Margin: 5px
 * - Text size: 0.75rem (0.7rem for code)
 * - Letter spacing: 0.5px
 * 
 * Tablet (480px - 768px):
 * - Barcode height: 80px
 * - Bar width: 1.5px
 * - Font size: 12px
 * - Margin: 8px
 * - Text size: 0.8rem
 * - Letter spacing: 1px
 * 
 * Desktop (>768px):
 * - Barcode height: 100px
 * - Bar width: 2px
 * - Font size: 14px
 * - Margin: 10px
 * - Text size: 0.875rem
 * - Letter spacing: 1px
 */


// ============================================
// 7. ERROR HANDLING
// ============================================

/**
 * The barcode functions have built-in error handling:
 * - If JsBarcode library is not loaded, displays a message
 * - If container doesn't exist, logs warning
 * - If code is empty, logs warning
 * - Returns boolean (true if successful, false if failed)
 */

const success = BarcodeUtils.generate(trackingCode, 'barcodeContainer');
if (success) {
  console.log('Barcode generated successfully');
} else {
  console.log('Failed to generate barcode');
}


// ============================================
// 8. FULL PAGE EXAMPLE - TRACKING PAGE
// ============================================

/**
 * Example implementation for tracking page:
 */

document.getElementById('trackButton').addEventListener('click', async () => {
  const trackingCode = document.getElementById('trackingNumber').value;
  
  // Fetch shipment data
  const response = await fetch(`/api/track/${trackingCode}`);
  const shipment = await response.json();
  
  // Display results
  if (shipment) {
    // Show shipment details
    document.getElementById('shipmentCode').textContent = shipment.tracking_code;
    
    // Generate responsive barcode
    BarcodeUtils.displayInContainer(
      shipment.tracking_code,
      'barcodeContainer',
      'Shipment Barcode'
    );
    
    // Enable responsive resizing
    BarcodeUtils.makeResponsive('barcodeContainer', shipment.tracking_code);
    
    document.getElementById('details').classList.remove('hidden');
  }
});


// ============================================
// 9. PRINT BARCODE
// ============================================

/**
 * The barcode SVG is print-friendly and will scale nicely
 * CSS handles the responsive sizing automatically
 */

function printBarcode() {
  const printWindow = window.open('', '', 'height=600,width=800');
  const barcodeElement = document.getElementById('barcodeContainer');
  printWindow.document.write(barcodeElement.innerHTML);
  printWindow.document.close();
  printWindow.print();
}
