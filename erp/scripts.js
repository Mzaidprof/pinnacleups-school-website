const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyZ0wz-gdI0yFFDZOUUit9PPZTSRzCmMHyojKU_GPZvZnD4zU-Jafh7Ik1gCOaHvSbl/exec';
const API_MODE = 'apps-script';

const config = {
  appName: 'Pinnacle ERP',
  schoolName: 'Pinnacle Upper Primary School',
  routes: {
    LOGIN: 'login',
    ADMIN: 'admin',
    TEACHER: 'teacher',
    PARENT: 'parent'
  },
  futureModules: [
    'Students',
    'Attendance',
    'Marks',
    'Fees',
    'Notifications',
    'Reports',
    'Academic Calendar',
    'Settings'
  ]
};

const app = document.getElementById('app');
const tokenKey = 'pinnacle_erp_session';
const mockSessionKey = 'pinnacle_erp_mock_sessions';
const routeRole = {
  admin: 'Admin',
  teacher: 'Teacher',
  parent: 'Parent'
};
const roleDashboard = {
  Admin: 'admin',
  Teacher: 'teacher',
  Parent: 'parent'
};
const icons = {
  Dashboard: 'DB',
  Students: 'ST',
  Attendance: 'AT',
  Marks: 'MK',
  Fees: 'FE',
  Notifications: '!',
  Reports: 'RP',
  'Academic Calendar': 'AC',
  Settings: 'SE'
};

const mockUsers = [
  {
    id: 'MOCK-A001',
    name: 'Mohammed Zaid',
    username: 'admin',
    password: 'admin123',
    role: 'Admin'
  },
  {
    id: 'MOCK-T001',
    name: 'Priya Menon',
    username: 'teacher',
    password: 'teacher123',
    role: 'Teacher'
  },
  {
    id: 'MOCK-P001',
    name: 'Mr Khan',
    username: 'parent',
    password: 'parent123',
    role: 'Parent'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  renderLoading();
  api.getRouteBootstrap(getToken(), getRoute())
    .then(handleBootstrap)
    .catch(handleServerError);
});

const appsScriptApi = {
  getRouteBootstrap(token, route) {
    return callAppsScript('bootstrap', { token, route });
  },

  login(username, password) {
    return callAppsScript('login', { username, password });
  },

  logout(token) {
    return callAppsScript('logout', { token });
  }
};

