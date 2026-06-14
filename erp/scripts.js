const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyZ0wz-gdI0yFFDZOUUit9PPZTSRzCmMHyojKU_GPZvZnD4zU-Jafh7Ik1gCOaHvSbl/exec";
const API_MODE = "apps-script";

const config = {
  appName: "Pinnacle ERP",
  schoolName: "Pinnacle Upper Primary School",
  mainWebsiteUrl: "https://pinnacleups.com/",
  routes: {
    LOGIN: "login",
    ADMIN: "admin",
    TEACHER: "teacher",
    PARENT: "parent",
  },
  futureModules: [
    "Students",
    "Teachers",
    "Attendance",
    "Marks",
    "Fees",
    "Notifications",
    "Reports",
    "Academic Calendar",
    "Settings",
  ],
};

const app = document.getElementById("app");
const tokenKey = "pinnacle_erp_session";
const mockSessionKey = "pinnacle_erp_mock_sessions";
const routeRole = {
  admin: "Admin",
  teacher: "Teacher",
  parent: "Parent",
};
const roleDashboard = {
  Admin: "admin",
  Teacher: "teacher",
  Parent: "parent",
};
const icons = {
  Dashboard: "DB",
  Students: "ST",
  Teachers: "TE",
  "My Child": "CH",
  Attendance: "AT",
  Marks: "MK",
  Fees: "FE",
  Notifications: "!",
  Reports: "RP",
  "Academic Calendar": "AC",
  Settings: "SE",
};

let currentUser = null;
let currentRoute = "login";
let studentState = {
  filters: { search: "", grade: "", status: "" },
  students: [],
  permissions: { canAdd: false, canEdit: false, canDeactivate: false },
  grades: [],
  statuses: [],
};
let teacherState = {
  filters: { search: "", grade: "", status: "" },
  teachers: [],
  permissions: { canAdd: false, canEdit: false, canDeactivate: false },
  grades: [],
  statuses: [],
};
let settingsState = {
  settings: null,
  passwordAccount: null,
};
let attendanceState = {
  filters: { date: "", grade: "", academicYear: "", session: "Morning" },
  attendance: [],
  grades: [],
  settings: null,
  holiday: null,
  lock: null,
  completion: null,
  permissions: { canView: false, canMark: false },
};
let adminAttendanceOverview = null;
let mockAttendanceClosed = false;

const mockUsers = [
  {
    id: "MOCK-A001",
    name: "Mohammed Zaid",
    username: "admin",
    password: "admin123",
    role: "Admin",
  },
  {
    id: "MOCK-T001",
    name: "Priya Menon",
    username: "teacher",
    password: "teacher123",
    role: "Teacher",
  },
  {
    id: "MOCK-P001",
    name: "Mr Khan",
    phone: "9876543210",
    username: "parent",
    password: "parent123",
    role: "Parent",
  },
];

const mockStudents = [
  {
    StudentID: "PUP001",
    Name: "Aarav Sharma",
    Gender: "M",
    Grade: "3",
    ParentName: "Rajesh Sharma",
    ParentPhone: "9876543210",
    DOB: "2015-04-10",
    Address: "Yellareddypet",
    AdmissionDate: "2026-06-01",
    Username: "aarav01",
    Status: "Active",
  },
  {
    StudentID: "PUP002",
    Name: "Sana Fatima",
    Gender: "F",
    Grade: "4",
    ParentName: "Fatima",
    ParentPhone: "9876543211",
    DOB: "2016-02-18",
    Address: "Yellareddypet",
    AdmissionDate: "2026-06-01",
    Username: "sana02",
    Status: "Active",
  },
];

const mockTeachers = [
  {
    TeacherID: "T001",
    FullName: "Priya Menon",
    Subject: "Mathematics",
    Grade: "5",
    Phone: "9876500001",
    Username: "priya",
    Role: "Teacher",
    Status: "Active",
    JoiningDate: "2026-06-10",
  },
  {
    TeacherID: "T002",
    FullName: "Arjun Rao",
    Subject: "Science",
    Grade: "4",
    Phone: "9876500002",
    Username: "arjun_sci",
    Role: "Teacher",
    Status: "Active",
    JoiningDate: "2026-07-01",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  renderLoading();
  api
    .getRouteBootstrap(getToken(), getRoute())
    .then(handleBootstrap)
    .catch(handleServerError);
});

const appsScriptApi = {
  getRouteBootstrap(token, route) {
    return callAppsScript("bootstrap", { token, route });
  },

  login(username, password) {
    return callAppsScript("login", { username, password });
  },

  logout(token) {
    return callAppsScript("logout", { token });
  },

  listStudents(filters) {
    return callAppsScript("listStudents", { token: getToken(), filters });
  },

  saveStudent(student) {
    return callAppsScript("saveStudent", { token: getToken(), student });
  },

  deactivateStudent(studentId) {
    return callAppsScript("deactivateStudent", {
      token: getToken(),
      studentId,
    });
  },

  listAttendance(filters) {
    return callAppsScript("listAttendance", { token: getToken(), filters });
  },

  saveAttendance(attendance) {
    return callAppsScript("saveAttendance", { token: getToken(), attendance });
  },

  getAttendanceCompletion(filters) {
    return callAppsScript("getAttendanceCompletion", {
      token: getToken(),
      filters,
    });
  },

  closeAttendanceDay(attendance) {
    return callAppsScript("closeAttendanceDay", {
      token: getToken(),
      attendance,
    });
  },

  listTeachers(filters) {
    return callAppsScript("listTeachers", { token: getToken(), filters });
  },

  saveTeacher(teacher) {
    return callAppsScript("saveTeacher", { token: getToken(), teacher });
  },

  deactivateTeacher(teacherId) {
    return callAppsScript("deactivateTeacher", {
      token: getToken(),
      teacherId,
    });
  },

  getSettings() {
    return callAppsScript("getSettings", { token: getToken() });
  },

  saveSettings(settings) {
    return callAppsScript("saveSettings", { token: getToken(), settings });
  },

  addHoliday(holiday) {
    return callAppsScript("addHoliday", { token: getToken(), holiday });
  },

  removeHoliday(holidayId) {
    return callAppsScript("removeHoliday", { token: getToken(), holidayId });
  },

  lookupPasswordAccount(username) {
    return callAppsScript("lookupPasswordAccount", {
      token: getToken(),
      username,
    });
  },

  resetAccountPassword(request) {
    return callAppsScript("resetAccountPassword", {
      token: getToken(),
      request,
    });
  },
};

function callAppsScript(action, payload) {
  return fetch(SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({ action, ...payload }),
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
          ? {
              authenticated: true,
              user: session.user,
              redirect: roleDashboard[session.user.role],
            }
          : { authenticated: false, route: config.routes.LOGIN };
      }

      if (!session)
        return { authenticated: false, redirect: config.routes.LOGIN };

      const requiredRole = routeRole[cleanRoute];
      if (requiredRole !== session.user.role) {
        return {
          authenticated: true,
          accessDenied: true,
          user: session.user,
          route: cleanRoute,
          expectedRoute: roleDashboard[session.user.role],
        };
      }

      return {
        authenticated: true,
        accessDenied: false,
        user: session.user,
        route: cleanRoute,
      };
    });
  },

  login(username, password) {
    return delay(() => {
      const cleanUsername = String(username || "")
        .trim()
        .toLowerCase();
      const cleanPassword = String(password || "").trim();
      const user = mockUsers.find(
        (item) =>
          item.username.toLowerCase() === cleanUsername &&
          item.password === cleanPassword,
      );

      if (!user)
        return { success: false, message: "Invalid Username or Password" };

      const token = createMockToken();
      const publicUser = toPublicUser(user);
      saveMockSession(token, publicUser);
      return {
        success: true,
        token,
        user: publicUser,
        redirect: roleDashboard[publicUser.role],
      };
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
      if (!session) throw new Error("Authentication required");

      let students = [...mockStudents];
      const search = String(filters.search || "")
        .trim()
        .toLowerCase();
      const grade = String(filters.grade || "").trim();
      const status = String(filters.status || "").trim();

      if (session.user.role === "Parent") {
        students = students.filter(
          (student) => student.ParentPhone === session.user.phone,
        );
      }

      if (search) {
        students = students.filter((student) =>
          [
            student.StudentID,
            student.Name,
            student.ParentName,
            student.ParentPhone,
            student.Grade,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(search),
          ),
        );
      }
      if (grade)
        students = students.filter((student) => student.Grade === grade);
      if (status)
        students = students.filter((student) => student.Status === status);

      return {
        success: true,
        students,
        permissions: getStudentPermissions(session.user.role),
        grades: uniqueValues(mockStudents, "Grade"),
        statuses: uniqueValues(mockStudents, "Status"),
      };
    });
  },

  saveStudent(student) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || session.user.role !== "Admin")
        throw new Error("Access denied");

      if (student.StudentID) {
        const index = mockStudents.findIndex(
          (item) => item.StudentID === student.StudentID,
        );
        if (index !== -1)
          mockStudents[index] = { ...mockStudents[index], ...student };
      } else {
        mockStudents.push({
          ...student,
          StudentID: `PUP${String(mockStudents.length + 1).padStart(3, "0")}`,
          Status: student.Status || "Active",
        });
      }
      return { success: true };
    });
  },

  listAttendance(filters) {
    return delay(() => ({
      success: true,
      date: filters.date || new Date().toISOString().slice(0, 10),
      academicYear: "2026-27",
      settings: {
        CurrentAcademicYear: "2026-27",
        AcademicYearStartDate: "2026-06-01",
        AcademicYearEndDate: "2027-04-30",
        WorkingDays: "Mon,Tue,Wed,Thu,Fri,Sat",
        AttendancePercentageMode: "FinalizedSessions",
        MorningAttendanceStartTime: "08:30",
        MorningAttendanceEndTime: "10:00",
        AfternoonAttendanceStartTime: "13:30",
        AfternoonAttendanceEndTime: "15:00",
        AttendanceEditCutoffTime: "17:00",
        SpecialHolidays: [],
      },
      lock: mockAttendanceClosed
        ? {
            locked: getMockSession(getToken())?.user.role !== "Admin",
            closed: true,
            message:
              getMockSession(getToken())?.user.role === "Admin"
                ? "This attendance day is closed. Admin corrections require a reason."
                : "Attendance for this day has been closed by Admin.",
          }
        : null,
      holiday: null,
      attendance: mockStudents.map((student) => ({
        ...student,
        MorningStatus: "",
        AfternoonStatus: "",
        Status: "",
        Remarks: "",
        ParentMessage: "",
        RecordState: "Draft",
        AttendancePercentage: {
          presentSessions: 0,
          eligibleSessions: 0,
          percentage: null,
        },
      })),
      session: filters.session || "Morning",
      percentage: {
        presentSessions: 0,
        eligibleSessions: 0,
        percentage: null,
      },
      grades: uniqueValues(mockStudents, "Grade"),
      permissions: {
        canView: true,
        canMark: getMockSession(getToken())?.user.role !== "Parent",
      },
      completion:
        getMockSession(getToken())?.user.role === "Admin"
          ? getMockAttendanceCompletion(filters)
          : null,
    }));
  },

  saveAttendance(attendance) {
    return delay(() => ({ success: true, ...attendance }));
  },

  getAttendanceCompletion(filters) {
    return delay(() => ({
      success: true,
      completion: getMockAttendanceCompletion(filters),
    }));
  },

  closeAttendanceDay(attendance) {
    return delay(() => {
      const completion = getMockAttendanceCompletion(attendance);
      if (!completion.canClose) {
        return {
          success: false,
          message: "Attendance cannot be closed while records are incomplete.",
        };
      }
      mockAttendanceClosed = true;
      return {
        success: true,
        completion: {
          ...completion,
          closed: true,
          canClose: false,
          closedAt: new Date().toISOString(),
          closedBy: "admin",
          closureNote: attendance.note || "",
        },
      };
    });
  },

  deactivateStudent(studentId) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || session.user.role !== "Admin")
        throw new Error("Access denied");
      const student = mockStudents.find((item) => item.StudentID === studentId);
      if (student) student.Status = "Inactive";
      return { success: true };
    });
  },

  listTeachers(filters) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || session.user.role !== "Admin")
        throw new Error("Access denied");

      let teachers = [...mockTeachers];
      const search = String(filters.search || "")
        .trim()
        .toLowerCase();
      const grade = String(filters.grade || "").trim();
      const status = String(filters.status || "").trim();

      if (search) {
        teachers = teachers.filter((teacher) =>
          [
            teacher.TeacherID,
            teacher.FullName,
            teacher.Subject,
            teacher.Grade,
            teacher.Phone,
            teacher.Username,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(search),
          ),
        );
      }
      if (grade)
        teachers = teachers.filter((teacher) =>
          splitCsv(teacher.Grade).includes(grade),
        );
      if (status)
        teachers = teachers.filter((teacher) => teacher.Status === status);

      return {
        success: true,
        teachers,
        permissions: { canAdd: true, canEdit: true, canDeactivate: true },
        grades: uniqueGradeCsvValues(mockTeachers),
        statuses: uniqueValues(mockTeachers, "Status"),
      };
    });
  },

  saveTeacher(teacher) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || session.user.role !== "Admin")
        throw new Error("Access denied");

      if (teacher.TeacherID) {
        const index = mockTeachers.findIndex(
          (item) => item.TeacherID === teacher.TeacherID,
        );
        if (index !== -1)
          mockTeachers[index] = { ...mockTeachers[index], ...teacher };
      } else {
        mockTeachers.push({
          ...teacher,
          TeacherID: `T${String(mockTeachers.length + 1).padStart(3, "0")}`,
          Role: "Teacher",
          Status: teacher.Status || "Active",
        });
      }
      return { success: true };
    });
  },

  deactivateTeacher(teacherId) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || session.user.role !== "Admin")
        throw new Error("Access denied");
      const teacher = mockTeachers.find((item) => item.TeacherID === teacherId);
      if (teacher) teacher.Status = "Inactive";
      return { success: true };
    });
  },

  getSettings() {
    return delay(() => ({
      success: true,
      settings: {
        SchoolName: "Pinnacle Upper Primary School",
        CurrentAcademicYear: "2026-27",
        NextAcademicYear: "2027-28",
        AcademicYearStartDate: "2026-06-01",
        AcademicYearEndDate: "2027-04-30",
        WorkingDays: "Mon,Tue,Wed,Thu,Fri,Sat",
        AttendancePercentageMode: "FinalizedSessions",
        MorningAttendanceStartTime: "08:30",
        MorningAttendanceEndTime: "10:00",
        AfternoonAttendanceStartTime: "13:30",
        AfternoonAttendanceEndTime: "15:00",
        AttendanceEditCutoffTime: "17:00",
        SpecialHolidays: [],
      },
    }));
  },

  saveSettings(settings) {
    return delay(() => ({ success: true, settings }));
  },

  addHoliday(holiday) {
    return delay(() => ({
      success: true,
      holidays: [{ ...holiday, id: createMockToken() }],
    }));
  },

  removeHoliday() {
    return delay(() => ({ success: true, holidays: [] }));
  },

  lookupPasswordAccount(username) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || session.user.role !== "Admin")
        throw new Error("Access denied");

      const cleanUsername = String(username || "").trim().toLowerCase();
      const user = mockUsers.find(
        (item) => item.username.toLowerCase() === cleanUsername,
      );
      if (!user)
        return { success: false, message: "Account not found." };

      return {
        success: true,
        account: {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          status: "Active",
        },
      };
    });
  },

  resetAccountPassword(request) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || session.user.role !== "Admin")
        throw new Error("Access denied");

      const cleanUsername = String(request.username || "").trim().toLowerCase();
      const user = mockUsers.find(
        (item) => item.username.toLowerCase() === cleanUsername,
      );
      if (!user)
        return { success: false, message: "Account not found." };

      const temporaryPassword = request.generate ? "Pup@4821Safe" : "";
      user.password = temporaryPassword || request.newPassword;
      return {
        success: true,
        message: "Password updated.",
        temporaryPassword,
      };
    });
  },
};

