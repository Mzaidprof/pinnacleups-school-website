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

let currentUser = null;
let currentRoute = 'login';
let studentState = {
  filters: { search: '', grade: '', status: '' },
  students: [],
  permissions: { canAdd: false, canEdit: false, canDeactivate: false },
  grades: [],
  statuses: []
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
    phone: '9876543210',
    username: 'parent',
    password: 'parent123',
    role: 'Parent'
  }
];

const mockStudents = [
  {
    StudentID: 'PUP001',
    Name: 'Aarav Sharma',
    Gender: 'M',
    Grade: '3',
    ParentName: 'Rajesh Sharma',
    ParentPhone: '9876543210',
    DOB: '2015-04-10',
    Address: 'Yellareddypet',
    AdmissionDate: '2026-06-01',
    Username: 'aarav01',
    Status: 'Active'
  },
  {
    StudentID: 'PUP002',
    Name: 'Sana Fatima',
    Gender: 'F',
    Grade: '4',
    ParentName: 'Fatima',
    ParentPhone: '9876543211',
    DOB: '2016-02-18',
    Address: 'Yellareddypet',
    AdmissionDate: '2026-06-01',
    Username: 'sana02',
    Status: 'Active'
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
  },

  listStudents(filters) {
    return callAppsScript('listStudents', { token: getToken(), filters });
  },

  saveStudent(student) {
    return callAppsScript('saveStudent', { token: getToken(), student });
  },

  deactivateStudent(studentId) {
    return callAppsScript('deactivateStudent', { token: getToken(), studentId });
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

      if (!session) return { authenticated: false, redirect: config.routes.LOGIN };

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

      return { authenticated: true, accessDenied: false, user: session.user, route: cleanRoute };
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

      if (!user) return { success: false, message: 'Invalid Username or Password' };

      const token = createMockToken();
      const publicUser = toPublicUser(user);
      saveMockSession(token, publicUser);
      return { success: true, token, user: publicUser, redirect: roleDashboard[publicUser.role] };
    });
  },

  logout(token) {
    return delay(() => {
      deleteMockSession(token);
      return { success: true };
    });
  },

  listStudents(filters) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session) throw new Error('Authentication required');

      let students = [...mockStudents];
      const search = String(filters.search || '').trim().toLowerCase();
      const grade = String(filters.grade || '').trim();
      const status = String(filters.status || '').trim();

      if (session.user.role === 'Parent') {
        students = students.filter((student) => student.ParentPhone === session.user.phone);
      }

      if (search) {
        students = students.filter((student) =>
          [student.StudentID, student.Name, student.ParentName, student.ParentPhone, student.Grade]
            .some((value) => String(value || '').toLowerCase().includes(search))
        );
      }
      if (grade) students = students.filter((student) => student.Grade === grade);
      if (status) students = students.filter((student) => student.Status === status);

      return {
        success: true,
        students,
        permissions: getStudentPermissions(session.user.role),
        grades: uniqueValues(mockStudents, 'Grade'),
        statuses: uniqueValues(mockStudents, 'Status')
      };
    });
  },

  saveStudent(student) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || session.user.role !== 'Admin') throw new Error('Access denied');

      if (student.StudentID) {
        const index = mockStudents.findIndex((item) => item.StudentID === student.StudentID);
        if (index !== -1) mockStudents[index] = { ...mockStudents[index], ...student };
      } else {
        mockStudents.push({
          ...student,
          StudentID: `PUP${String(mockStudents.length + 1).padStart(3, '0')}`,
          Status: student.Status || 'Active'
        });
      }
      return { success: true };
    });
  },

  deactivateStudent(studentId) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || session.user.role !== 'Admin') throw new Error('Access denied');
      const student = mockStudents.find((item) => item.StudentID === studentId);
      if (student) student.Status = 'Inactive';
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

function getModule() {
  const params = new URLSearchParams(window.location.search);
  const moduleName = String(params.get('module') || 'dashboard').trim().toLowerCase();
  return moduleName === 'students' ? 'students' : 'dashboard';
}

