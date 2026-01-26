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
    const token = localStorage.getItem('adminToken');
    if (token && authSection) {
      authSection.classList.add('hidden');
      if (adminPanel) adminPanel.classList.remove('hidden');
    }
  }

  // Login
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const token = adminToken.value.trim();
      if (!token) {
        authStatus.className = 'text-sm mt-3 text-center text-red-600';
        authStatus.textContent = 'Please enter a token';
        return;
      }

      // Store token in localStorage
      localStorage.setItem('adminToken', token);
      authStatus.className = 'text-sm mt-3 text-center text-green-600 font-semibold';
      authStatus.textContent = '✓ Access granted! Loading...';

      setTimeout(() => {
        checkAuth();
      }, 500);
    });
  }

  // Logout
  const logoutBtns = [logoutBtn, sidebarLogoutBtn];
  logoutBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
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