const api = API_MODE === "apps-script" ? appsScriptApi : mockApi;

function delay(callback) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(callback()), 220);
  });
}

function getMockAttendanceCompletion(filters = {}) {
  const issues = [
    {
      StudentID: "PUP001",
      Name: "Aarav Sharma",
      Grade: "3",
      MorningStatus: "Present",
      AfternoonStatus: "",
      MissingSessions: "Afternoon",
      RecordState: "Draft",
    },
    {
      StudentID: "PUP002",
      Name: "Sana Fatima",
      Grade: "4",
      MorningStatus: "",
      AfternoonStatus: "",
      MissingSessions: "Morning and Afternoon",
      RecordState: "Unmarked",
    },
  ];
  return {
    date: filters.date || getTodayDate(),
    academicYear: filters.academicYear || "2026-27",
    expected: 2,
    morningMarked: 1,
    afternoonMarked: 0,
    finalized: 0,
    draft: 1,
    unmarked: 1,
    incomplete: 2,
    completionPercentage: 0,
    closed: mockAttendanceClosed,
    closedAt: mockAttendanceClosed ? new Date().toISOString() : "",
    closedBy: mockAttendanceClosed ? "admin" : "",
    closureNote: "",
    canClose: false,
    workingDay: true,
    holiday: null,
    issues,
    grades: [
      { grade: "3", expected: 1, finalized: 0, draft: 1, unmarked: 0 },
      { grade: "4", expected: 1, finalized: 0, draft: 0, unmarked: 1 },
    ],
  };
}

function getRoute() {
  const params = new URLSearchParams(window.location.search);
  return normalizeRoute(params.get("page"));
}

function getModule() {
  const params = new URLSearchParams(window.location.search);
  const moduleName = String(params.get("module") || "dashboard")
    .trim()
    .toLowerCase();
  return ["students", "attendance", "teachers", "settings"].includes(moduleName)
    ? moduleName
    : "dashboard";
}

function normalizeRoute(route) {
  const value = String(route || config.routes.LOGIN)
    .trim()
    .toLowerCase();
  return Object.prototype.hasOwnProperty.call(routeRole, value)
    ? value
    : config.routes.LOGIN;
}

function getToken() {
  return localStorage.getItem(tokenKey) || "";
}

function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

function clearToken() {
  localStorage.removeItem(tokenKey);
}

function routeTo(route) {
  const base = window.location.href.split("?")[0];
  window.location.href = route === "login" ? base : `${base}?page=${route}`;
}

function routeToModule(moduleName) {
  const base = window.location.href.split("?")[0];
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
          <a class="brand-mark brand-link" href="${config.mainWebsiteUrl}" aria-label="Open Pinnacle Upper Primary School website">
            <img class="brand-logo" src="https://pinnacleups.com/Images/schoollogo.jpeg" alt="Pinnacle Upper Primary School logo">
            <div class="brand-name">Pinnacle Upper Primary School <span>English Medium | CBSE</span></div>
          </a>
          <div class="brand-copy">
            <h1>Secure school portal</h1>
            <p>A simple and secure way for the Pinnacle community to stay connected with school records, learning updates, and daily progress.</p>
          </div>
        </div>
        <form class="login-card" id="loginForm">
          <div class="section-kicker">Pinnacle School Portal</div>
          <h2>Sign in</h2>
          <p>Welcome back. Please sign in to continue to your school dashboard.</p>
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

  document.getElementById("loginForm").addEventListener("submit", submitLogin);
  document.getElementById("username").focus();
}

function submitLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = document.getElementById("loginButton");
  const message = document.getElementById("loginMessage");
  button.disabled = true;
  button.textContent = "Checking...";
  message.textContent = "";

  api
    .login(form.username.value, form.password.value)
    .then((result) => {
      if (!result.success) {
        button.disabled = false;
        button.textContent = "Login";
        message.textContent = result.message || "Invalid Username or Password";
        return;
      }
      setToken(result.token);
      routeTo(result.redirect);
    })
    .catch((error) => {
      button.disabled = false;
      button.textContent = "Login";
      message.textContent = "Unable to login. Please try again.";
      console.error(error);
    });
}

function renderDashboard(user, route, moduleName = "dashboard") {
  app.innerHTML = `
    <div class="erp-layout">
      ${renderSidebar(route, user, moduleName)}
      <main class="main">
        <div class="topbar">
          <a class="mobile-brand top-brand brand-link" href="${config.mainWebsiteUrl}" aria-label="Open Pinnacle Upper Primary School website">
            <img class="brand-logo" src="https://pinnacleups.com/Images/schoollogo.jpeg" alt="">
            <div class="brand-name">${config.schoolName}<span>${config.appName}</span></div>
          </a>
          <button class="mobile-nav-toggle" id="mobileNavToggle" type="button" aria-expanded="false" aria-controls="mobileNavPanel">
            <span></span><span></span><span></span>
            <strong>Menu</strong>
          </button>
          <div class="user-chip">${escapeHtml(user.username)} | ${escapeHtml(user.role)}</div>
          <button class="ghost-btn" id="logoutButton" type="button">Logout</button>
        </div>
        ${renderMobileNav(route, user, moduleName)}
        <div class="mobile-nav-scrim" id="mobileNavScrim" aria-hidden="true"></div>
        <div id="moduleHost">${renderModule(moduleName, user)}</div>
      </main>
    </div>
  `;

  document.getElementById("logoutButton").addEventListener("click", logout);
  bindMobileNav();
  bindNavigation();
  if (moduleName === "students") loadStudents();
  if (moduleName === "attendance") loadAttendance();
  if (moduleName === "teachers") loadTeachers();
  if (moduleName === "settings") loadSettings();
  if (moduleName === "dashboard" && user.role === "Admin")
    loadAdminAttendanceOverview();
}

function renderMobileNav(route, user, moduleName) {
  const dashboardLabel = `${capitalize(route)} Dashboard`;
  const moduleItems = [
    { label: dashboardLabel, module: "dashboard", icon: icons.Dashboard },
    ...getRoleModules(user.role).map((item) => ({
      label: item,
      module:
        item === "My Child"
          ? "students"
          : item.toLowerCase().replace(/\s+/g, ""),
      icon: icons[item] || icons.Students,
    })),
  ];

  return `
    <div class="mobile-nav-panel" id="mobileNavPanel" aria-hidden="true">
      <div class="mobile-nav-grid">
        ${moduleItems
          .map((item) => {
            const activeModules = [
              "dashboard",
              "students",
              "attendance",
              "teachers",
              "settings",
            ];
            const isEnabled = activeModules.includes(item.module);
            return isEnabled
              ? `<button class="mobile-nav-item ${moduleName === item.module ? "active" : ""}" type="button" data-module="${item.module}"><span>${escapeHtml(item.icon)}</span>${escapeHtml(item.label)}</button>`
              : `<div class="mobile-nav-item disabled"><span>${escapeHtml(item.icon)}</span>${escapeHtml(item.label)}</div>`;
          })
          .join("")}
      </div>
      <div class="mobile-nav-account">
        <div>
          <span>Signed in</span>
          <strong>${escapeHtml(user.name || user.username)}</strong>
        </div>
        <button class="ghost-btn mobile-menu-logout" id="mobileMenuLogoutButton" type="button">Logout</button>
      </div>
    </div>
  `;
}

