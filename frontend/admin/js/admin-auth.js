// Admin Authentication Handler
(function () {
  const loginBtn = document.getElementById('loginBtn');
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const adminToken = document.getElementById('adminToken');
  const authStatus = document.getElementById('authStatus');
  const authSection = document.getElementById('authSection');
  const adminPanel = document.getElementById('adminPanel');

  // Check if user is logged in
  function checkAuth() {
    const token = localStorage.getItem('adminJWT');
    if (token && authSection) {
      authSection.classList.add('hidden');
      if (adminPanel) adminPanel.classList.remove('hidden');
    }
  }

  // Login - Exchange raw token for JWT
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const rawToken = adminToken.value.trim();
      if (!rawToken) {
        authStatus.className = 'text-sm mt-3 text-center text-red-600';
        authStatus.textContent = 'Please enter a token';
        return;
      }

      try {
        authStatus.className = 'text-sm mt-3 text-center text-blue-600';
        authStatus.textContent = '⏳ Verifying token...';

        // Exchange raw token for JWT
        const response = await fetch('/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: rawToken })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.ok || !data.token) {
          throw new Error('Invalid token - access denied');
        }

        // Store JWT token in localStorage
        localStorage.setItem('adminJWT', data.token);
        localStorage.setItem('adminTokenExpiry', new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString());

        authStatus.className = 'text-sm mt-3 text-center text-green-600 font-semibold';
        authStatus.textContent = '✓ Access granted! Loading...';

        setTimeout(() => {
          checkAuth();
        }, 500);
      } catch (err) {
        console.error('Login error:', err);
        authStatus.className = 'text-sm mt-3 text-center text-red-600';
        authStatus.textContent = `❌ Error: ${err.message}`;
      }
    });
  }

  // Logout
  const logoutBtns = [logoutBtn, sidebarLogoutBtn];
  logoutBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        localStorage.removeItem('adminJWT');
        localStorage.removeItem('adminTokenExpiry');
        if (authSection) authSection.classList.remove('hidden');
        if (adminPanel) adminPanel.classList.add('hidden');
        if (adminToken) adminToken.value = '';
        if (authStatus) {
          authStatus.className = 'text-sm mt-3 text-center text-blue-600';
          authStatus.textContent = 'Logged out successfully';
        }
      });
    }
  });

  // Check auth on page load
  checkAuth();
})();
