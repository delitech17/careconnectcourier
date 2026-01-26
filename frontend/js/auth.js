// Authentication Handler
(function () {
  const API_BASE = (location.hostname === 'localhost') ? 'http://localhost:3000/api' : '/api';

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authStatus = document.getElementById('authStatus');

  function toggleTab() {
    document.getElementById('loginTab').classList.toggle('hidden');
    document.getElementById('registerTab').classList.toggle('hidden');
  }

  window.toggleTab = toggleTab;

  // Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(loginForm).entries());
      authStatus.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
      authStatus.textContent = 'Logging in...';

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await res.json();

        if (json.ok) {
          localStorage.setItem('authToken', json.token);
          localStorage.setItem('userName', json.user.name);
          authStatus.className = 'bg-green-100 text-green-800 p-3 rounded-lg';
          authStatus.textContent = '✓ Login successful! Redirecting...';
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1500);
        } else {
          authStatus.className = 'bg-red-100 text-red-800 p-3 rounded-lg';
          authStatus.textContent = '✗ ' + (json.error || 'Login failed');
        }
      } catch (err) {
        authStatus.className = 'bg-red-100 text-red-800 p-3 rounded-lg';
        authStatus.textContent = '✗ Network error';
      }
    });
  }

  // Register
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(registerForm).entries());
      authStatus.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
      authStatus.textContent = 'Creating account...';

      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await res.json();

        if (json.ok) {
          localStorage.setItem('authToken', json.token);
          localStorage.setItem('userName', json.user.name);
          authStatus.className = 'bg-green-100 text-green-800 p-3 rounded-lg';
          authStatus.textContent = '✓ Account created! Redirecting...';
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1500);
        } else {
          authStatus.className = 'bg-red-100 text-red-800 p-3 rounded-lg';
          authStatus.textContent = '✗ ' + (json.error || 'Registration failed');
        }
      } catch (err) {
        authStatus.className = 'bg-red-100 text-red-800 p-3 rounded-lg';
        authStatus.textContent = '✗ Network error';
      }
    });
  }
})();