function bindMobileNav() {
  const toggle = document.getElementById("mobileNavToggle");
  const panel = document.getElementById("mobileNavPanel");
  const scrim = document.getElementById("mobileNavScrim");
  if (!toggle || !panel) return;

  const setMobileNavOpen = (isOpen) => {
    panel.classList.toggle("open", isOpen);
    toggle.classList.toggle("open", isOpen);
    if (scrim) scrim.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    panel.setAttribute("aria-hidden", String(!isOpen));
  };

  toggle.addEventListener("click", () => {
    setMobileNavOpen(!panel.classList.contains("open"));
  });

  if (scrim) scrim.addEventListener("click", () => setMobileNavOpen(false));

  const mobileLogout = document.getElementById("mobileMenuLogoutButton");
  if (mobileLogout) mobileLogout.addEventListener("click", logout);
}

function renderModule(moduleName, user) {
  if (moduleName === "students") return renderStudentsShell(user);
  if (moduleName === "attendance") return renderAttendanceShell(user);
  if (moduleName === "teachers" && user.role === "Admin")
    return renderTeachersShell();
  if (moduleName === "settings" && user.role === "Admin")
    return renderSettingsShell();
  return renderDashboardHome(user);
}

function renderDashboardHome(user) {
  return `
    <section class="dashboard-hero">
      <div class="section-kicker">Pinnacle School Portal</div>
      <h1>Welcome, ${escapeHtml(user.name || user.username)}</h1>
      <p>A calm space for school updates, student progress, and everyday communication from Pinnacle Upper Primary School.</p>
    </section>
    ${
      user.role === "Admin"
        ? `
      <section class="admin-attendance-overview" id="adminAttendanceOverview">
        <div class="user-chip">Checking today's attendance...</div>
      </section>
    `
        : ""
    }
    <section class="info-grid">
      <article class="info-card portal-card">
        <span>Admissions Open</span>
        <strong>New academic year admissions have started</strong>
        <p>Parents may contact the school office for admission guidance, required documents, and class availability.</p>
      </article>
      <article class="info-card portal-card">
        <span>School Reopening</span>
        <strong>Classes begin from July 15</strong>
        <p>Students are requested to arrive on time in neat uniform with books, diary, and a refreshed learning spirit.</p>
      </article>
      <article class="info-card portal-card">
        <span>Parent Connect</span>
        <strong>Stay updated with school notices</strong>
        <p>Important announcements, academic updates, and student information will be shared here as the portal grows.</p>
      </article>
    </section>
    <section class="notice-card">
      <span>Campus Note</span>
      <p>Pinnacle Upper Primary School is preparing a smooth, organized start to the academic year with renewed focus on discipline, creativity, sports, and joyful learning.</p>
    </section>
  `;
}

function loadAdminAttendanceOverview() {
  const host = document.getElementById("adminAttendanceOverview");
  if (!host) return;

  api
    .getAttendanceCompletion({ date: getTodayDate() })
    .then((result) => {
      if (!result.success) {
        host.innerHTML = `<div class="message">${escapeHtml(result.message || "Unable to load attendance status")}</div>`;
        return;
      }
      adminAttendanceOverview = result.completion;
      renderAdminAttendanceOverview();
    })
    .catch((error) => {
      console.error(error);
      host.innerHTML =
        '<div class="message">Unable to load today\'s attendance status.</div>';
    });
}

function renderAdminAttendanceOverview() {
  const host = document.getElementById("adminAttendanceOverview");
  const completion = adminAttendanceOverview;
  if (!host || !completion) return;

  const statusLabel = completion.closed
    ? "Day Closed"
    : !completion.workingDay
      ? "Non-working Day"
    : completion.incomplete === 0 && completion.expected > 0
      ? "Ready to Close"
      : `${completion.incomplete} Incomplete`;
  const statusClass = completion.closed
    ? "active"
    : !completion.workingDay
      ? "halfday"
    : completion.incomplete > 0
      ? "inactive"
      : "halfday";
  const issuePreview = (completion.issues || [])
    .slice(0, 4)
    .map(
      (issue) => `
        <li>
          <strong>${escapeHtml(issue.Name)}</strong>
          <span>Class ${escapeHtml(issue.Grade)} - ${escapeHtml(issue.MissingSessions)} missing</span>
        </li>
      `,
    )
    .join("");

  host.innerHTML = `
    <section class="attendance-control-card">
      <div class="attendance-control-head">
        <div>
          <div class="section-kicker">Today's Attendance</div>
          <h2>Daily completion</h2>
          <p>${escapeHtml(completion.date)} | ${escapeHtml(completion.academicYear)}</p>
        </div>
        <span class="status-pill ${statusClass}">${escapeHtml(statusLabel)}</span>
      </div>
      <div class="completion-metrics compact">
        ${renderCompletionMetric("Expected", completion.expected)}
        ${renderCompletionMetric("Finalized", completion.finalized)}
        ${renderCompletionMetric("Draft", completion.draft)}
        ${renderCompletionMetric("Unmarked", completion.unmarked)}
      </div>
      ${
        !completion.workingDay
          ? '<p class="completion-success">No attendance closure is required for this non-working day.</p>'
          : issuePreview
          ? `<ul class="attendance-issue-preview">${issuePreview}</ul>`
          : '<p class="completion-success">All active student records are complete for today.</p>'
      }
      <button class="primary-btn compact" id="openAttendanceCompletionButton" type="button">Review Attendance</button>
    </section>
  `;

  document
    .getElementById("openAttendanceCompletionButton")
    .addEventListener("click", () => routeToModule("attendance"));
}

function renderCompletionMetric(label, value) {
  return `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </article>
  `;
}

function renderSidebar(route, user, moduleName) {
  const dashboardLabel = `${capitalize(route)} Dashboard`;
  const visibleModules = getRoleModules(user.role);
  const futureLinks = visibleModules
    .map((item) => {
      const moduleKey =
        item === "My Child"
          ? "students"
          : item.toLowerCase().replace(/\s+/g, "");
      const isActiveModule = [
        "students",
        "attendance",
        "teachers",
        "settings",
      ].includes(moduleKey);
      if (isActiveModule) {
        return `
        <button class="nav-item nav-action ${moduleName === moduleKey ? "active" : ""}" type="button" data-module="${moduleKey}">
          <span class="nav-icon">${icons[item] || icons.Students}</span>
          <span>${escapeHtml(item)}</span>
        </button>
      `;
      }

      return `
      <div class="nav-item disabled" title="Coming in a future phase">
        <span class="nav-icon">${icons[item] || "--"}</span>
        <span>${escapeHtml(item)}</span>
      </div>
    `;
    })
    .join("");

  return `
    <aside class="sidebar">
      <a class="top-brand brand-link" href="${config.mainWebsiteUrl}" aria-label="Open Pinnacle Upper Primary School website">
        <img class="brand-logo" src="https://pinnacleups.com/Images/schoollogo.jpeg" alt="Pinnacle Upper Primary School logo">
        <div class="brand-name">${config.schoolName}<span>${config.appName}</span></div>
      </a>
      <nav class="nav-list" aria-label="ERP navigation">
        <button class="nav-item nav-action ${moduleName === "dashboard" ? "active" : ""}" type="button" data-module="dashboard">
          <span class="nav-icon">${icons.Dashboard}</span>
          <span>${escapeHtml(dashboardLabel)}</span>
        </button>
        ${futureLinks}
      </nav>
      <div class="sidebar-foot">Pinnacle Upper Primary School · School Portal</div>
    </aside>
  `;
}

function getRoleModules(role) {
  if (role === "Admin") {
    return [
      "Students",
      "Teachers",
      "Attendance",
      "Marks",
      "Fees",
      "Notifications",
      "Reports",
      "Academic Calendar",
      "Settings",
    ];
  }
  if (role === "Teacher") {
    return [
      "Students",
      "Attendance",
      "Marks",
      "Notifications",
      "Reports",
      "Academic Calendar",
    ];
  }
  if (role === "Parent") {
    return [
      "My Child",
      "Attendance",
      "Marks",
      "Fees",
      "Notifications",
      "Academic Calendar",
    ];
  }
  return [];
}

function bindNavigation() {
  document.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = document.getElementById("mobileNavPanel");
      const toggle = document.getElementById("mobileNavToggle");
      if (panel && toggle) {
        panel.classList.remove("open");
        toggle.classList.remove("open");
        const scrim = document.getElementById("mobileNavScrim");
        if (scrim) scrim.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        panel.setAttribute("aria-hidden", "true");
      }
      routeToModule(button.dataset.module);
    });
  });
}

function renderStudentsShell(user = currentUser) {
  const isParent = user && user.role === "Parent";
  const title = user && user.role === "Parent" ? "My Child" : "Students";
  const description =
    user && user.role === "Parent"
      ? "A simple view of your child record and school details."
      : "Search, filter, and manage student records using the existing Students sheet.";
  return `
    <section class="module-header">
      <div>
        <div class="section-kicker">${isParent ? "Parent Portal" : "Student Management"}</div>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
      </div>
      <button class="primary-btn compact hidden" id="addStudentButton" type="button">Add Student</button>
    </section>
    ${
      isParent
        ? ""
        : `
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
    `
    }
    <section class="${isParent ? "child-profile-wrap" : "table-card"}" id="studentsHost">
      <div class="user-chip">Loading students...</div>
    </section>
  `;
}

function loadStudents() {
  const host = document.getElementById("studentsHost");
  if (host) host.innerHTML = '<div class="user-chip">Loading students...</div>';

  const filters =
    currentUser && currentUser.role === "Parent"
      ? { search: "", grade: "", status: "" }
      : studentState.filters;

  api
    .listStudents(filters)
    .then((result) => {
      if (!result.success) {
        renderStudentError(result.message || "Unable to load students");
        return;
      }

      studentState = {
        ...studentState,
        students: result.students || [],
        permissions: result.permissions || studentState.permissions,
        grades: result.grades || [],
        statuses: result.statuses || [],
      };
      renderStudents();
    })
    .catch((error) => {
      console.error(error);
      renderStudentError("Unable to load students");
    });
}