function normalizeRoute(route) {
  const value = String(route || config.routes.LOGIN).trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(routeRole, value) ? value : config.routes.LOGIN;
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

function routeToModule(moduleName) {
  const base = window.location.href.split('?')[0];
  window.location.href = `${base}?page=${currentRoute}&module=${moduleName}`;
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

  currentUser = result.user;
  currentRoute = result.route;
  renderDashboard(result.user, result.route, getModule());
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

function renderDashboard(user, route, moduleName = 'dashboard') {
  app.innerHTML = `
    <div class="erp-layout">
      ${renderSidebar(route, user, moduleName)}
      <main class="main">
        <div class="topbar">
          <div class="mobile-brand top-brand">
            <img class="brand-logo" src="https://pinnacleups.com/Images/schoollogo.jpeg" alt="">
            <div class="brand-name">${config.schoolName}<span>${config.appName}</span></div>
          </div>
          <div class="user-chip">${escapeHtml(user.username)} | ${escapeHtml(user.role)}</div>
          <button class="ghost-btn" id="logoutButton" type="button">Logout</button>
        </div>
        <div id="moduleHost">${moduleName === 'students' ? renderStudentsShell() : renderDashboardHome(user)}</div>
      </main>
    </div>
  `;

  document.getElementById('logoutButton').addEventListener('click', logout);
  bindNavigation();
  if (moduleName === 'students') loadStudents();
}

function renderDashboardHome(user) {
  return `
    <section class="dashboard-hero">
      <div class="section-kicker">${escapeHtml(user.role)} Dashboard</div>
      <h1>Welcome, ${escapeHtml(user.name || user.username)}</h1>
      <p>This dashboard is protected by authentication and role-based access control. Student Management is now available from the sidebar.</p>
    </section>
    <section class="info-grid">
      <article class="info-card"><span>Logged-in username</span><strong>${escapeHtml(user.username)}</strong></article>
      <article class="info-card"><span>Role</span><strong>${escapeHtml(user.role)}</strong></article>
      <article class="info-card"><span>Access</span><strong>${escapeHtml(user.role)} dashboard only</strong></article>
    </section>
    <section class="notice-card">
      <span>Phase 3 Scope</span>
      <p>Student Management is active. Attendance, Marks, Fees, Notifications, Reports, Academic Calendar, and Settings functionality remain reserved for future phases.</p>
    </section>
  `;
}

function renderSidebar(route, user, moduleName) {
  const dashboardLabel = `${capitalize(route)} Dashboard`;
  const visibleModules = config.futureModules.filter((item) =>
    item !== 'Settings' || user.role === 'Admin'
  );
  const futureLinks = visibleModules.map((item) => {
    if (item === 'Students') {
      return `
        <button class="nav-item nav-action ${moduleName === 'students' ? 'active' : ''}" type="button" data-module="students">
          <span class="nav-icon">${icons[item]}</span>
          <span>${escapeHtml(item)}</span>
        </button>
      `;
    }

    return `
      <div class="nav-item disabled" title="Coming in a future phase">
        <span class="nav-icon">${icons[item] || '--'}</span>
        <span>${escapeHtml(item)}</span>
      </div>
    `;
  }).join('');

  return `
    <aside class="sidebar">
      <div class="top-brand">
        <img class="brand-logo" src="https://pinnacleups.com/Images/schoollogo.jpeg" alt="Pinnacle Upper Primary School logo">
        <div class="brand-name">${config.schoolName}<span>${config.appName}</span></div>
      </div>
      <nav class="nav-list" aria-label="ERP navigation">
        <button class="nav-item nav-action ${moduleName === 'dashboard' ? 'active' : ''}" type="button" data-module="dashboard">
          <span class="nav-icon">${icons.Dashboard}</span>
          <span>${escapeHtml(dashboardLabel)}</span>
        </button>
        ${futureLinks}
      </nav>
      <div class="sidebar-foot">Built on the existing Pinnacle website theme and Google Sheets database.</div>
    </aside>
  `;
}

function bindNavigation() {
  document.querySelectorAll('[data-module]').forEach((button) => {
    button.addEventListener('click', () => routeToModule(button.dataset.module));
  });
}

function renderStudentsShell() {
  return `
    <section class="module-header">
      <div>
        <div class="section-kicker">Student Management</div>
        <h1>Students</h1>
        <p>Search, filter, and manage student records using the existing Students sheet.</p>
      </div>
      <button class="primary-btn compact hidden" id="addStudentButton" type="button">Add Student</button>
    </section>
    <section class="toolbar">
      <div class="field">
        <label for="studentSearch">Search</label>
        <input id="studentSearch" placeholder="Name, ID, parent, phone, class">
      </div>
      <div class="field">
        <label for="gradeFilter">Class</label>
        <select id="gradeFilter"></select>
      </div>
      <div class="field">
        <label for="statusFilter">Status</label>
        <select id="statusFilter"></select>
      </div>
    </section>
    <section class="table-card" id="studentsHost">
      <div class="user-chip">Loading students...</div>
    </section>
  `;
}

function loadStudents() {
  const host = document.getElementById('studentsHost');
  if (host) host.innerHTML = '<div class="user-chip">Loading students...</div>';

  api.listStudents(studentState.filters)
    .then((result) => {
      if (!result.success) {
        renderStudentError(result.message || 'Unable to load students');
        return;
      }

      studentState = {
        ...studentState,
        students: result.students || [],
        permissions: result.permissions || studentState.permissions,
        grades: result.grades || [],
        statuses: result.statuses || []
      };
      renderStudents();
    })
    .catch((error) => {
      console.error(error);
      renderStudentError('Unable to load students');
    });
}

function renderStudents() {
  const addButton = document.getElementById('addStudentButton');
  if (addButton && studentState.permissions.canAdd) {
    addButton.classList.remove('hidden');
    addButton.addEventListener('click', () => openStudentForm());
  }

  populateFilter('gradeFilter', 'All Classes', studentState.grades, studentState.filters.grade);
  populateFilter('statusFilter', 'All Statuses', studentState.statuses, studentState.filters.status);

  const search = document.getElementById('studentSearch');
  search.value = studentState.filters.search;
  search.addEventListener('input', debounce(() => {
    studentState.filters.search = search.value;
    loadStudents();
  }, 280));

  document.getElementById('gradeFilter').addEventListener('change', (event) => {
    studentState.filters.grade = event.target.value;
    loadStudents();
  });
  document.getElementById('statusFilter').addEventListener('change', (event) => {
    studentState.filters.status = event.target.value;
    loadStudents();
  });

  const rows = studentState.students.map((student) => renderStudentRow(student)).join('');
  document.getElementById('studentsHost').innerHTML = `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Class</th>
            <th>Parent</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="7">No students found.</td></tr>'}</tbody>
      </table>
    </div>
  `;
  bindStudentActions();
}

function renderStudentRow(student) {
  const canEdit = studentState.permissions.canEdit;
  const canDeactivate = studentState.permissions.canDeactivate && student.Status !== 'Inactive';

  return `
    <tr>
      <td>${escapeHtml(student.StudentID)}</td>
      <td>
        <strong>${escapeHtml(student.Name)}</strong>
        <small>${escapeHtml(student.Gender || 'Not set')} | DOB ${escapeHtml(student.DOB || 'Not set')}</small>
      </td>
      <td>${escapeHtml(student.Grade)}</td>
      <td>${escapeHtml(student.ParentName)}</td>
      <td>${escapeHtml(student.ParentPhone)}</td>
      <td><span class="status-pill ${student.Status === 'Active' ? 'active' : 'inactive'}">${escapeHtml(student.Status || 'Not set')}</span></td>
      <td class="actions">
        ${canEdit ? `<button type="button" class="text-btn" data-edit="${escapeHtml(student.StudentID)}">Edit</button>` : '<span class="muted-text">View only</span>'}
        ${canDeactivate ? `<button type="button" class="text-btn danger" data-deactivate="${escapeHtml(student.StudentID)}">Deactivate</button>` : ''}
      </td>
    </tr>
  `;
}

function bindStudentActions() {
  document.querySelectorAll('[data-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const student = studentState.students.find((item) => item.StudentID === button.dataset.edit);
      openStudentForm(student);
    });
  });

  document.querySelectorAll('[data-deactivate]').forEach((button) => {
    button.addEventListener('click', () => deactivateStudent(button.dataset.deactivate));
  });
}

