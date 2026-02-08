# 🎯 Barcode Function - Quick Reference

## Installation ✅ Complete
- JsBarcode CDN added to all pages
- BarcodeUtils module created
- All pages configured

## Basic Usage

### Display Barcode in Any Container
```javascript
BarcodeUtils.displayInContainer('CC123456789', 'containerID');
```

### Just Generate (No Container Styling)
```javascript
BarcodeUtils.generate('CC123456789', 'containerID');
```

### With Responsive Resize Support
```javascript
BarcodeUtils.makeResponsive('containerID', 'CC123456789', 'Title');
```

## HTML Container Example
```html
<!-- Mobile-friendly barcode display -->
<div id="barcodeDisplay"></div>

<script>
  BarcodeUtils.displayInContainer(
    'CC123456789',
    'barcodeDisplay',
    'Shipment Barcode'
  );
</script>
```

## Responsive Sizing (Automatic)

| Screen Type | Size | Font |
|---|---|---|
| Mobile | 60px | 10px |
| Tablet | 80px | 12px |
| Desktop | 100px | 14px |

## Features
✅ Mobile responsive  
✅ Tablet optimized  
✅ Desktop quality  
✅ Auto-resizes on rotation  
✅ Print-friendly  
✅ Error handling  
✅ No configuration needed  

## Common Issues & Solutions

### Barcode not showing?
1. Check if JsBarcode CDN is loaded
2. Check if barcode-utils.js is before main.js
3. Check browser console for errors

### Wrong size on mobile?
- Automatic! Just make sure barcode-utils.js is loaded

### Want to print barcode?
```javascript
function printBarcode() {
  const el = document.getElementById('barcodeDisplay');
  window.print();
}
```

## Where It's Used
- ✅ index.html - Home page tracking
- ✅ tracking.html - Tracking page
- ✅ dashboard.html - User dashboard
- ✅ admin/shipments.html - Admin creation
- ✅ admin/shipments-list.html - Admin list

---

**Status:** ✅ Ready for Production