function renderStudents() {
  if (currentUser && currentUser.role === "Parent") {
    renderParentChildCards();
    return;
  }

  const addButton = document.getElementById("addStudentButton");
  if (addButton && studentState.permissions.canAdd) {
    addButton.classList.remove("hidden");
    addButton.addEventListener("click", () => openStudentForm());
  }

  populateFilter(
    "gradeFilter",
    "All Classes",
    studentState.grades,
    studentState.filters.grade,
  );
  populateFilter(
    "statusFilter",
    "All Statuses",
    studentState.statuses,
    studentState.filters.status,
  );

  const search = document.getElementById("studentSearch");
  search.value = studentState.filters.search;
  search.addEventListener(
    "input",
    debounce(() => {
      studentState.filters.search = search.value;
      loadStudents();
    }, 280),
  );

  document.getElementById("gradeFilter").addEventListener("change", (event) => {
    studentState.filters.grade = event.target.value;
    loadStudents();
  });
  document
    .getElementById("statusFilter")
    .addEventListener("change", (event) => {
      studentState.filters.status = event.target.value;
      loadStudents();
    });

  const rows = studentState.students
    .map((student) => renderStudentRow(student))
    .join("");
  document.getElementById("studentsHost").innerHTML = `
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

function renderParentChildCards() {
  const host = document.getElementById("studentsHost");
  if (!host) return;

  if (!studentState.students.length) {
    host.innerHTML = `
      <div class="notice-card">
        <span>My Child</span>
        <p>No child record is linked to this parent account yet. Please contact the school office.</p>
      </div>
    `;
    return;
  }

  host.innerHTML = `
    <div class="child-profile-grid">
      ${studentState.students
        .map(
          (student) => `
        <article class="child-profile-card">
          <div class="child-profile-top">
            ${renderStudentAvatar(student, "child-avatar")}
            <div class="child-preview-copy">
              <span class="section-kicker">Student Record</span>
              <button class="student-name-button large" type="button" data-view-student="${escapeHtml(student.StudentID)}">${escapeHtml(student.Name || "Student")}</button>
              <p>Class ${escapeHtml(student.Grade || "Not set")}</p>
            </div>
          </div>
          <button class="text-btn child-view-btn" type="button" data-view-student="${escapeHtml(student.StudentID)}">View profile</button>
        </article>
      `,
        )
        .join("")}
    </div>
  `;
  bindStudentActions();
}

function renderChildDetail(label, value, isStatus = false) {
  const cleanValue = value || "Not set";
  return `
    <div class="child-detail">
      <span>${escapeHtml(label)}</span>
      ${
        isStatus
          ? `<strong><span class="status-pill ${cleanValue === "Active" ? "active" : "inactive"}">${escapeHtml(cleanValue)}</span></strong>`
          : `<strong>${escapeHtml(cleanValue)}</strong>`
      }
    </div>
  `;
}

function getInitials(name) {
  return (
    String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "ST"
  );
}

function renderStudentRow(student) {
  const canEdit = studentState.permissions.canEdit;
  const canDeactivate =
    studentState.permissions.canDeactivate && student.Status !== "Inactive";

  return `
    <tr>
      <td>${escapeHtml(student.StudentID)}</td>
      <td>
        <button class="student-name-button" type="button" data-view-student="${escapeHtml(student.StudentID)}">${escapeHtml(student.Name)}</button>
        <small>${escapeHtml(student.Gender || "Not set")} | DOB ${escapeHtml(student.DOB || "Not set")}</small>
      </td>
      <td>${escapeHtml(student.Grade)}</td>
      <td>${escapeHtml(student.ParentName)}</td>
      <td>${escapeHtml(student.ParentPhone)}</td>
      <td><span class="status-pill ${student.Status === "Active" ? "active" : "inactive"}">${escapeHtml(student.Status || "Not set")}</span></td>
      <td class="actions">
        ${canEdit ? `<button type="button" class="text-btn" data-edit="${escapeHtml(student.StudentID)}">Edit</button>` : '<span class="muted-text">View only</span>'}
        ${canDeactivate ? `<button type="button" class="text-btn danger" data-deactivate="${escapeHtml(student.StudentID)}">Deactivate</button>` : ""}
      </td>
    </tr>
  `;
}

function bindStudentActions() {
  document
    .querySelectorAll(
      ".student-name-button[data-view-student], .child-view-btn[data-view-student]",
    )
    .forEach((button) => {
      button.addEventListener("click", () => {
        const student = studentState.students.find(
          (item) => item.StudentID === button.dataset.viewStudent,
        );
        if (student) openStudentDetails(student);
      });
    });

  document.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const student = studentState.students.find(
        (item) => item.StudentID === button.dataset.edit,
      );
      openStudentForm(student);
    });
  });

  document.querySelectorAll("[data-deactivate]").forEach((button) => {
    button.addEventListener("click", () =>
      deactivateStudent(button.dataset.deactivate),
    );
  });
}

function openStudentDetails(student) {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <section class="student-detail-modal" role="dialog" aria-modal="true" aria-labelledby="studentDetailTitle">
      <div class="student-detail-hero">
        ${renderStudentAvatar(student, "student-detail-photo")}
        <div>
          <span class="section-kicker">Student Profile</span>
          <h2 id="studentDetailTitle">${escapeHtml(student.Name || "Student")}</h2>
          <p>Class ${escapeHtml(student.Grade || "Not set")} | ${escapeHtml(student.StudentID || "No ID")}</p>
        </div>
        <button type="button" class="icon-btn detail-close" id="closeStudentDetails">X</button>
      </div>
      <div class="child-detail-grid">
        ${renderChildDetail("Student ID", student.StudentID)}
        ${renderChildDetail("Status", student.Status || "Not set", true)}
        ${renderChildDetail("Class", student.Grade)}
        ${renderChildDetail("Gender", student.Gender)}
        ${renderChildDetail("Date of Birth", student.DOB)}
        ${renderChildDetail("Admission Date", student.AdmissionDate)}
        ${renderChildDetail("Parent Name", student.ParentName)}
        ${renderChildDetail("Parent Phone", student.ParentPhone)}
        ${renderChildDetail("Address", student.Address)}
      </div>
    </section>
  `;

  document.body.appendChild(modal);
  document
    .getElementById("closeStudentDetails")
    .addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.remove();
  });
}

function renderStudentAvatar(student, className) {
  const photoUrl = getStudentPhotoUrl(student);
  if (photoUrl) {
    return `<div class="${className} has-photo"><img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(student.Name || "Student")} photo"></div>`;
  }
  return `<div class="${className}">${escapeHtml(getInitials(student.Name || "Student"))}</div>`;
}

function getStudentPhotoUrl(student) {
  const value = String(
    student.PhotoURL || student.PhotoUrl || student.Photo || "",
  ).trim();
  if (!value) return "";
  if (/^(https?:\/\/|\/)/i.test(value)) return value;
  return "";
}