function callAppsScript(action, payload) {
  return fetch(SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({ action, ...payload })
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Apps Script request failed: ${response.status}`);
    }
    return response.json();
  });
}

const mockApi = {
  getRouteBootstrap(token, route) {
    return delay(() => {
      const cleanRoute = normalizeRoute(route);
      const session = getMockSession(token);

      if (cleanRoute === config.routes.LOGIN) {
        return session
          ? { authenticated: true, user: session.user, redirect: roleDashboard[session.user.role] }
          : { authenticated: false, route: config.routes.LOGIN };
      }

      if (!session) {
        return { authenticated: false, redirect: config.routes.LOGIN };
      }

      const requiredRole = routeRole[cleanRoute];
      if (requiredRole !== session.user.role) {
        return {
          authenticated: true,
          accessDenied: true,
          user: session.user,
          route: cleanRoute,
          expectedRoute: roleDashboard[session.user.role]
        };
      }

      return {
        authenticated: true,
        accessDenied: false,
        user: session.user,
        route: cleanRoute
      };
    });
  },

  login(username, password) {
    return delay(() => {
      const cleanUsername = String(username || '').trim().toLowerCase();
      const cleanPassword = String(password || '').trim();
      const user = mockUsers.find((item) =>
        item.username.toLowerCase() === cleanUsername &&
        item.password === cleanPassword
      );

      if (!user) {
        return { success: false, message: 'Invalid Username or Password' };
      }

      const token = createMockToken();
      const publicUser = toPublicUser(user);
      saveMockSession(token, publicUser);

      return {
        success: true,
        token,
        user: publicUser,
        redirect: roleDashboard[publicUser.role]
      };
    });
  },

  logout(token) {
    return delay(() => {
      deleteMockSession(token);
      return { success: true };
    });
  }
};

const api = API_MODE === 'apps-script' ? appsScriptApi : mockApi;

function delay(callback) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(callback()), 220);
  });
}

function getRoute() {
  const params = new URLSearchParams(window.location.search);
  return normalizeRoute(params.get('page'));
}

function normalizeRoute(route) {
  const value = String(route || config.routes.LOGIN).trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(routeRole, value)
    ? value
    : config.routes.LOGIN;
}

function getToken() {
  return localStorage.getItem(tokenKey) || '';
}

function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

function clearToken() {
  localStorage.removeItem(tokenKey);
}

function routeTo(route) {
  const base = window.location.href.split('?')[0];
  window.location.href = route === 'login' ? base : `${base}?page=${route}`;
}

function handleBootstrap(result) {
  if (result.redirect) {
    routeTo(result.redirect);
    return;
  }

  if (!result.authenticated) {
    renderLogin();
    return;
  }

  if (result.accessDenied) {
    renderAccessDenied(result.user, result.expectedRoute);
    return;
  }

  renderDashboard(result.user, result.route);
}

function renderLoading() {
  app.innerHTML = `
    <main class="loading-screen">
      <div class="user-chip">Loading Pinnacle ERP...</div>
    </main>
  `;
}

function renderLogin() {
  app.innerHTML = `
    <main class="login-screen">
      <section class="login-panel">
        <div class="login-brand">
          <div class="brand-mark">
            <img class="brand-logo" src="https://pinnacleups.com/Images/schoollogo.jpeg" alt="Pinnacle Upper Primary School logo">
            <div class="brand-name">Pinnacle Upper Primary School <span>English Medium | CBSE</span></div>
          </div>
          <div class="brand-copy">
            <div class="section-kicker">ERP Access</div>
            <h1>Secure school portal</h1>
            <p>One login for administrators, teachers, and parents, connected to the existing Pinnacle school database.</p>
          </div>
        </div>
        <form class="login-card" id="loginForm">
          <div class="section-kicker">Phase 2</div>
          <h2>Sign in</h2>
          <p>Use your assigned username and password to open your dashboard.</p>
          <div class="field">
            <label for="username">Username</label>
            <input id="username" name="username" autocomplete="username" required>
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required>
          </div>
          <button class="primary-btn" id="loginButton" type="submit">Login</button>
          <div class="message" id="loginMessage"></div>
        </form>
      </section>
    </main>
  `;

  document.getElementById('loginForm').addEventListener('submit', submitLogin);
  document.getElementById('username').focus();
}

function submitLogin(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const button = document.getElementById('loginButton');
  const message = document.getElementById('loginMessage');
  button.disabled = true;
  button.textContent = 'Checking...';
  message.textContent = '';

  api.login(form.username.value, form.password.value)
    .then((result) => {
      if (!result.success) {
        button.disabled = false;
        button.textContent = 'Login';
        message.textContent = result.message || 'Invalid Username or Password';
        return;
      }

      setToken(result.token);
      routeTo(result.redirect);
    })
    .catch((error) => {
      button.disabled = false;
      button.textContent = 'Login';
      message.textContent = 'Unable to login. Please try again.';
      console.error(error);
    });
}

function renderDashboard(user, route) {
  app.innerHTML = `
    <div class="erp-layout">
      ${renderSidebar(route, user)}
      <main class="main">
        <div class="topbar">
          <div class="mobile-brand top-brand">
            <img class="brand-logo" src="https://pinnacleups.com/Images/schoollogo.jpeg" alt="">
            <div class="brand-name">${config.schoolName}<span>${config.appName}</span></div>
          </div>
          <div class="user-chip">${escapeHtml(user.username)} | ${escapeHtml(user.role)}</div>
          <button class="ghost-btn" id="logoutButton" type="button">Logout</button>
        </div>
        <section class="dashboard-hero">
          <div class="section-kicker">${escapeHtml(user.role)} Dashboard</div>
          <h1>Welcome, ${escapeHtml(user.name || user.username)}</h1>
          <p>This dashboard is protected by authentication and role-based access control. Module features will be added in later phases.</p>
        </section>
        <section class="info-grid">
          <article class="info-card"><span>Logged-in username</span><strong>${escapeHtml(user.username)}</strong></article>
          <article class="info-card"><span>Role</span><strong>${escapeHtml(user.role)}</strong></article>
          <article class="info-card"><span>Access</span><strong>${escapeHtml(user.role)} dashboard only</strong></article>
        </section>
        <section class="notice-card">
          <span>Phase 2 Scope</span>
          <p>Authentication, session handling, dashboard routing, route protection, logout, and RBAC are active. Students, Attendance, Marks, Fees, Notifications, Reports, Academic Calendar, and Settings are reserved for future phases.</p>
        </section>
      </main>
    </div>
  `;

  document.getElementById('logoutButton').addEventListener('click', logout);
}

function renderSidebar(route, user) {
  const dashboardLabel = `${capitalize(route)} Dashboard`;
  const visibleModules = config.futureModules.filter((item) =>
    item !== 'Settings' || user.role === 'Admin'
  );
  const futureLinks = visibleModules.map((item) => `
    <div class="nav-item disabled" title="Coming in a future phase">
      <span class="nav-icon">${icons[item] || '--'}</span>
      <span>${escapeHtml(item)}</span>
    </div>
  `).join('');

  return `
    <aside class="sidebar">
      <div class="top-brand">
        <img class="brand-logo" src="https://pinnacleups.com/Images/schoollogo.jpeg" alt="Pinnacle Upper Primary School logo">
        <div class="brand-name">${config.schoolName}<span>${config.appName}</span></div>
      </div>
      <nav class="nav-list" aria-label="ERP navigation">
        <div class="nav-item active"><span class="nav-icon">${icons.Dashboard}</span><span>${escapeHtml(dashboardLabel)}</span></div>
        ${futureLinks}
      </nav>
      <div class="sidebar-foot">Built on the existing Pinnacle website theme and Google Sheets database.</div>
    </aside>
  `;
}

function renderAccessDenied(user, expectedRoute) {
  app.innerHTML = `
    <main class="loading-screen">
      <section class="access-denied">
        <h1>Access Denied</h1>
        <p>${escapeHtml(user.role)} users can access only their assigned dashboard.</p>
        <button class="primary-btn" id="correctDashboard" type="button">Go to My Dashboard</button>
        <button class="ghost-btn" id="accessLogout" type="button" style="margin-top:12px;">Logout</button>
      </section>
    </main>
  `;
  document.getElementById('correctDashboard').addEventListener('click', () => routeTo(expectedRoute));
  document.getElementById('accessLogout').addEventListener('click', logout);
}

function logout() {
  renderLoading();
  api.logout(getToken())
    .then(() => {
      clearToken();
      routeTo('login');
    })
    .catch(() => {
      clearToken();
      routeTo('login');
    });
}

function getMockSessions() {
  try {
    return JSON.parse(localStorage.getItem(mockSessionKey) || '{}');
  } catch (error) {
    localStorage.removeItem(mockSessionKey);
    return {};
  }
}

function saveMockSessions(sessions) {
  localStorage.setItem(mockSessionKey, JSON.stringify(sessions));
}

function getMockSession(token) {
  if (!token) return null;

  const sessions = getMockSessions();
  const session = sessions[token];
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    delete sessions[token];
    saveMockSessions(sessions);
    return null;
  }

  return session;
}

function saveMockSession(token, user) {
  const sessions = getMockSessions();
  sessions[token] = {
    user,
    createdAt: Date.now(),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000
  };
  saveMockSessions(sessions);
}

function deleteMockSession(token) {
  if (!token) return;

  const sessions = getMockSessions();
  delete sessions[token];
  saveMockSessions(sessions);
}

function createMockToken() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role
  };
}

function handleServerError(error) {
  console.error(error);
  clearToken();
  renderLogin();
}

function capitalize(value) {
  return String(value || '').charAt(0).toUpperCase() + String(value || '').slice(1);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
