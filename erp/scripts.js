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
