#!/usr/bin/env node

/**
 * Quick test script for admin login endpoint
 * Usage: node test-admin-login.js [token] [url]
 * 
 * Examples:
 * node test-admin-login.js demo-token-12345 http://localhost:3000
 * node test-admin-login.js YOUR_TOKEN_HERE https://careconnectcourier.onrender.com
 */

const token = process.argv[2];
const baseUrl = process.argv[3] || 'http://localhost:3000';

if (!token) {
  console.error('❌ Error: Please provide a token');
  console.error('');
  console.error('Usage: node test-admin-login.js <token> [url]');
  console.error('');
  console.error('Examples:');
  console.error('  node test-admin-login.js demo-token-12345 http://localhost:3000');
  console.error('  node test-admin-login.js YOUR_TOKEN_HERE https://careconnectcourier.onrender.com');
  process.exit(1);
}

const url = `${baseUrl}/admin/login`;
const body = JSON.stringify({ token });

console.log('🧪 Testing Admin Login Endpoint\n');
console.log(`📍 URL: POST ${url}`);
console.log(`🔑 Token: ${token.substring(0, 10)}...${token.substring(token.length - 10)}`);
console.log(`📦 Body: ${body}\n`);
console.log('⏳ Sending request...\n');

// Make the request
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: body
})
  .then(res => {
    console.log(`📊 Response Status: ${res.status} ${res.statusText}\n`);
    
    // Print response headers
    console.log('📋 Response Headers:');
    res.headers.forEach((value, name) => {
      if (name.toLowerCase() !== 'authorization') {
        console.log(`  ${name}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
      }
    });
    console.log('');
    
    return res.json();
  })
  .then(data => {
    console.log('📄 Response Body:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    
    // Interpret response
    if (data.ok && data.token) {
      console.log('✅ SUCCESS! Login endpoint is working.\n');
      console.log('🎯 Your JWT token:');
      console.log(data.token);
      console.log('');
      console.log(`⏰ Expires in: ${data.expiresIn}`);
      console.log('');
      console.log('💡 Use this JWT token in your requests:');
      console.log(`Authorization: Bearer ${data.token}`);
    } else if (data.error === 'Unauthorized') {
      console.log('❌ FAILED: 401 Unauthorized\n');
      console.log('Possible causes:');
      console.log('  1. Token is incorrect');
      console.log('  2. Token doesn\'t match ADMIN_TOKEN on server');
      console.log('  3. Token has leading/trailing spaces');
      console.log('');
      console.log('💡 Try these fixes:');
      console.log('  1. Check the ADMIN_TOKEN in your environment');
      console.log('  2. Make sure there are no spaces in the token');
      console.log('  3. Copy the token exactly as it appears');
    } else if (data.error === 'token is required') {
      console.log('❌ FAILED: 400 Bad Request - Token is required\n');
      console.log('Possible causes:');
      console.log('  1. Token parameter is missing from request body');
      console.log('  2. Request body is not JSON');
      console.log('');
      console.log('💡 Make sure your request has this body:');
      console.log('  {"token": "YOUR_TOKEN_HERE"}');
    } else {
      console.log('⚠️  Unexpected response:');
      console.log(JSON.stringify(data, null, 2));
    }
  })
  .catch(err => {
    console.log('❌ FAILED: Request Error\n');
    console.log(`Error: ${err.message}`);
    console.log('');
    console.log('Possible causes:');
    console.log('  1. Server is not running or unreachable');
    console.log('  2. Wrong URL or port');
    console.log('  3. Network connectivity issue');
    console.log('');
    console.log('💡 Try these fixes:');
    console.log(`  1. Verify server is running at ${baseUrl}`);
    console.log('  2. Check your internet connection');
    console.log('  3. For local testing: npm start in node_server directory');
    process.exit(1);
  });