function openStudentForm(student = {}) {
  const isEdit = Boolean(student.StudentID);
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <form class="student-form" id="studentForm">
      <div class="form-head">
        <div>
          <div class="section-kicker">${isEdit ? 'Edit Student' : 'Add Student'}</div>
          <h2>${isEdit ? escapeHtml(student.Name) : 'New Student'}</h2>
        </div>
        <button type="button" class="icon-btn" id="closeStudentForm">X</button>
      </div>
      <input type="hidden" name="StudentID" value="${escapeHtml(student.StudentID || '')}">
      ${renderStudentField('Name', 'Name', student.Name, true)}
      <div class="form-grid">
        ${renderStudentField('Gender', 'Gender', student.Gender)}
        ${renderStudentField('Grade', 'Class', student.Grade, true)}
      </div>
      <div class="form-grid">
        ${renderStudentField('ParentName', 'Parent Name', student.ParentName, true)}
        ${renderStudentField('ParentPhone', 'Parent Phone', student.ParentPhone, true)}
      </div>
      <div class="form-grid">
        ${renderStudentField('DOB', 'Date of Birth', student.DOB, false, 'date')}
        ${renderStudentField('AdmissionDate', 'Admission Date', student.AdmissionDate, false, 'date')}
      </div>
      ${renderStudentField('Address', 'Address', student.Address)}
      <div class="form-grid">
        ${renderStudentField('Username', 'Student Username', student.Username)}
        ${renderStudentField('Password', 'Student Password', '', false, 'password')}
      </div>
      <div class="field">
        <label for="studentStatus">Status</label>
        <select id="studentStatus" name="Status">
          <option value="Active" ${student.Status !== 'Inactive' ? 'selected' : ''}>Active</option>
          <option value="Inactive" ${student.Status === 'Inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
      <button class="primary-btn" type="submit">${isEdit ? 'Save Changes' : 'Add Student'}</button>
      <div class="message" id="studentFormMessage"></div>
    </form>
  `;

  document.body.appendChild(modal);
  document.getElementById('closeStudentForm').addEventListener('click', () => modal.remove());
  document.getElementById('studentForm').addEventListener('submit', (event) => submitStudentForm(event, modal));
}

function renderStudentField(name, label, value = '', required = false, type = 'text') {
  return `
    <div class="field">
      <label for="student${name}">${label}</label>
      <input id="student${name}" name="${name}" type="${type}" value="${escapeHtml(value || '')}" ${required ? 'required' : ''}>
    </div>
  `;
}

function submitStudentForm(event, modal) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  const message = document.getElementById('studentFormMessage');
  message.textContent = '';

  api.saveStudent(data)
    .then((result) => {
      if (!result.success) {
        message.textContent = result.message || 'Unable to save student';
        return;
      }
      modal.remove();
      loadStudents();
    })
    .catch((error) => {
      console.error(error);
      message.textContent = 'Unable to save student';
    });
}

function deactivateStudent(studentId) {
  api.deactivateStudent(studentId)
    .then((result) => {
      if (!result.success) {
        renderStudentError(result.message || 'Unable to deactivate student');
        return;
      }
      loadStudents();
    })
    .catch((error) => {
      console.error(error);
      renderStudentError('Unable to deactivate student');
    });
}

function renderStudentError(message) {
  const host = document.getElementById('studentsHost');
  if (host) host.innerHTML = `<div class="message">${escapeHtml(message)}</div>`;
}

function populateFilter(id, label, values, selectedValue) {
  const select = document.getElementById(id);
  select.innerHTML = `<option value="">${label}</option>` + values.map((value) =>
    `<option value="${escapeHtml(value)}" ${value === selectedValue ? 'selected' : ''}>${escapeHtml(value)}</option>`
  ).join('');
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
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone || '',
    username: user.username,
    role: user.role
  };
}

function getStudentPermissions(role) {
  return {
    canView: ['Admin', 'Teacher', 'Parent'].includes(role),
    canAdd: role === 'Admin',
    canEdit: role === 'Admin',
    canDeactivate: role === 'Admin'
  };
}

function uniqueValues(items, key) {
  return Array.from(new Set(items.map((item) => item[key]).filter(Boolean))).sort();
}

function handleServerError(error) {
  console.error(error);
  clearToken();
  renderLogin();
}

function debounce(callback, wait) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };
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