function openStudentForm(student = {}) {
  const isEdit = Boolean(student.StudentID);
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <form class="student-form" id="studentForm" action="javascript:void(0)" novalidate>
      <div class="form-head">
        <div>
          <div class="section-kicker">${isEdit ? "Edit Student" : "Add Student"}</div>
          <h2>${isEdit ? escapeHtml(student.Name) : "New Student"}</h2>
        </div>
        <button type="button" class="icon-btn" id="closeStudentForm">X</button>
      </div>
      <input type="hidden" name="StudentID" value="${escapeHtml(student.StudentID || "")}">
      ${renderStudentField("Name", "Name", student.Name, true)}
      <div class="form-grid">
        ${renderStudentField("Gender", "Gender", student.Gender)}
        ${renderStudentField("Grade", "Class", student.Grade, true)}
      </div>
      <div class="form-grid">
        ${renderStudentField("ParentName", "Parent Name", student.ParentName, true)}
        ${renderStudentField("ParentPhone", "Parent Phone", student.ParentPhone, true)}
      </div>
      <div class="form-grid">
        ${renderStudentField("DOB", "Date of Birth", student.DOB, false, "date")}
        ${renderStudentField("AdmissionDate", "Admission Date", student.AdmissionDate, false, "date")}
      </div>
      ${renderStudentField("Address", "Address", student.Address)}
      <div class="form-grid">
        ${renderStudentField("Username", "Student Username", student.Username)}
        ${renderStudentField("Password", "Student Password", "", false, "password")}
      </div>
      <div class="field">
        <label for="studentStatus">Status</label>
        <select id="studentStatus" name="Status">
          <option value="Active" ${student.Status !== "Inactive" ? "selected" : ""}>Active</option>
          <option value="Inactive" ${student.Status === "Inactive" ? "selected" : ""}>Inactive</option>
        </select>
      </div>
      <button class="primary-btn" id="saveStudentButton" type="button">${isEdit ? "Save Changes" : "Add Student"}</button>
      <div class="message" id="studentFormMessage"></div>
    </form>
  `;

  document.body.appendChild(modal);
  document
    .getElementById("closeStudentForm")
    .addEventListener("click", () => modal.remove());
  document
    .getElementById("studentForm")
    .addEventListener("submit", (event) => event.preventDefault());
  document
    .getElementById("saveStudentButton")
    .addEventListener("click", () => submitStudentForm(modal));
}

function renderStudentField(
  name,
  label,
  value = "",
  required = false,
  type = "text",
) {
  return `
    <div class="field">
      <label for="student${name}">${label}</label>
      <input id="student${name}" name="${name}" type="${type}" value="${escapeHtml(value || "")}" ${required ? "required" : ""}>
    </div>
  `;
}

function submitStudentForm(modal) {
  const form = document.getElementById("studentForm");
  const saveButton = document.getElementById("saveStudentButton");
  const message = document.getElementById("studentFormMessage");
  const data = Object.fromEntries(new FormData(form).entries());

  if (!form.reportValidity()) return;

  message.textContent = "";
  saveButton.disabled = true;
  saveButton.textContent = "Saving...";

  api
    .saveStudent(data)
    .then((result) => {
      if (!result.success) {
        message.textContent = result.message || "Unable to save student";
        saveButton.disabled = false;
        saveButton.textContent = data.StudentID
          ? "Save Changes"
          : "Add Student";
        return;
      }
      modal.remove();
      keepModuleInUrl("students");
      loadStudents();
    })
    .catch((error) => {
      console.error(error);
      message.textContent = "Unable to save student";
      saveButton.disabled = false;
      saveButton.textContent = data.StudentID ? "Save Changes" : "Add Student";
    });
}

function keepModuleInUrl(moduleName) {
  const base = window.location.href.split("?")[0];
  const desiredUrl = `${base}?page=${currentRoute}&module=${moduleName}`;
  if (window.location.href !== desiredUrl) {
    window.history.replaceState(null, "", desiredUrl);
  }
}

function deactivateStudent(studentId) {
  api
    .deactivateStudent(studentId)
    .then((result) => {
      if (!result.success) {
        renderStudentError(result.message || "Unable to deactivate student");
        return;
      }
      loadStudents();
    })
    .catch((error) => {
      console.error(error);
      renderStudentError("Unable to deactivate student");
    });
}

function renderStudentError(message) {
  const host = document.getElementById("studentsHost");
  if (host)
    host.innerHTML = `<div class="message">${escapeHtml(message)}</div>`;
}

function populateFilter(id, label, values, selectedValue) {
  const select = document.getElementById(id);
  select.innerHTML =
    `<option value="">${label}</option>` +
    values
      .map(
        (value) =>
          `<option value="${escapeHtml(value)}" ${value === selectedValue ? "selected" : ""}>${escapeHtml(value)}</option>`,
      )
      .join("");
}

function renderAttendanceShell(user = currentUser) {
  const isParent = user && user.role === "Parent";
  const today = getTodayDate();
  return `
    <section class="module-header">
      <div>
        <div class="section-kicker">Attendance</div>
        <h1>${isParent ? "My Child Attendance" : "Daily Attendance"}</h1>
        <p>Morning and afternoon attendance are tracked separately so half-day and full-day records are clear for school and parents.</p>
      </div>
    </section>
    <section class="toolbar attendance-toolbar">
      <div class="field">
        <label for="attendanceDate">Date</label>
        <input id="attendanceDate" type="date" max="${today}">
      </div>
      ${
        isParent
          ? ""
          : `
        <div class="field">
          <label for="attendanceGradeFilter">Class</label>
          <select id="attendanceGradeFilter"></select>
        </div>
        <div class="field">
          <label for="attendanceSessionFilter">Session</label>
          <select id="attendanceSessionFilter">
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
          </select>
        </div>
      `
      }
      <button class="primary-btn compact" id="loadAttendanceButton" type="button">Load</button>
    </section>
    ${
      user && user.role === "Admin"
        ? `
      <section class="attendance-completion-host" id="attendanceCompletionHost">
        <div class="user-chip">Loading completion status...</div>
      </section>
    `
        : ""
    }
    <section class="attendance-session-card" id="attendanceSessionCard">
      <div class="user-chip">Loading attendance...</div>
    </section>
    <section class="table-card" id="attendanceHost">
      <div class="user-chip">Loading attendance...</div>
    </section>
  `;
}

function loadAttendance() {
  const host = document.getElementById("attendanceHost");
  if (host)
    host.innerHTML = '<div class="user-chip">Loading attendance...</div>';

  const today = getTodayDate();
  if (!attendanceState.filters.date) attendanceState.filters.date = today;
  if (attendanceState.filters.date > today)
    attendanceState.filters.date = today;

  api
    .listAttendance(attendanceState.filters)
    .then((result) => {
      if (!result.success) {
        renderAttendanceError(result.message || "Unable to load attendance");
        return;
      }

      attendanceState = {
        ...attendanceState,
        attendance: result.attendance || [],
        grades: result.grades || [],
        settings: result.settings || {},
        holiday: result.holiday || null,
        lock: result.lock || null,
        completion: result.completion || null,
        permissions: result.permissions || attendanceState.permissions,
        percentage: result.percentage || null,
        filters: {
          ...attendanceState.filters,
          date: result.date || attendanceState.filters.date,
          academicYear:
            result.academicYear || attendanceState.filters.academicYear,
          session: result.session || attendanceState.filters.session,
        },
      };
      renderAttendanceData();
    })
    .catch((error) => {
      console.error(error);
      renderAttendanceError("Unable to load attendance");
    });
}

function renderAttendanceData() {
  const dateInput = document.getElementById("attendanceDate");
  if (dateInput) {
    dateInput.max = getTodayDate();
    dateInput.value = attendanceState.filters.date;
  }

  const gradeFilter = document.getElementById("attendanceGradeFilter");
  if (gradeFilter) {
    populateFilter(
      "attendanceGradeFilter",
      "All Classes",
      attendanceState.grades,
      attendanceState.filters.grade,
    );
    gradeFilter.onchange = (event) => {
      attendanceState.filters.grade = event.target.value;
      loadAttendance();
    };
  }

  const sessionFilter = document.getElementById("attendanceSessionFilter");
  if (sessionFilter) {
    sessionFilter.value = attendanceState.filters.session || "Morning";
    sessionFilter.onchange = (event) => {
      attendanceState.filters.session = event.target.value;
      loadAttendance();
    };
  }

  document.getElementById("loadAttendanceButton").onclick = () => {
    const selectedDate = document.getElementById("attendanceDate").value;
    attendanceState.filters.date =
      selectedDate > getTodayDate() ? getTodayDate() : selectedDate;
    loadAttendance();
  };

  renderAttendanceSessionCard();
  if (currentUser && currentUser.role === "Admin")
    renderAttendanceCompletionDashboard();

  const canMark =
    attendanceState.permissions.canMark && !attendanceState.holiday;
  const rows = attendanceState.attendance
    .map((record) => renderAttendanceRow(record, canMark))
    .join("");
  document.getElementById("attendanceHost").innerHTML = `
    <form id="attendanceForm" action="javascript:void(0)">
      <div class="table-scroll">
        <table class="attendance-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Morning</th>
              <th>Afternoon</th>
              <th>Day Status</th>
              <th>Attendance</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="7">No students found for attendance.</td></tr>'}</tbody>
        </table>
      </div>
      ${
        canMark
          ? `
        <div class="attendance-save-panel">
          ${
            currentUser && currentUser.role === "Admin"
              ? `
            <div class="field">
              <label for="attendanceCorrectionReason">Correction note</label>
              <input id="attendanceCorrectionReason" placeholder="Required when correcting an existing record">
            </div>
          `
              : ""
          }
          <button class="primary-btn compact attendance-save" id="saveAttendanceButton" type="submit">Save ${escapeHtml(attendanceState.filters.session)} Attendance</button>
        </div>
      `
          : ""
      }
      <div class="message" id="attendanceMessage"></div>
    </form>
  `;

  if (canMark) {
    document
      .getElementById("attendanceForm")
      .addEventListener("submit", submitAttendanceForm);
  }

  document
    .querySelectorAll("[data-view-attendance-student]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const record = attendanceState.attendance.find(
          (item) => item.StudentID === button.dataset.viewAttendanceStudent,
        );
        if (record) {
          openStudentDetails({
            ...record,
            Status: record.StudentStatus || "Active",
          });
        }
      });
    });
}

function renderAttendanceCompletionDashboard() {
  const host = document.getElementById("attendanceCompletionHost");
  const completion = attendanceState.completion;
  if (!host) return;
  if (!completion) {
    host.innerHTML =
      '<div class="message">Unable to load attendance completion status.</div>';
    return;
  }

  const grades = (completion.grades || [])
    .map(
      (item) => `
        <tr>
          <td><strong>${escapeHtml(item.grade)}</strong></td>
          <td>${escapeHtml(item.expected)}</td>
          <td>${escapeHtml(item.finalized)}</td>
          <td>${escapeHtml(item.draft)}</td>
          <td>${escapeHtml(item.unmarked)}</td>
        </tr>
      `,
    )
    .join("");
  const issues = (completion.issues || [])
    .map(
      (issue) => `
        <tr>
          <td>
            <strong>${escapeHtml(issue.Name)}</strong>
            <small>${escapeHtml(issue.StudentID)}</small>
          </td>
          <td>${escapeHtml(issue.Grade)}</td>
          <td>${escapeHtml(issue.MorningStatus || "Not marked")}</td>
          <td>${escapeHtml(issue.AfternoonStatus || "Not marked")}</td>
          <td><span class="status-pill ${issue.RecordState === "Draft" ? "halfday" : "inactive"}">${escapeHtml(issue.RecordState)}</span></td>
          <td>${escapeHtml(issue.MissingSessions)}</td>
        </tr>
      `,
    )
    .join("");
  const stateText = completion.closed
    ? `Closed by ${completion.closedBy || "Admin"}${completion.closedAt ? ` on ${formatDateTime(completion.closedAt)}` : ""}`
    : completion.canClose
      ? "Every active student has a finalized record. This day can now be closed."
      : completion.holiday
        ? `Holiday: ${completion.holiday.remark}`
        : !completion.workingDay
          ? "This is a non-working day. Attendance closure is not required."
        : `${completion.incomplete} student record(s) still require attention.`;

  host.innerHTML = `
    <section class="attendance-completion-panel ${completion.closed ? "closed" : ""}">
      <div class="attendance-control-head">
        <div>
          <div class="section-kicker">Attendance Completion</div>
          <h2>${completion.closed ? "Day closed" : `${completion.completionPercentage}% complete`}</h2>
          <p>${escapeHtml(stateText)}</p>
        </div>
        <span class="status-pill ${completion.closed ? "active" : completion.incomplete ? "inactive" : "halfday"}">
          ${completion.closed ? "Closed" : completion.incomplete ? "Action Required" : "Ready to Close"}
        </span>
      </div>

      <div class="completion-metrics">
        ${renderCompletionMetric("Expected", completion.expected)}
        ${renderCompletionMetric("Morning Marked", completion.morningMarked)}
        ${renderCompletionMetric("Afternoon Marked", completion.afternoonMarked)}
        ${renderCompletionMetric("Finalized", completion.finalized)}
        ${renderCompletionMetric("Draft", completion.draft)}
        ${renderCompletionMetric("Unmarked", completion.unmarked)}
      </div>

      <div class="completion-columns">
        <section>
          <h3>Class completion</h3>
          <div class="table-scroll">
            <table class="completion-table">
              <thead>
                <tr><th>Class</th><th>Expected</th><th>Finalized</th><th>Draft</th><th>Unmarked</th></tr>
              </thead>
              <tbody>${grades || '<tr><td colspan="5">No active students found.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
        <section>
          <h3>Incomplete records</h3>
          <div class="table-scroll">
            <table class="completion-table">
              <thead>
                <tr><th>Student</th><th>Class</th><th>Morning</th><th>Afternoon</th><th>State</th><th>Missing</th></tr>
              </thead>
              <tbody>${issues || '<tr><td colspan="6">All attendance records are complete.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </div>

      ${
        completion.closed
          ? `
        <div class="closure-summary">
          <strong>Attendance is locked for teachers.</strong>
          <span>${escapeHtml(completion.closureNote || "No closure note was added.")}</span>
        </div>
      `
          : `
        <form class="attendance-close-form" id="attendanceCloseForm">
          <div class="field">
            <label for="attendanceClosureNote">Closure note</label>
            <input id="attendanceClosureNote" placeholder="Optional daily note, for example: All classes verified">
          </div>
          <button class="primary-btn compact" id="closeAttendanceDayButton" type="submit" ${completion.canClose ? "" : "disabled"}>Close Attendance Day</button>
          <div class="message" id="attendanceClosureMessage"></div>
        </form>
      `
      }
    </section>
  `;

  const closeForm = document.getElementById("attendanceCloseForm");
  if (closeForm) closeForm.addEventListener("submit", submitAttendanceDayClosure);
}

function submitAttendanceDayClosure(event) {
  event.preventDefault();
  const button = document.getElementById("closeAttendanceDayButton");
  const message = document.getElementById("attendanceClosureMessage");
  const note = document.getElementById("attendanceClosureNote").value;
  if (!attendanceState.completion || !attendanceState.completion.canClose) {
    message.textContent =
      "Complete all Morning and Afternoon attendance records before closing the day.";
    return;
  }

  button.disabled = true;
  button.textContent = "Closing...";
  message.textContent = "";

  api
    .closeAttendanceDay({
      date: attendanceState.filters.date,
      academicYear: attendanceState.filters.academicYear,
      note,
    })
    .then((result) => {
      if (!result.success) {
        button.disabled = false;
        button.textContent = "Close Attendance Day";
        message.textContent = result.message || "Unable to close attendance day";
        return;
      }
      attendanceState.completion = result.completion;
      loadAttendance();
    })
    .catch((error) => {
      console.error(error);
      button.disabled = false;
      button.textContent = "Close Attendance Day";
      message.textContent = "Unable to close attendance day";
    });
}

function renderAttendanceSessionCard() {
  const host = document.getElementById("attendanceSessionCard");
  const settings = attendanceState.settings || {};
  const holiday = attendanceState.holiday;
  const lock = attendanceState.lock;
  const isParent = currentUser && currentUser.role === "Parent";
  const percentage = attendanceState.percentage || {};
  const statusCards = [];

  if (holiday) {
    statusCards.push(`
      <article class="holiday-alert">
        <span>Holiday</span>
        <strong>${escapeHtml(holiday.remark)}</strong>
      </article>
    `);
  }

  if (!isParent) {
    const sessionMessage =
      lock && (lock.locked || lock.closed)
        ? lock.message
        : "Open for marking";
    statusCards.push(`
      <article class="${lock && lock.locked ? "holiday-alert" : lock && lock.closed ? "closed-session" : ""}">
        <span>${escapeHtml(attendanceState.filters.session)} Session</span>
        <strong>${escapeHtml(sessionMessage)}</strong>
      </article>
    `);
  }

  if (isParent && attendanceState.attendance.length > 1) {
    statusCards.push(`
      <article>
        <span>Attendance by Child</span>
        <strong>Each child's attendance is shown separately below</strong>
      </article>
    `);
  } else {
    statusCards.push(`
      <article>
        <span>${isParent ? "Overall Attendance" : "Class Attendance Average"}</span>
        <strong>${
          percentage.percentage == null
            ? "Not enough finalized records"
            : isParent
              ? `${escapeHtml(percentage.percentage)}% attendance this academic year`
              : `${escapeHtml(percentage.percentage)}% across visible students`
        }</strong>
      </article>
    `);
  }

  host.innerHTML = `
    <div class="attendance-session-grid">
      <article>
        <span>Morning Session</span>
        <strong>${escapeHtml(normalizeTimeValue(settings.MorningAttendanceStartTime) || "08:30")} - ${escapeHtml(normalizeTimeValue(settings.MorningAttendanceEndTime) || "10:00")}</strong>
      </article>
      <article>
        <span>Afternoon Session</span>
        <strong>${escapeHtml(normalizeTimeValue(settings.AfternoonAttendanceStartTime) || "13:30")} - ${escapeHtml(normalizeTimeValue(settings.AfternoonAttendanceEndTime) || "15:00")}</strong>
      </article>
      ${statusCards.join("")}
    </div>
  `;
}

function renderAttendanceRow(record, canMark) {
  const status =
    record.Status ||
    getAttendanceStatusPreview(record.MorningStatus, record.AfternoonStatus);
  const parentMessage =
    record.ParentMessage ||
    getAttendanceParentMessage(
      record.Name,
      record.MorningStatus,
      record.AfternoonStatus,
    );
  const activeSession = attendanceState.filters.session || "Morning";
  const percentage = record.AttendancePercentage || {};
  const percentageLabel =
    percentage.percentage == null
      ? "Not available"
      : `${percentage.percentage}% (${percentage.presentSessions}/${percentage.eligibleSessions} sessions)`;

  return `
    <tr data-student-id="${escapeHtml(record.StudentID)}">
      <td>
        <button class="student-name-button" type="button" data-view-attendance-student="${escapeHtml(record.StudentID)}">${escapeHtml(record.Name || "Student")}</button>
        <small>${escapeHtml(record.StudentID || "")}${parentMessage ? ` | ${escapeHtml(parentMessage)}` : ""}</small>
      </td>
      <td>${escapeHtml(record.Grade || "Not set")}</td>
      <td>${canMark && activeSession === "Morning" ? renderAttendanceSelect("SessionStatus", record.MorningStatus) : escapeHtml(record.MorningStatus || "Not marked")}</td>
      <td>${canMark && activeSession === "Afternoon" ? renderAttendanceSelect("SessionStatus", record.AfternoonStatus) : escapeHtml(record.AfternoonStatus || "Not marked")}</td>
      <td>
        <span class="status-pill ${getAttendanceStatusClass(status)}">${escapeHtml(status || "Not marked")}</span>
        <small>${escapeHtml(record.RecordState || "Draft")}</small>
      </td>
      <td><strong>${escapeHtml(percentageLabel)}</strong></td>
      <td>${canMark ? `<input name="Remarks" value="${escapeHtml(record.Remarks || "")}" placeholder="Optional note">` : escapeHtml(record.Remarks || "-")}</td>
    </tr>
  `;
}

function renderAttendanceSelect(name, value) {
  return `
    <select name="${name}" required>
      <option value="">Select</option>
      <option value="Present" ${value === "Present" ? "selected" : ""}>Present</option>
      <option value="Absent" ${value === "Absent" ? "selected" : ""}>Absent</option>
    </select>
  `;
}

function submitAttendanceForm(event) {
  event.preventDefault();
  const button = document.getElementById("saveAttendanceButton");
  const message = document.getElementById("attendanceMessage");

  if (attendanceState.filters.date > getTodayDate()) {
    message.textContent = "Future attendance cannot be marked.";
    return;
  }

  const records = Array.from(
    document.querySelectorAll("#attendanceHost tbody tr[data-student-id]"),
  ).map((row) => ({
    StudentID: row.dataset.studentId,
    Status: row.querySelector('[name="SessionStatus"]')?.value || "",
    Remarks: row.querySelector('[name="Remarks"]')?.value || "",
    CorrectionReason:
      document.getElementById("attendanceCorrectionReason")?.value || "",
  }));

  const incomplete = records.some((record) => !record.Status);
  if (incomplete) {
    message.textContent = `Please mark ${attendanceState.filters.session.toLowerCase()} attendance for every visible student.`;
    return;
  }

  button.disabled = true;
  button.textContent = "Saving...";
  message.textContent = "";

  api
    .saveAttendance({
      date: attendanceState.filters.date,
      academicYear: attendanceState.filters.academicYear,
      session: attendanceState.filters.session,
      records,
    })
    .then((result) => {
      button.disabled = false;
      button.textContent = "Save Attendance";
      if (!result.success) {
        message.textContent = result.message || "Unable to save attendance";
        return;
      }
      message.textContent = `${attendanceState.filters.session} attendance saved.`;
      loadAttendance();
    })
    .catch((error) => {
      console.error(error);
      button.disabled = false;
      button.textContent = "Save Attendance";
      message.textContent = "Unable to save attendance";
    });
}

function getAttendanceStatusPreview(morningStatus, afternoonStatus) {
  if (!morningStatus || !afternoonStatus) return "";
  if (morningStatus === "Present" && afternoonStatus === "Present")
    return "Present";
  if (morningStatus === "Absent" && afternoonStatus === "Absent")
    return "Full Day Absent";
  if (morningStatus === "Absent" && afternoonStatus === "Present")
    return "Half Day - Afternoon Present";
  return "Half Day - Morning Present";
}

function getAttendanceParentMessage(name, morningStatus, afternoonStatus) {
  const status = getAttendanceStatusPreview(morningStatus, afternoonStatus);
  const studentName = name || "Your child";
  if (status === "Present")
    return `${studentName} was present for both sessions.`;
  if (status === "Full Day Absent")
    return `${studentName} was absent for the full school day.`;
  if (status === "Half Day - Afternoon Present")
    return `${studentName} was present in the afternoon, so attendance is marked as half day.`;
  if (status === "Half Day - Morning Present")
    return `${studentName} was present in the morning, so attendance is marked as half day.`;
  return "";
}

function getAttendanceStatusClass(status) {
  if (status === "Present") return "active";
  if (status === "Full Day Absent") return "inactive";
  if (status && status.indexOf("Half Day") === 0) return "halfday";
  return "";
}

function getTodayDate() {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localTime.toISOString().slice(0, 10);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function renderAttendanceError(message) {
  const host = document.getElementById("attendanceHost");
  if (host)
    host.innerHTML = `<div class="message">${escapeHtml(message)}</div>`;
}

function renderTeachersShell() {
  return `
    <section class="module-header">
      <div>
        <div class="section-kicker">Teacher Management</div>
        <h1>Teachers</h1>
        <p>Manage teacher records and grade assignments. Use comma-separated grades such as 3,4,5 for multiple classes.</p>
      </div>
      <button class="primary-btn compact" id="addTeacherButton" type="button">Add Teacher</button>
    </section>
    <section class="toolbar">
      <div class="field">
        <label for="teacherSearch">Search</label>
        <input id="teacherSearch" placeholder="Name, ID, subject, grade, phone">
      </div>
      <div class="field">
        <label for="teacherGradeFilter">Class</label>
        <select id="teacherGradeFilter"></select>
      </div>
      <div class="field">
        <label for="teacherStatusFilter">Status</label>
        <select id="teacherStatusFilter"></select>
      </div>
    </section>
    <section class="table-card" id="teachersHost">
      <div class="user-chip">Loading teachers...</div>
    </section>
  `;
}

function loadTeachers() {
  const host = document.getElementById("teachersHost");
  if (host) host.innerHTML = '<div class="user-chip">Loading teachers...</div>';

  api
    .listTeachers(teacherState.filters)
    .then((result) => {
      if (!result.success) {
        renderTeacherError(result.message || "Unable to load teachers");
        return;
      }

      teacherState = {
        ...teacherState,
        teachers: result.teachers || [],
        permissions: result.permissions || teacherState.permissions,
        grades: result.grades || [],
        statuses: result.statuses || [],
      };
      renderTeachers();
    })
    .catch((error) => {
      console.error(error);
      renderTeacherError("Unable to load teachers");
    });
}

function renderTeachers() {
  document
    .getElementById("addTeacherButton")
    .addEventListener("click", () => openTeacherForm());
  populateFilter(
    "teacherGradeFilter",
    "All Classes",
    teacherState.grades,
    teacherState.filters.grade,
  );
  populateFilter(
    "teacherStatusFilter",
    "All Statuses",
    teacherState.statuses,
    teacherState.filters.status,
  );

  const search = document.getElementById("teacherSearch");
  search.value = teacherState.filters.search;
  search.addEventListener(
    "input",
    debounce(() => {
      teacherState.filters.search = search.value;
      loadTeachers();
    }, 280),
  );

  document
    .getElementById("teacherGradeFilter")
    .addEventListener("change", (event) => {
      teacherState.filters.grade = event.target.value;
      loadTeachers();
    });
  document
    .getElementById("teacherStatusFilter")
    .addEventListener("change", (event) => {
      teacherState.filters.status = event.target.value;
      loadTeachers();
    });

  const rows = teacherState.teachers
    .map((teacher) => renderTeacherRow(teacher))
    .join("");
  document.getElementById("teachersHost").innerHTML = `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Subject</th>
            <th>Classes</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="7">No teachers found.</td></tr>'}</tbody>
      </table>
    </div>
  `;
  bindTeacherActions();
}

function renderTeacherRow(teacher) {
  const canDeactivate = teacher.Status !== "Inactive";
  return `
    <tr>
      <td>${escapeHtml(teacher.TeacherID)}</td>
      <td>
        <strong>${escapeHtml(teacher.FullName)}</strong>
        <small>${escapeHtml(teacher.Username || "No username")} | Joined ${escapeHtml(teacher.JoiningDate || "Not set")}</small>
      </td>
      <td>${escapeHtml(teacher.Subject)}</td>
      <td>${escapeHtml(teacher.Grade)}</td>
      <td>${escapeHtml(teacher.Phone)}</td>
      <td><span class="status-pill ${teacher.Status === "Active" ? "active" : "inactive"}">${escapeHtml(teacher.Status || "Not set")}</span></td>
      <td class="actions">
        <button type="button" class="text-btn" data-edit-teacher="${escapeHtml(teacher.TeacherID)}">Edit</button>
        ${canDeactivate ? `<button type="button" class="text-btn danger" data-deactivate-teacher="${escapeHtml(teacher.TeacherID)}">Deactivate</button>` : ""}
      </td>
    </tr>
  `;
}

function bindTeacherActions() {
  document.querySelectorAll("[data-edit-teacher]").forEach((button) => {
    button.addEventListener("click", () => {
      const teacher = teacherState.teachers.find(
        (item) => item.TeacherID === button.dataset.editTeacher,
      );
      openTeacherForm(teacher);
    });
  });

  document.querySelectorAll("[data-deactivate-teacher]").forEach((button) => {
    button.addEventListener("click", () =>
      deactivateTeacher(button.dataset.deactivateTeacher),
    );
  });
}

function openTeacherForm(teacher = {}) {
  const isEdit = Boolean(teacher.TeacherID);
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <form class="student-form" id="teacherForm" action="javascript:void(0)" novalidate>
      <div class="form-head">
        <div>
          <div class="section-kicker">${isEdit ? "Edit Teacher" : "Add Teacher"}</div>
          <h2>${isEdit ? escapeHtml(teacher.FullName) : "New Teacher"}</h2>
        </div>
        <button type="button" class="icon-btn" id="closeTeacherForm">X</button>
      </div>
      <input type="hidden" name="TeacherID" value="${escapeHtml(teacher.TeacherID || "")}">
      ${renderTeacherField("FullName", "Full Name", teacher.FullName, true)}
      <div class="form-grid">
        ${renderTeacherField("Subject", "Subject", teacher.Subject, true)}
        ${renderTeacherField("Grade", "Assigned Classes", teacher.Grade, true)}
      </div>
      <div class="form-grid">
        ${renderTeacherField("Phone", "Phone", teacher.Phone)}
        ${renderTeacherField("JoiningDate", "Joining Date", teacher.JoiningDate, false, "date")}
      </div>
      <div class="form-grid">
        ${renderTeacherField("Username", "Username", teacher.Username, true)}
        ${renderTeacherField("Password", "Password", "", false, "password")}
      </div>
      <input type="hidden" name="Role" value="Teacher">
      <div class="field">
        <label for="teacherStatus">Status</label>
        <select id="teacherStatus" name="Status">
          <option value="Active" ${teacher.Status !== "Inactive" ? "selected" : ""}>Active</option>
          <option value="Inactive" ${teacher.Status === "Inactive" ? "selected" : ""}>Inactive</option>
        </select>
      </div>
      <button class="primary-btn" id="saveTeacherButton" type="button">${isEdit ? "Save Changes" : "Add Teacher"}</button>
      <div class="message" id="teacherFormMessage"></div>
    </form>
  `;

  document.body.appendChild(modal);
  document
    .getElementById("closeTeacherForm")
    .addEventListener("click", () => modal.remove());
  document
    .getElementById("teacherForm")
    .addEventListener("submit", (event) => event.preventDefault());
  document
    .getElementById("saveTeacherButton")
    .addEventListener("click", () => submitTeacherForm(modal));
}

function renderTeacherField(
  name,
  label,
  value = "",
  required = false,
  type = "text",
) {
  return `
    <div class="field">
      <label for="teacher${name}">${label}</label>
      <input id="teacher${name}" name="${name}" type="${type}" value="${escapeHtml(value || "")}" ${required ? "required" : ""}>
    </div>
  `;
}

function submitTeacherForm(modal) {
  const form = document.getElementById("teacherForm");
  const saveButton = document.getElementById("saveTeacherButton");
  const message = document.getElementById("teacherFormMessage");
  const data = Object.fromEntries(new FormData(form).entries());

  if (!form.reportValidity()) return;

  message.textContent = "";
  saveButton.disabled = true;
  saveButton.textContent = "Saving...";

  api
    .saveTeacher(data)
    .then((result) => {
      if (!result.success) {
        message.textContent = result.message || "Unable to save teacher";
        saveButton.disabled = false;
        saveButton.textContent = data.TeacherID
          ? "Save Changes"
          : "Add Teacher";
        return;
      }
      modal.remove();
      keepModuleInUrl("teachers");
      loadTeachers();
    })
    .catch((error) => {
      console.error(error);
      message.textContent = "Unable to save teacher";
      saveButton.disabled = false;
      saveButton.textContent = data.TeacherID ? "Save Changes" : "Add Teacher";
    });
}

function deactivateTeacher(teacherId) {
  api
    .deactivateTeacher(teacherId)
    .then((result) => {
      if (!result.success) {
        renderTeacherError(result.message || "Unable to deactivate teacher");
        return;
      }
      loadTeachers();
    })
    .catch((error) => {
      console.error(error);
      renderTeacherError("Unable to deactivate teacher");
    });
}

function renderTeacherError(message) {
  const host = document.getElementById("teachersHost");
  if (host)
    host.innerHTML = `<div class="message">${escapeHtml(message)}</div>`;
}

function renderSettingsShell() {
  return `
    <section class="module-header">
      <div>
        <div class="section-kicker">Admin Settings</div>
        <h1>Academic Setup</h1>
        <p>Set academic year, attendance timings, and special holidays that should be remembered for future attendance and calendar use.</p>
      </div>
    </section>
    <section class="settings-grid">
      <form class="settings-card" id="academicSettingsForm">
        <span>Academic Year</span>
        <div class="form-grid">
          ${renderSettingsField("SchoolName", "School Name")}
          ${renderSettingsField("CurrentAcademicYear", "Current Academic Year")}
          ${renderSettingsField("AcademicYearStartDate", "Academic Year Start", "date")}
          ${renderSettingsField("AcademicYearEndDate", "Academic Year End", "date")}
          ${renderSettingsField("NextAcademicYear", "Next Academic Year")}
        </div>
        <span>School Week</span>
        ${renderWorkingDaysField()}
        <span>Attendance Sessions</span>
        <div class="form-grid">
          ${renderSettingsField("MorningAttendanceStartTime", "Morning Start Time", "time")}
          ${renderSettingsField("MorningAttendanceEndTime", "Morning End Time", "time")}
          ${renderSettingsField("AfternoonAttendanceStartTime", "Afternoon Start Time", "time")}
          ${renderSettingsField("AfternoonAttendanceEndTime", "Afternoon End Time", "time")}
          ${renderSettingsField("AttendanceEditCutoffTime", "Teacher Edit Cutoff", "time")}
        </div>
        <div class="field">
          <label for="AttendancePercentageMode">Attendance Percentage Rule</label>
          <select id="AttendancePercentageMode" name="AttendancePercentageMode">
            <option value="FinalizedSessions">Count finalized morning and afternoon sessions</option>
          </select>
        </div>
        <button class="primary-btn compact" id="saveSettingsButton" type="submit">Save Settings</button>
        <div class="message" id="settingsMessage"></div>
      </form>

      <section class="settings-card">
        <span>Promotion Foundation</span>
        <p>Promotion should be run only after attendance, marks, and fees for the year are closed. The system should create new-year records and preserve old records.</p>
        <div class="promotion-flow">
          <div>Nursery -> LKG</div>
          <div>LKG -> UKG</div>
          <div>UKG -> 1</div>
          <div>7 -> Completed</div>
        </div>
      </section>
    </section>

    <section class="settings-card password-management-card">
      <div class="settings-card-head">
        <div>
          <span>Password Management</span>
          <p>Find an administrator, teacher, or parent account and issue a new password. For privacy, an existing password can never be displayed.</p>
        </div>
      </div>
      <form class="password-lookup-form" id="passwordLookupForm">
        <div class="field">
          <label for="PasswordUsername">Account Username</label>
          <input id="PasswordUsername" name="username" type="text" autocomplete="off" required>
        </div>
        <button class="primary-btn compact" id="lookupPasswordButton" type="submit">Find Account</button>
      </form>
      <div class="message" id="passwordLookupMessage" aria-live="polite"></div>
      <div id="passwordAccountHost"></div>
    </section>

    <section class="settings-card">
      <div class="settings-card-head">
        <div>
          <span>Special Holidays</span>
          <p>Add sudden holidays or continuous holiday ranges. These records will be used by future Attendance and Academic Calendar modules.</p>
        </div>
      </div>
      <form class="holiday-form" id="holidayForm">
        <div class="form-grid">
          ${renderSettingsField("HolidayStartDate", "Start Date", "date")}
          ${renderSettingsField("HolidayEndDate", "End Date", "date")}
        </div>
        ${renderSettingsField("HolidayRemark", "Remark")}
        <button class="primary-btn compact" id="addHolidayButton" type="submit">Add Holiday</button>
        <div class="message" id="holidayMessage"></div>
      </form>
      <div id="holidaysHost" class="holiday-list">
        <div class="user-chip">Loading holidays...</div>
      </div>
    </section>
  `;
}

function renderSettingsField(name, label, type = "text") {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="${type}">
    </div>
  `;
}

function renderWorkingDaysField() {
  return `
    <div class="weekday-picker" id="WorkingDays">
      ${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        .map(
          (day) => `
        <label>
          <input type="checkbox" name="WorkingDay" value="${day}">
          <span>${day}</span>
        </label>
      `,
        )
        .join("")}
    </div>
  `;
}

function loadSettings() {
  api
    .getSettings()
    .then((result) => {
      if (!result.success) {
        renderSettingsError(result.message || "Unable to load settings");
        return;
      }
      settingsState.settings = result.settings;
      renderSettingsData();
    })
    .catch((error) => {
      console.error(error);
      renderSettingsError("Unable to load settings");
    });
}

function renderSettingsData() {
  const settings = settingsState.settings || {};
  [
    "SchoolName",
    "CurrentAcademicYear",
    "NextAcademicYear",
    "AcademicYearStartDate",
    "AcademicYearEndDate",
    "MorningAttendanceStartTime",
    "MorningAttendanceEndTime",
    "AfternoonAttendanceStartTime",
    "AfternoonAttendanceEndTime",
    "AttendanceEditCutoffTime",
  ].forEach((key) => {
    const input = document.getElementById(key);
    if (input)
      input.value =
        key.indexOf("Attendance") > -1
          ? normalizeTimeValue(settings[key])
          : settings[key] || "";
  });

  const selectedDays = splitCsv(
    settings.WorkingDays || "Mon,Tue,Wed,Thu,Fri,Sat",
  );
  document.querySelectorAll('[name="WorkingDay"]').forEach((checkbox) => {
    checkbox.checked = selectedDays.includes(checkbox.value);
  });
  const percentageMode = document.getElementById("AttendancePercentageMode");
  if (percentageMode)
    percentageMode.value =
      settings.AttendancePercentageMode || "FinalizedSessions";

  document
    .getElementById("academicSettingsForm")
    .addEventListener("submit", submitSettingsForm);
  document
    .getElementById("holidayForm")
    .addEventListener("submit", submitHolidayForm);
  document
    .getElementById("passwordLookupForm")
    .addEventListener("submit", submitPasswordLookup);
  renderHolidayList(settings.SpecialHolidays || []);
}

function submitPasswordLookup(event) {
  event.preventDefault();
  const username = document.getElementById("PasswordUsername").value.trim();
  const button = document.getElementById("lookupPasswordButton");
  const message = document.getElementById("passwordLookupMessage");
  const host = document.getElementById("passwordAccountHost");

  settingsState.passwordAccount = null;
  host.innerHTML = "";
  message.textContent = "";
  button.disabled = true;
  button.textContent = "Finding...";

  api
    .lookupPasswordAccount(username)
    .then((result) => {
      button.disabled = false;
      button.textContent = "Find Account";
      if (!result.success) {
        message.textContent = result.message || "Account not found.";
        return;
      }
      settingsState.passwordAccount = result.account;
      renderPasswordAccount(result.account);
    })
    .catch((error) => {
      console.error(error);
      button.disabled = false;
      button.textContent = "Find Account";
      message.textContent = "Unable to find this account.";
    });
}

function renderPasswordAccount(account) {
  const host = document.getElementById("passwordAccountHost");
  host.innerHTML = `
    <div class="password-account-panel">
      <div class="password-account-summary">
        <div>
          <small>Account holder</small>
          <strong>${escapeHtml(account.name || account.username)}</strong>
        </div>
        <div>
          <small>Username</small>
          <strong>${escapeHtml(account.username)}</strong>
        </div>
        <div>
          <small>Account type</small>
          <strong>${escapeHtml(account.role)}</strong>
        </div>
        <div>
          <small>Status</small>
          <strong>${escapeHtml(account.status || "Active")}</strong>
        </div>
      </div>
      <form id="passwordResetForm">
        <div class="form-grid">
          <div class="field">
            <label for="NewAccountPassword">New Password</label>
            <input id="NewAccountPassword" type="password" autocomplete="new-password">
          </div>
          <div class="field">
            <label for="ConfirmAccountPassword">Confirm Password</label>
            <input id="ConfirmAccountPassword" type="password" autocomplete="new-password">
          </div>
        </div>
        <label class="password-visibility">
          <input id="ShowAccountPassword" type="checkbox">
          <span>Show the password while typing</span>
        </label>
        <p class="password-guidance">Use at least 10 characters with uppercase, lowercase, a number, and a symbol.</p>
        <div class="password-actions">
          <button class="primary-btn compact" id="setAccountPasswordButton" type="submit">Set New Password</button>
          <button class="ghost-btn compact" id="generateAccountPasswordButton" type="button">Generate Secure Password</button>
        </div>
        <div class="message" id="passwordResetMessage" aria-live="polite"></div>
        <div id="temporaryPasswordHost"></div>
      </form>
    </div>
  `;

  document
    .getElementById("passwordResetForm")
    .addEventListener("submit", submitManualPasswordReset);
  document
    .getElementById("generateAccountPasswordButton")
    .addEventListener("click", generateTemporaryPassword);
  document
    .getElementById("ShowAccountPassword")
    .addEventListener("change", toggleAccountPasswordVisibility);
}

function toggleAccountPasswordVisibility(event) {
  const type = event.currentTarget.checked ? "text" : "password";
  document.getElementById("NewAccountPassword").type = type;
  document.getElementById("ConfirmAccountPassword").type = type;
}

function submitManualPasswordReset(event) {
  event.preventDefault();
  const password = document.getElementById("NewAccountPassword").value;
  const confirmation = document.getElementById("ConfirmAccountPassword").value;
  const message = document.getElementById("passwordResetMessage");
  const validationMessage = validateNewAccountPassword(password);

  message.textContent = "";
  document.getElementById("temporaryPasswordHost").innerHTML = "";
  if (validationMessage) {
    message.textContent = validationMessage;
    return;
  }
  if (password !== confirmation) {
    message.textContent = "The two passwords do not match.";
    return;
  }

  resetSelectedAccountPassword({ newPassword: password, generate: false });
}

function generateTemporaryPassword() {
  resetSelectedAccountPassword({ generate: true });
}

function resetSelectedAccountPassword(request) {
  const account = settingsState.passwordAccount;
  if (!account) return;

  const confirmationText = request.generate
    ? `Generate a new secure password for ${account.name || account.username}?`
    : `Replace the password for ${account.name || account.username}?`;
  if (!window.confirm(`${confirmationText} Other signed-in sessions for this account will end.`))
    return;

  const manualButton = document.getElementById("setAccountPasswordButton");
  const generateButton = document.getElementById("generateAccountPasswordButton");
  const message = document.getElementById("passwordResetMessage");
  manualButton.disabled = true;
  generateButton.disabled = true;
  message.textContent = "Updating password...";

  api
    .resetAccountPassword({ ...request, username: account.username })
    .then((result) => {
      manualButton.disabled = false;
      generateButton.disabled = false;
      if (!result.success) {
        message.textContent = result.message || "Unable to update password.";
        return;
      }

      document.getElementById("passwordResetForm").reset();
      togglePasswordInputsToHidden();
      message.textContent =
        "Password updated. Other signed-in sessions for this account have ended.";
      renderTemporaryPassword(result.temporaryPassword);
    })
    .catch((error) => {
      console.error(error);
      manualButton.disabled = false;
      generateButton.disabled = false;
      message.textContent = "Unable to update password.";
    });
}

function validateNewAccountPassword(password) {
  if (password.length < 10) return "Use at least 10 characters.";
  if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Add at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Add at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Add at least one symbol.";
  if (/\s/.test(password)) return "Passwords cannot contain spaces.";
  return "";
}

function togglePasswordInputsToHidden() {
  document.getElementById("NewAccountPassword").type = "password";
  document.getElementById("ConfirmAccountPassword").type = "password";
}

function renderTemporaryPassword(password) {
  const host = document.getElementById("temporaryPasswordHost");
  if (!password) {
    host.innerHTML = "";
    return;
  }
  host.innerHTML = `
    <div class="temporary-password-result">
      <div>
        <small>New secure password - shown only now</small>
        <strong id="temporaryPasswordValue">${escapeHtml(password)}</strong>
      </div>
      <button class="ghost-btn compact" id="copyTemporaryPasswordButton" type="button">Copy</button>
    </div>
  `;
  document
    .getElementById("copyTemporaryPasswordButton")
    .addEventListener("click", () => copyTemporaryPassword(password));
}

function copyTemporaryPassword(password) {
  const button = document.getElementById("copyTemporaryPasswordButton");
  navigator.clipboard
    .writeText(password)
    .then(() => {
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1600);
    })
    .catch(() => {
      document.getElementById("temporaryPasswordValue").focus?.();
      button.textContent = "Select and copy";
    });
}

function submitSettingsForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = document.getElementById("saveSettingsButton");
  const message = document.getElementById("settingsMessage");
  const settings = Object.fromEntries(new FormData(form).entries());
  settings.WorkingDays = Array.from(
    form.querySelectorAll('[name="WorkingDay"]:checked'),
  )
    .map((checkbox) => checkbox.value)
    .join(",");

  if (!settings.WorkingDays) {
    message.textContent = "Select at least one working day.";
    return;
  }

  button.disabled = true;
  button.textContent = "Saving...";
  message.textContent = "";

  api
    .saveSettings(settings)
    .then((result) => {
      button.disabled = false;
      button.textContent = "Save Settings";
      if (!result.success) {
        message.textContent = result.message || "Unable to save settings";
        return;
      }
      settingsState.settings = result.settings;
      message.textContent = "Settings saved.";
    })
    .catch((error) => {
      console.error(error);
      button.disabled = false;
      button.textContent = "Save Settings";
      message.textContent = "Unable to save settings";
    });
}

function submitHolidayForm(event) {
  event.preventDefault();
  const button = document.getElementById("addHolidayButton");
  const message = document.getElementById("holidayMessage");
  const startDate = document.getElementById("HolidayStartDate").value;
  const endDate = document.getElementById("HolidayEndDate").value || startDate;
  const remark = document.getElementById("HolidayRemark").value;

  button.disabled = true;
  button.textContent = "Adding...";
  message.textContent = "";

  api
    .addHoliday({ startDate, endDate, remark })
    .then((result) => {
      button.disabled = false;
      button.textContent = "Add Holiday";
      if (!result.success) {
        message.textContent = result.message || "Unable to add holiday";
        return;
      }
      document.getElementById("holidayForm").reset();
      settingsState.settings.SpecialHolidays = result.holidays || [];
      renderHolidayList(settingsState.settings.SpecialHolidays);
    })
    .catch((error) => {
      console.error(error);
      button.disabled = false;
      button.textContent = "Add Holiday";
      message.textContent = "Unable to add holiday";
    });
}

function renderHolidayList(holidays) {
  const host = document.getElementById("holidaysHost");
  const rows = holidays
    .map(
      (holiday) => `
    <div class="holiday-item">
      <div>
        <strong>${escapeHtml(holiday.startDate)}${holiday.endDate && holiday.endDate !== holiday.startDate ? ` to ${escapeHtml(holiday.endDate)}` : ""}</strong>
        <small>${escapeHtml(holiday.remark)}</small>
      </div>
      <button class="text-btn danger" type="button" data-remove-holiday="${escapeHtml(holiday.id)}">Remove</button>
    </div>
  `,
    )
    .join("");
  host.innerHTML =
    rows || '<div class="muted-text">No special holidays added yet.</div>';

  document.querySelectorAll("[data-remove-holiday]").forEach((button) => {
    button.addEventListener("click", () =>
      removeHoliday(button.dataset.removeHoliday),
    );
  });
}

function removeHoliday(holidayId) {
  api
    .removeHoliday(holidayId)
    .then((result) => {
      if (!result.success) {
        renderSettingsError(result.message || "Unable to remove holiday");
        return;
      }
      settingsState.settings.SpecialHolidays = result.holidays || [];
      renderHolidayList(settingsState.settings.SpecialHolidays);
    })
    .catch((error) => {
      console.error(error);
      renderSettingsError("Unable to remove holiday");
    });
}

function renderSettingsError(message) {
  const host = document.getElementById("moduleHost");
  if (host)
    host.innerHTML = `<section class="settings-card"><div class="message">${escapeHtml(message)}</div></section>`;
}

function logout() {
  renderLoading();
  api
    .logout(getToken())
    .then(() => {
      clearToken();
      routeTo("login");
    })
    .catch(() => {
      clearToken();
      routeTo("login");
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
  document
    .getElementById("correctDashboard")
    .addEventListener("click", () => routeTo(expectedRoute));
  document.getElementById("accessLogout").addEventListener("click", logout);
}

function getMockSessions() {
  try {
    return JSON.parse(localStorage.getItem(mockSessionKey) || "{}");
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
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
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
  if (window.crypto && window.crypto.randomUUID)
    return window.crypto.randomUUID();
  return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone || "",
    username: user.username,
    role: user.role,
  };
}

function getStudentPermissions(role) {
  return {
    canView: ["Admin", "Teacher", "Parent"].includes(role),
    canAdd: role === "Admin",
    canEdit: role === "Admin",
    canDeactivate: role === "Admin",
  };
}

function uniqueValues(items, key) {
  return Array.from(
    new Set(items.map((item) => item[key]).filter(Boolean)),
  ).sort();
}

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeTimeValue(value) {
  const cleanValue = String(value || "").trim();
  const match = cleanValue.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return cleanValue;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function uniqueGradeCsvValues(items) {
  const grades = [];
  items.forEach((item) =>
    splitCsv(item.Grade).forEach((grade) => grades.push(grade)),
  );
  return Array.from(new Set(grades)).sort();
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
  return (
    String(value || "")
      .charAt(0)
      .toUpperCase() + String(value || "").slice(1)
  );
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
