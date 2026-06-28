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
let teacherDashboardSummary = null;
let mockAttendanceClosed = false;
let feeState = {
  filters: { search: "", grade: "", status: "", academicYear: "" },
  fees: [],
  transactions: [],
  summary: { total: 0, paid: 0, due: 0, pendingAccounts: 0 },
  grades: [],
  statuses: [],
  academicYears: [],
  paymentModes: [],
  students: [],
  permissions: { canView: false, canManage: false, canRecordPayment: false },
};
let notificationState = {
  filters: { search: "", audience: "", status: "" },
  notifications: [],
  audiences: [],
  priorities: [],
  statuses: [],
  grades: [],
  students: [],
  permissions: { canView: false, canManage: false },
};
let calendarState = {
  filters: { month: "", dayType: "", academicYear: "" },
  events: [],
  summary: { total: 0, upcoming: 0, holidays: 0 },
  dayTypes: [],
  audiences: [],
  statuses: [],
  grades: [],
  academicYears: [],
  permissions: { canView: false, canManage: false },
};

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
    grades: ["5", "4", "3", "2", "1"],
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

const mockFees = [
  { StudentID: "PUP001", Grade: "3", TotalFees: 25000, PaidAmount: 10000, DueAmount: 15000, DueDate: "2026-08-31", LastPaymentDate: "2026-06-10", Status: "Partial", AcademicYear: "2026-27" },
  { StudentID: "PUP002", Grade: "4", TotalFees: 28000, PaidAmount: 28000, DueAmount: 0, DueDate: "2026-08-31", LastPaymentDate: "2026-06-15", Status: "Paid", AcademicYear: "2026-27" },
];
const mockFeeTransactions = [
  { TransactionID: "FT0001", StudentID: "PUP001", Amount: 10000, PaymentDate: "2026-06-10", Mode: "UPI", Remarks: "First installment", AcademicYear: "2026-27" },
  { TransactionID: "FT0002", StudentID: "PUP002", Amount: 28000, PaymentDate: "2026-06-15", Mode: "Cash", Remarks: "Full payment", AcademicYear: "2026-27" },
];
const mockNotifications = [
  { NotificationID: "NTF0001", Title: "Welcome to the new academic year", Message: "We look forward to a joyful year of learning, discipline, creativity, and growth.", Audience: "All", TargetValue: "", TargetLabel: "Entire school community", Priority: "Important", PublishDate: "2026-06-20", ExpiryDate: "", Status: "Published" },
  { NotificationID: "NTF0002", Title: "Class 3 parent orientation", Message: "Parents of Class 3 students are invited to meet the class teacher on Saturday at 11:00 AM.", Audience: "Grade", TargetValue: "3", TargetLabel: "Class 3", Priority: "Normal", PublishDate: "2026-06-25", ExpiryDate: "2026-07-05", Status: "Published" },
];
const mockCalendarEvents = [
  { EventID: "CAL0001", Date: "2026-07-15", EndDate: "2026-07-15", DayType: "Event", Title: "School Reopening", Note: "Regular classes begin for the new academic year.", Audience: "All", TargetValue: "", TargetLabel: "Entire school community", AcademicYear: "2026-27", Status: "Published" },
  { EventID: "CAL0002", Date: "2026-08-15", EndDate: "2026-08-15", DayType: "Holiday", Title: "Independence Day", Note: "School celebration schedule will be shared separately.", Audience: "All", TargetValue: "", TargetLabel: "Entire school community", AcademicYear: "2026-27", Status: "Published" },
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

  getTeacherDashboardSummary() {
    return callAppsScript("getTeacherDashboardSummary", { token: getToken() });
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

  listFees(filters) {
    return callAppsScript("listFees", { token: getToken(), filters });
  },

  saveFeeAccount(fee) {
    return callAppsScript("saveFeeAccount", { token: getToken(), fee });
  },

  recordFeePayment(payment) {
    return callAppsScript("recordFeePayment", { token: getToken(), payment });
  },

  listNotifications(filters) {
    return callAppsScript("listNotifications", { token: getToken(), filters });
  },

  saveNotification(notification) {
    return callAppsScript("saveNotification", { token: getToken(), notification });
  },

  archiveNotification(notificationId) {
    return callAppsScript("archiveNotification", { token: getToken(), notificationId });
  },

  listAcademicCalendar(filters) {
    return callAppsScript("listAcademicCalendar", { token: getToken(), filters });
  },

  saveCalendarEvent(event) {
    return callAppsScript("saveCalendarEvent", { token: getToken(), event });
  },

  archiveCalendarEvent(eventId) {
    return callAppsScript("archiveCalendarEvent", { token: getToken(), eventId });
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

      if (session.user.role === "Teacher") {
        const teacherGrades = session.user.grades || [];
        const canViewAll = teacherGrades.some(
          (gradeItem) => String(gradeItem).trim().toLowerCase() === "all",
        );
        students = canViewAll
          ? students
          : students.filter((student) =>
              teacherGrades.includes(String(student.Grade || "").trim()),
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

  getTeacherDashboardSummary() {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || session.user.role !== "Teacher")
        throw new Error("Access denied");

      const teacherGrades = session.user.grades || [];
      const canViewAll = teacherGrades.some(
        (gradeItem) => String(gradeItem).trim().toLowerCase() === "all",
      );
      const activeStudents = mockStudents.filter(
        (student) => student.Status === "Active",
      );
      const visibleStudents = canViewAll
        ? activeStudents
        : activeStudents.filter((student) =>
            teacherGrades.includes(String(student.Grade || "").trim()),
          );
      const classCounts = visibleStudents.reduce((counts, student) => {
        const gradeName = student.Grade || "Not set";
        counts[gradeName] = (counts[gradeName] || 0) + 1;
        return counts;
      }, {});
      const assignedClasses = canViewAll
        ? uniqueValues(mockStudents, "Grade")
        : teacherGrades;

      return {
        success: true,
        summary: {
          teacherName: session.user.name || "",
          assignedClasses,
          canViewAll,
          totalActiveStudents: visibleStudents.length,
          classCounts: assignedClasses.map((gradeName) => ({
            grade: gradeName,
            count: classCounts[gradeName] || 0,
          })),
        },
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

  listFees(filters) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || !["Admin", "Parent"].includes(session.user.role)) throw new Error("Access denied");
      const year = filters.academicYear || "2026-27";
      let fees = mockFees.filter((fee) => fee.AcademicYear === year).map((fee) => {
        const student = mockStudents.find((item) => item.StudentID === fee.StudentID) || {};
        return { ...fee, StudentName: student.Name || "", ParentName: student.ParentName || "", ParentPhone: student.ParentPhone || "", PhotoURL: student.PhotoURL || "" };
      });
      if (session.user.role === "Parent") fees = fees.filter((fee) => fee.ParentPhone === session.user.phone);
      const search = String(filters.search || "").trim().toLowerCase();
      if (search) fees = fees.filter((fee) => [fee.StudentID, fee.StudentName, fee.ParentName, fee.Grade].some((value) => String(value || "").toLowerCase().includes(search)));
      if (filters.grade) fees = fees.filter((fee) => fee.Grade === filters.grade);
      if (filters.status) fees = fees.filter((fee) => fee.Status === filters.status);
      const ids = fees.map((fee) => fee.StudentID);
      const transactions = mockFeeTransactions.filter((item) => item.AcademicYear === year && ids.includes(item.StudentID));
      const summary = fees.reduce((totals, fee) => ({
        total: totals.total + Number(fee.TotalFees || 0),
        paid: totals.paid + Number(fee.PaidAmount || 0),
        due: totals.due + Number(fee.DueAmount || 0),
        pendingAccounts: totals.pendingAccounts + (Number(fee.DueAmount || 0) > 0 ? 1 : 0),
      }), { total: 0, paid: 0, due: 0, pendingAccounts: 0 });
      return { success: true, academicYear: year, academicYears: ["2026-27"], fees, transactions, summary, grades: uniqueValues(fees, "Grade"), statuses: ["Pending", "Partial", "Overdue", "Paid"], paymentModes: ["Cash", "UPI", "Bank Transfer", "Cheque", "Other"], students: mockStudents.map((item) => ({ StudentID: item.StudentID, Name: item.Name, Grade: item.Grade })), permissions: { canView: true, canManage: session.user.role === "Admin", canRecordPayment: session.user.role === "Admin" } };
    });
  },

  saveFeeAccount(fee) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || session.user.role !== "Admin") throw new Error("Access denied");
      const student = mockStudents.find((item) => item.StudentID === fee.StudentID);
      if (!student) return { success: false, message: "Select a valid student" };
      const existing = mockFees.find((item) => item.StudentID === fee.StudentID && item.AcademicYear === fee.AcademicYear);
      const total = Number(fee.TotalFees || 0);
      const paid = existing ? Number(existing.PaidAmount || 0) : 0;
      if (total < paid) return { success: false, message: "Total fee cannot be lower than the amount already paid" };
      const next = { StudentID: student.StudentID, Grade: student.Grade, TotalFees: total, PaidAmount: paid, DueAmount: total - paid, DueDate: fee.DueDate || existing?.DueDate || "", LastPaymentDate: existing?.LastPaymentDate || "", Status: paid >= total ? "Paid" : paid > 0 ? "Partial" : "Pending", AcademicYear: fee.AcademicYear };
      if (existing) Object.assign(existing, next); else mockFees.push(next);
      return { success: true };
    });
  },

  recordFeePayment(payment) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || session.user.role !== "Admin") throw new Error("Access denied");
      const fee = mockFees.find((item) => item.StudentID === payment.StudentID && item.AcademicYear === payment.AcademicYear);
      const amount = Number(payment.Amount || 0);
      if (!fee || amount <= 0 || amount > fee.DueAmount) return { success: false, message: "Enter a valid payment amount" };
      const id = `FT${String(mockFeeTransactions.length + 1).padStart(4, "0")}`;
      mockFeeTransactions.push({ ...payment, TransactionID: id, Amount: amount });
      fee.PaidAmount += amount;
      fee.DueAmount -= amount;
      fee.LastPaymentDate = payment.PaymentDate;
      fee.Status = fee.DueAmount === 0 ? "Paid" : "Partial";
      return { success: true, transactionId: id };
    });
  },

  listNotifications(filters) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session) throw new Error("Authentication required");
      let notifications = [...mockNotifications];
      if (session.user.role !== "Admin") notifications = notifications.filter((item) => item.Status === "Published" && (item.Audience === "All" || item.Audience === `${session.user.role}s` || (item.Audience === "Grade" && (session.user.grades || []).includes(item.TargetValue))));
      const search = String(filters.search || "").toLowerCase();
      if (search) notifications = notifications.filter((item) => `${item.Title} ${item.Message}`.toLowerCase().includes(search));
      if (filters.audience) notifications = notifications.filter((item) => item.Audience === filters.audience);
      if (filters.status && session.user.role === "Admin") notifications = notifications.filter((item) => item.Status === filters.status);
      return { success: true, notifications, audiences: ["All", "Parents", "Teachers", "Grade", "Student"], priorities: ["Normal", "Important", "Urgent"], statuses: ["Draft", "Published", "Archived"], grades: uniqueValues(mockStudents, "Grade"), students: mockStudents.map((item) => ({ StudentID: item.StudentID, Name: item.Name, Grade: item.Grade })), permissions: { canView: true, canManage: session.user.role === "Admin" } };
    });
  },

  saveNotification(notification) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || session.user.role !== "Admin") throw new Error("Access denied");
      const existing = mockNotifications.find((item) => item.NotificationID === notification.NotificationID);
      const next = { ...notification, NotificationID: notification.NotificationID || `NTF${String(mockNotifications.length + 1).padStart(4, "0")}`, PublishDate: notification.Date, Status: notification.SentStatus, TargetLabel: notification.Audience === "Grade" ? formatGradeLabel(notification.TargetValue) : notification.Audience === "Student" ? notification.TargetValue : notification.Audience === "All" ? "Entire school community" : `All ${notification.Audience.toLowerCase()}` };
      if (existing) Object.assign(existing, next); else mockNotifications.push(next);
      return { success: true };
    });
  },

  archiveNotification(notificationId) {
    return delay(() => {
      const item = mockNotifications.find((notification) => notification.NotificationID === notificationId);
      if (item) item.Status = "Archived";
      return { success: true };
    });
  },

  listAcademicCalendar(filters) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session) throw new Error("Authentication required");
      let events = mockCalendarEvents.filter((item) => item.AcademicYear === (filters.academicYear || "2026-27"));
      if (session.user.role !== "Admin") events = events.filter((item) => item.Status === "Published" && (item.Audience === "All" || item.Audience === `${session.user.role}s` || (item.Audience === "Grade" && (session.user.grades || []).includes(item.TargetValue))));
      if (filters.month) {
        const monthStart = `${filters.month}-01`;
        const [yearNumber, monthNumber] = filters.month.split("-").map(Number);
        const monthEnd = new Date(yearNumber, monthNumber, 0).toISOString().slice(0, 10);
        events = events.filter((item) => item.Date <= monthEnd && item.EndDate >= monthStart);
      }
      if (filters.dayType) events = events.filter((item) => item.DayType === filters.dayType);
      return { success: true, academicYear: filters.academicYear || "2026-27", academicYears: ["2026-27"], events, summary: { total: events.length, upcoming: events.length, holidays: events.filter((item) => item.DayType === "Holiday").length }, dayTypes: ["Holiday", "Event", "Exam", "Meeting", "Activity", "Deadline"], audiences: ["All", "Parents", "Teachers", "Grade"], statuses: ["Draft", "Published", "Archived"], grades: uniqueValues(mockStudents, "Grade"), permissions: { canView: true, canManage: session.user.role === "Admin" } };
    });
  },

  saveCalendarEvent(event) {
    return delay(() => {
      const session = getMockSession(getToken());
      if (!session || session.user.role !== "Admin") throw new Error("Access denied");
      const existing = mockCalendarEvents.find((item) => item.EventID === event.EventID);
      const next = { ...event, EventID: event.EventID || `CAL${String(mockCalendarEvents.length + 1).padStart(4, "0")}`, EndDate: event.EndDate || event.Date, TargetLabel: event.Audience === "Grade" ? formatGradeLabel(event.TargetValue) : event.Audience === "All" ? "Entire school community" : `All ${event.Audience.toLowerCase()}` };
      if (existing) Object.assign(existing, next); else mockCalendarEvents.push(next);
      return { success: true };
    });
  },

  archiveCalendarEvent(eventId) {
    return delay(() => {
      const item = mockCalendarEvents.find((event) => event.EventID === eventId);
      if (item) item.Status = "Archived";
      return { success: true };
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
  return ["students", "attendance", "teachers", "fees", "notifications", "academiccalendar", "settings"].includes(moduleName)
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
  if (moduleName === "fees") loadFees();
  if (moduleName === "notifications") loadNotifications();
  if (moduleName === "academiccalendar") loadAcademicCalendar();
  if (moduleName === "settings") loadSettings();
  if (moduleName === "dashboard" && user.role === "Admin")
    loadAdminAttendanceOverview();
  if (moduleName === "dashboard" && user.role === "Teacher")
    loadTeacherDashboardSummary();
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
              "fees",
              "notifications",
              "academiccalendar",
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
  if (moduleName === "fees" && ["Admin", "Parent"].includes(user.role))
    return renderFeesShell(user);
  if (moduleName === "notifications") return renderNotificationsShell(user);
  if (moduleName === "academiccalendar") return renderAcademicCalendarShell(user);
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
    ${
      user.role === "Teacher"
        ? `
      <section class="teacher-accountability-card portal-card" id="teacherAccountabilityCard">
        <div class="teacher-accountability-loading">Loading assigned classes...</div>
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

function loadTeacherDashboardSummary() {
  const host = document.getElementById("teacherAccountabilityCard");
  if (!host) return;

  api
    .getTeacherDashboardSummary()
    .then((result) => {
      if (!result.success) {
        host.innerHTML = `<div class="message">${escapeHtml(result.message || "Unable to load assigned classes")}</div>`;
        return;
      }
      teacherDashboardSummary = result.summary;
      renderTeacherDashboardSummary();
    })
    .catch((error) => {
      console.error(error);
      host.innerHTML =
        '<div class="message">Unable to load assigned classes right now.</div>';
    });
}

function renderTeacherDashboardSummary() {
  const host = document.getElementById("teacherAccountabilityCard");
  const summary = teacherDashboardSummary;
  if (!host || !summary) return;

  const assignedClasses = summary.canViewAll
    ? ["All Classes"]
    : summary.assignedClasses || [];
  const classChips = assignedClasses.length
    ? assignedClasses
        .map((grade) => `<span class="class-chip">${escapeHtml(formatGradeLabel(grade))}</span>`)
        .join("")
    : '<span class="class-chip muted">No class assigned</span>';
  const classCounts = (summary.classCounts || [])
    .map(
      (item) => `
        <div class="class-count-item">
          <span>${escapeHtml(formatGradeLabel(item.grade))}</span>
          <strong>${escapeHtml(item.count)}</strong>
          <small>${Number(item.count) === 1 ? "active child" : "active children"}</small>
        </div>
      `,
    )
    .join("");

  host.innerHTML = `
    <div class="teacher-accountability-copy">
      <span class="teacher-section-label">Class Responsibility</span>
      <h2>Your assigned classes</h2>
      <p>These are the active student groups currently connected to your teacher account.</p>
      <div class="class-chip-row">${classChips}</div>
    </div>
    <div class="teacher-accountability-total">
      <span>Active Children</span>
      <strong>${escapeHtml(summary.totalActiveStudents || 0)}</strong>
      <small>Total children under your care</small>
    </div>
    <div class="teacher-class-counts">
      ${classCounts || '<div class="class-count-item empty"><span>No active students found</span></div>'}
    </div>
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
        "fees",
        "notifications",
        "academiccalendar",
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

function renderFeesShell(user = currentUser) {
  const isAdmin = user && user.role === "Admin";
  return `
    <section class="module-header">
      <div>
        <div class="section-kicker">${isAdmin ? "Fee Management" : "Family Fee Account"}</div>
        <h1>${isAdmin ? "Fees" : "School Fees"}</h1>
        <p>${isAdmin ? "A clear view of yearly fee accounts, collections, pending balances, and payment history." : "View fee balances and payment history for your children."}</p>
      </div>
      ${isAdmin ? '<button class="primary-btn compact" id="addFeeAccountButton" type="button">Set Student Fee</button>' : ""}
    </section>
    <section class="toolbar fee-toolbar">
      ${isAdmin ? `
        <div class="field"><label for="feeSearch">Search</label><input id="feeSearch" placeholder="Student, ID, parent, class"></div>
        <div class="field"><label for="feeGradeFilter">Class</label><select id="feeGradeFilter"></select></div>
        <div class="field"><label for="feeStatusFilter">Status</label><select id="feeStatusFilter"></select></div>
      ` : ""}
      <div class="field"><label for="feeYearFilter">Academic Year</label><select id="feeYearFilter"></select></div>
    </section>
    <div id="feesHost"><div class="user-chip">Loading fee accounts...</div></div>
  `;
}

function loadFees() {
  const host = document.getElementById("feesHost");
  if (host) host.innerHTML = '<div class="user-chip">Loading fee accounts...</div>';
  api.listFees(feeState.filters)
    .then((result) => {
      if (!result.success) return renderFeesError(result.message || "Unable to load fees");
      feeState = {
        ...feeState,
        ...result,
        filters: { ...feeState.filters, academicYear: result.academicYear || feeState.filters.academicYear },
      };
      bindFeeFilters();
      renderFees();
    })
    .catch((error) => {
      console.error(error);
      renderFeesError("Unable to load fee information");
    });
}

function bindFeeFilters() {
  populateSelect("feeGradeFilter", feeState.grades, "All classes", feeState.filters.grade);
  populateSelect("feeStatusFilter", feeState.statuses, "All statuses", feeState.filters.status);
  populateSelect("feeYearFilter", feeState.academicYears, "Academic year", feeState.filters.academicYear);
  const search = document.getElementById("feeSearch");
  if (search) {
    search.value = feeState.filters.search;
    search.oninput = debounce((event) => {
      feeState.filters.search = event.target.value;
      loadFees();
    }, 280);
  }
  const grade = document.getElementById("feeGradeFilter");
  if (grade) grade.onchange = (event) => { feeState.filters.grade = event.target.value; loadFees(); };
  const status = document.getElementById("feeStatusFilter");
  if (status) status.onchange = (event) => { feeState.filters.status = event.target.value; loadFees(); };
  const year = document.getElementById("feeYearFilter");
  if (year) year.onchange = (event) => { feeState.filters.academicYear = event.target.value; loadFees(); };
  const addButton = document.getElementById("addFeeAccountButton");
  if (addButton) addButton.onclick = () => openFeeAccountForm();
}

function renderFees() {
  const host = document.getElementById("feesHost");
  if (!host) return;
  const summary = feeState.summary || {};
  const accounts = feeState.fees || [];
  host.innerHTML = `
    <section class="financial-summary-grid">
      ${renderFinancialMetric("Yearly Fees", formatCurrency(summary.total), "Total assigned")}
      ${renderFinancialMetric("Collected", formatCurrency(summary.paid), "Payments received", "positive")}
      ${renderFinancialMetric("Pending", formatCurrency(summary.due), `${summary.pendingAccounts || 0} account${Number(summary.pendingAccounts) === 1 ? "" : "s"}`, summary.due > 0 ? "warning" : "positive")}
      ${renderFinancialMetric("Academic Year", feeState.filters.academicYear || "Not set", "Current view")}
    </section>
    ${accounts.length ? `<section class="fee-account-grid">${accounts.map(renderFeeAccountCard).join("")}</section>` : `
      <section class="empty-state"><h2>No fee accounts found</h2><p>${feeState.permissions.canManage ? "Set a yearly fee for a student to begin tracking payments." : "No fee information is available for this academic year."}</p></section>
    `}
  `;
  document.querySelectorAll("[data-fee-details]").forEach((button) => {
    button.onclick = () => openFeeDetails(button.dataset.feeDetails);
  });
  document.querySelectorAll("[data-fee-edit]").forEach((button) => {
    button.onclick = () => openFeeAccountForm(feeState.fees.find((item) => item.StudentID === button.dataset.feeEdit));
  });
  document.querySelectorAll("[data-fee-payment]").forEach((button) => {
    button.onclick = () => openFeePaymentForm(feeState.fees.find((item) => item.StudentID === button.dataset.feePayment));
  });
}

function renderFinancialMetric(label, value, note, tone = "") {
  return `<article class="financial-metric ${tone}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></article>`;
}

function renderFeeAccountCard(fee) {
  const paidPercent = fee.TotalFees > 0 ? Math.min(100, Math.round((fee.PaidAmount / fee.TotalFees) * 100)) : 0;
  return `
    <article class="fee-account-card ${String(fee.Status || "").toLowerCase()}">
      <div class="fee-account-head">
        ${renderStudentAvatar({ ...fee, Name: fee.StudentName }, "fee-student-avatar")}
        <div><span>${escapeHtml(fee.StudentID)}</span><h2>${escapeHtml(fee.StudentName || "Student")}</h2><p>${escapeHtml(formatGradeLabel(fee.Grade))}</p></div>
        <span class="status-pill ${fee.Status === "Paid" ? "active" : fee.Status === "Partial" ? "halfday" : "inactive"}">${escapeHtml(fee.Status)}</span>
      </div>
      <div class="fee-progress" aria-label="${paidPercent}% of fees paid"><span style="width:${paidPercent}%"></span></div>
      <div class="fee-amounts">
        <div><small>Total</small><strong>${formatCurrency(fee.TotalFees)}</strong></div>
        <div><small>Paid</small><strong>${formatCurrency(fee.PaidAmount)}</strong></div>
        <div><small>Pending</small><strong>${formatCurrency(fee.DueAmount)}</strong></div>
      </div>
      <div class="fee-card-foot">
        <span>${fee.LastPaymentDate ? `Last payment ${escapeHtml(formatFriendlyDate(fee.LastPaymentDate))}` : "No payment recorded"}${fee.DueDate && fee.DueAmount > 0 ? ` · Due ${escapeHtml(formatFriendlyDate(fee.DueDate))}` : ""}</span>
        <div class="fee-actions">
          <button class="text-btn" type="button" data-fee-details="${escapeHtml(fee.StudentID)}">Payment history</button>
          ${feeState.permissions.canManage ? `<button class="text-btn" type="button" data-fee-edit="${escapeHtml(fee.StudentID)}">Edit fee</button>` : ""}
          ${feeState.permissions.canRecordPayment && fee.DueAmount > 0 ? `<button class="primary-btn compact" type="button" data-fee-payment="${escapeHtml(fee.StudentID)}">Record payment</button>` : ""}
        </div>
      </div>
    </article>
  `;
}

function openFeeDetails(studentId) {
  const fee = feeState.fees.find((item) => item.StudentID === studentId);
  if (!fee) return;
  const transactions = feeState.transactions.filter((item) => item.StudentID === studentId);
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <section class="student-detail-modal fee-detail-modal" role="dialog" aria-modal="true" aria-labelledby="feeDetailTitle">
      <div class="form-head"><div><span class="section-kicker">Payment History</span><h2 id="feeDetailTitle">${escapeHtml(fee.StudentName || fee.StudentID)}</h2><p>${escapeHtml(feeState.filters.academicYear)}</p></div><button class="icon-btn" type="button" data-close-modal>X</button></div>
      <div class="fee-detail-balance"><span>Pending balance</span><strong>${formatCurrency(fee.DueAmount)}</strong></div>
      <div class="receipt-list">
        ${transactions.length ? transactions.map((transaction) => `
          <article><div><strong>${formatCurrency(transaction.Amount)}</strong><span>${escapeHtml(formatFriendlyDate(transaction.PaymentDate))}</span></div><div><span>${escapeHtml(transaction.Mode)}</span><small>${escapeHtml(transaction.TransactionID)}${transaction.Remarks ? ` · ${escapeHtml(transaction.Remarks)}` : ""}</small></div></article>
        `).join("") : '<div class="muted-text">No payments have been recorded for this academic year.</div>'}
      </div>
    </section>
  `;
  document.body.appendChild(modal);
  bindSimpleModal(modal);
}

function openFeeAccountForm(fee = {}) {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  const selectedYear = fee.AcademicYear || feeState.filters.academicYear || feeState.academicYears[0] || "";
  modal.innerHTML = `
    <form class="student-form compact-form" id="feeAccountForm">
      <div class="form-head"><div><span class="section-kicker">${fee.StudentID ? "Update Fee" : "New Fee Account"}</span><h2>${fee.StudentID ? escapeHtml(fee.StudentName) : "Set yearly fee"}</h2></div><button class="icon-btn" type="button" data-close-modal>X</button></div>
      <div class="field"><label for="feeStudentId">Student</label><select id="feeStudentId" name="StudentID" ${fee.StudentID ? "disabled" : ""} required>${feeState.students.map((student) => `<option value="${escapeHtml(student.StudentID)}" ${student.StudentID === fee.StudentID ? "selected" : ""}>${escapeHtml(student.Name)} · ${escapeHtml(formatGradeLabel(student.Grade))} · ${escapeHtml(student.StudentID)}</option>`).join("")}</select></div>
      ${fee.StudentID ? `<input type="hidden" name="StudentID" value="${escapeHtml(fee.StudentID)}">` : ""}
      <div class="form-grid"><div class="field"><label for="feeAcademicYear">Academic Year</label><select id="feeAcademicYear" name="AcademicYear" required>${feeState.academicYears.map((year) => `<option value="${escapeHtml(year)}" ${year === selectedYear ? "selected" : ""}>${escapeHtml(year)}</option>`).join("")}</select></div><div class="field"><label for="feeTotalAmount">Total yearly fee</label><input id="feeTotalAmount" name="TotalFees" type="number" min="1" step="1" value="${escapeHtml(fee.TotalFees || "")}" required></div></div>
      <div class="field"><label for="feeDueDate">Payment due date</label><input id="feeDueDate" name="DueDate" type="date" value="${escapeHtml(fee.DueDate || "")}"><small class="field-hint">Optional. Accounts with a pending balance after this date are shown as overdue.</small></div>
      ${fee.PaidAmount ? `<div class="form-note">Already paid: <strong>${formatCurrency(fee.PaidAmount)}</strong>. The yearly fee cannot be set below this amount.</div>` : ""}
      <button class="primary-btn" id="saveFeeAccountButton" type="submit">Save Fee Account</button><div class="message" id="feeAccountMessage"></div>
    </form>
  `;
  document.body.appendChild(modal);
  bindSimpleModal(modal);
  modal.querySelector("form").onsubmit = submitFeeAccount;
}

function submitFeeAccount(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = document.getElementById("saveFeeAccountButton");
  const message = document.getElementById("feeAccountMessage");
  const data = Object.fromEntries(new FormData(form).entries());
  button.disabled = true; button.textContent = "Saving..."; message.textContent = "";
  api.saveFeeAccount(data).then((result) => {
    if (!result.success) { button.disabled = false; button.textContent = "Save Fee Account"; message.textContent = result.message || "Unable to save fee account"; return; }
    form.closest(".modal-backdrop").remove(); loadFees();
  }).catch((error) => { console.error(error); button.disabled = false; button.textContent = "Save Fee Account"; message.textContent = "Unable to save fee account"; });
}

function openFeePaymentForm(fee) {
  if (!fee) return;
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <form class="student-form compact-form" id="feePaymentForm">
      <div class="form-head"><div><span class="section-kicker">Record Payment</span><h2>${escapeHtml(fee.StudentName)}</h2><p>Pending ${formatCurrency(fee.DueAmount)}</p></div><button class="icon-btn" type="button" data-close-modal>X</button></div>
      <input type="hidden" name="StudentID" value="${escapeHtml(fee.StudentID)}"><input type="hidden" name="AcademicYear" value="${escapeHtml(fee.AcademicYear)}">
      <div class="form-grid"><div class="field"><label for="paymentAmount">Amount received</label><input id="paymentAmount" name="Amount" type="number" min="1" max="${escapeHtml(fee.DueAmount)}" step="1" required></div><div class="field"><label for="paymentDate">Payment date</label><input id="paymentDate" name="PaymentDate" type="date" max="${getTodayDate()}" value="${getTodayDate()}" required></div></div>
      <div class="field"><label for="paymentMode">Payment mode</label><select id="paymentMode" name="Mode" required>${feeState.paymentModes.map((mode) => `<option value="${escapeHtml(mode)}">${escapeHtml(mode)}</option>`).join("")}</select></div>
      <div class="field"><label for="paymentRemarks">Remarks or reference number</label><input id="paymentRemarks" name="Remarks" maxlength="150" placeholder="Optional"></div>
      <div class="form-note">Confirm the student, amount, and payment mode carefully. Payments are preserved as financial history.</div>
      <button class="primary-btn" id="recordFeePaymentButton" type="submit">Record Payment</button><div class="message" id="feePaymentMessage"></div>
    </form>
  `;
  document.body.appendChild(modal); bindSimpleModal(modal); modal.querySelector("form").onsubmit = submitFeePayment;
}

function submitFeePayment(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const button = document.getElementById("recordFeePaymentButton");
  const message = document.getElementById("feePaymentMessage");
  if (!window.confirm(`Record a payment of ${formatCurrency(data.Amount)} for ${data.StudentID}?`)) return;
  button.disabled = true; button.textContent = "Recording..."; message.textContent = "";
  api.recordFeePayment(data).then((result) => {
    if (!result.success) { button.disabled = false; button.textContent = "Record Payment"; message.textContent = result.message || "Unable to record payment"; return; }
    form.closest(".modal-backdrop").remove(); loadFees();
  }).catch((error) => { console.error(error); button.disabled = false; button.textContent = "Record Payment"; message.textContent = "Unable to record payment"; });
}

function renderFeesError(message) {
  const host = document.getElementById("feesHost");
  if (host) host.innerHTML = `<div class="message">${escapeHtml(message)}</div>`;
}

function renderNotificationsShell(user = currentUser) {
  const isAdmin = user && user.role === "Admin";
  return `
    <section class="module-header">
      <div><div class="section-kicker">School Communication</div><h1>Notifications</h1><p>${isAdmin ? "Create clear school notices and publish them to the right families or staff." : "Important notices and timely updates from Pinnacle Upper Primary School."}</p></div>
      ${isAdmin ? '<button class="primary-btn compact" id="composeNotificationButton" type="button">Create Notice</button>' : ""}
    </section>
    <section class="toolbar notification-toolbar">
      <div class="field"><label for="notificationSearch">Search notices</label><input id="notificationSearch" placeholder="Title or message"></div>
      ${isAdmin ? '<div class="field"><label for="notificationAudienceFilter">Audience</label><select id="notificationAudienceFilter"></select></div><div class="field"><label for="notificationStatusFilter">Status</label><select id="notificationStatusFilter"></select></div>' : ""}
    </section>
    <div id="notificationsHost"><div class="user-chip">Loading school notices...</div></div>
  `;
}

function loadNotifications() {
  api.listNotifications(notificationState.filters).then((result) => {
    if (!result.success) return renderNotificationsError(result.message || "Unable to load notifications");
    notificationState = { ...notificationState, ...result, filters: notificationState.filters };
    bindNotificationFilters(); renderNotifications();
  }).catch((error) => { console.error(error); renderNotificationsError("Unable to load school notices"); });
}

function bindNotificationFilters() {
  populateSelect("notificationAudienceFilter", notificationState.audiences, "All audiences", notificationState.filters.audience);
  populateSelect("notificationStatusFilter", notificationState.statuses, "All statuses", notificationState.filters.status);
  const search = document.getElementById("notificationSearch");
  if (search) { search.value = notificationState.filters.search; search.oninput = debounce((event) => { notificationState.filters.search = event.target.value; loadNotifications(); }, 280); }
  const audience = document.getElementById("notificationAudienceFilter");
  if (audience) audience.onchange = (event) => { notificationState.filters.audience = event.target.value; loadNotifications(); };
  const status = document.getElementById("notificationStatusFilter");
  if (status) status.onchange = (event) => { notificationState.filters.status = event.target.value; loadNotifications(); };
  const compose = document.getElementById("composeNotificationButton");
  if (compose) compose.onclick = () => openNotificationForm();
}

function renderNotifications() {
  const host = document.getElementById("notificationsHost");
  if (!host) return;
  const items = notificationState.notifications || [];
  host.innerHTML = items.length ? `<section class="notice-feed">${items.map(renderNotificationCard).join("")}</section>` : '<section class="empty-state"><h2>No notices found</h2><p>There are no school notices matching this view.</p></section>';
  document.querySelectorAll("[data-edit-notification]").forEach((button) => { button.onclick = () => openNotificationForm(items.find((item) => item.NotificationID === button.dataset.editNotification)); });
  document.querySelectorAll("[data-archive-notification]").forEach((button) => { button.onclick = () => archiveNotificationItem(button.dataset.archiveNotification); });
}

function renderNotificationCard(notification) {
  const priority = String(notification.Priority || "Normal").toLowerCase();
  return `
    <article class="notice-feed-card priority-${priority}">
      <div class="notice-date-tile"><strong>${escapeHtml(getDateDay(notification.PublishDate))}</strong><span>${escapeHtml(getDateMonth(notification.PublishDate))}</span></div>
      <div class="notice-content">
        <div class="notice-meta"><span class="notice-priority">${escapeHtml(notification.Priority || "Normal")}</span><span>${escapeHtml(notification.TargetLabel || notification.Audience)}</span>${notification.Status !== "Published" ? `<span class="status-pill inactive">${escapeHtml(notification.Status)}</span>` : ""}</div>
        <h2>${escapeHtml(notification.Title)}</h2><p>${escapeHtml(notification.Message)}</p>
        ${notification.ExpiryDate ? `<small>Visible until ${escapeHtml(formatFriendlyDate(notification.ExpiryDate))}</small>` : ""}
      </div>
      ${notificationState.permissions.canManage && !notification.Legacy ? `<div class="notice-actions"><button class="text-btn" type="button" data-edit-notification="${escapeHtml(notification.NotificationID)}">Edit</button>${notification.Status !== "Archived" ? `<button class="text-btn danger" type="button" data-archive-notification="${escapeHtml(notification.NotificationID)}">Archive</button>` : ""}</div>` : ""}
    </article>
  `;
}

function openNotificationForm(notification = {}) {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <form class="student-form notice-form" id="notificationForm">
      <div class="form-head"><div><span class="section-kicker">${notification.NotificationID ? "Edit Notice" : "New Notice"}</span><h2>${notification.NotificationID ? escapeHtml(notification.Title) : "Create a school notice"}</h2></div><button class="icon-btn" type="button" data-close-modal>X</button></div>
      <input type="hidden" name="NotificationID" value="${escapeHtml(notification.NotificationID || "")}">
      <div class="field"><label for="noticeTitle">Title</label><input id="noticeTitle" name="Title" maxlength="100" value="${escapeHtml(notification.Title || "")}" required></div>
      <div class="field"><label for="noticeMessage">Message</label><textarea id="noticeMessage" name="Message" rows="5" maxlength="700" required>${escapeHtml(notification.Message || "")}</textarea><small class="field-hint">Keep the notice clear, complete, and easy to understand.</small></div>
      <div class="form-grid"><div class="field"><label for="noticeAudience">Audience</label><select id="noticeAudience" name="Audience">${notificationState.audiences.map((item) => `<option value="${escapeHtml(item)}" ${item === (notification.Audience || "All") ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select></div><div id="notificationTargetHost"></div></div>
      <div class="form-grid"><div class="field"><label for="noticePriority">Priority</label><select id="noticePriority" name="Priority">${notificationState.priorities.map((item) => `<option value="${escapeHtml(item)}" ${item === (notification.Priority || "Normal") ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select></div><div class="field"><label for="noticeStatus">Publication</label><select id="noticeStatus" name="SentStatus"><option value="Draft" ${notification.Status === "Draft" ? "selected" : ""}>Save as draft</option><option value="Published" ${notification.Status !== "Draft" && notification.Status !== "Archived" ? "selected" : ""}>Publish</option></select></div></div>
      <div class="form-grid"><div class="field"><label for="noticeDate">Publish date</label><input id="noticeDate" name="Date" type="date" value="${escapeHtml(notification.PublishDate || getTodayDate())}" required></div><div class="field"><label for="noticeExpiry">Expiry date</label><input id="noticeExpiry" name="ExpiryDate" type="date" value="${escapeHtml(notification.ExpiryDate || "")}"></div></div>
      <button class="primary-btn" id="saveNotificationButton" type="submit">Save Notice</button><div class="message" id="notificationFormMessage"></div>
    </form>
  `;
  document.body.appendChild(modal); bindSimpleModal(modal);
  const audience = modal.querySelector("#noticeAudience");
  const refreshTarget = () => renderNotificationTarget(audience.value, notification.TargetValue || "");
  audience.onchange = () => renderNotificationTarget(audience.value, "");
  refreshTarget();
  modal.querySelector("form").onsubmit = submitNotificationForm;
}

function renderNotificationTarget(audience, selectedValue) {
  const host = document.getElementById("notificationTargetHost");
  if (!host) return;
  if (audience === "Grade") {
    host.innerHTML = `<div class="field"><label for="noticeTarget">Class</label><select id="noticeTarget" name="TargetValue" required>${notificationState.grades.map((grade) => `<option value="${escapeHtml(grade)}" ${grade === selectedValue ? "selected" : ""}>${escapeHtml(formatGradeLabel(grade))}</option>`).join("")}</select></div>`;
  } else if (audience === "Student") {
    host.innerHTML = `<div class="field"><label for="noticeTarget">Student</label><select id="noticeTarget" name="TargetValue" required>${notificationState.students.map((student) => `<option value="${escapeHtml(student.StudentID)}" ${student.StudentID === selectedValue ? "selected" : ""}>${escapeHtml(student.Name)} · ${escapeHtml(formatGradeLabel(student.Grade))}</option>`).join("")}</select></div>`;
  } else {
    host.innerHTML = '<div class="audience-note">The notice will be visible to the selected audience.</div>';
  }
}

function submitNotificationForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const button = document.getElementById("saveNotificationButton");
  const message = document.getElementById("notificationFormMessage");
  button.disabled = true; button.textContent = data.SentStatus === "Published" ? "Publishing..." : "Saving..."; message.textContent = "";
  api.saveNotification(data).then((result) => {
    if (!result.success) { button.disabled = false; button.textContent = "Save Notice"; message.textContent = result.message || "Unable to save notice"; return; }
    form.closest(".modal-backdrop").remove(); loadNotifications();
  }).catch((error) => { console.error(error); button.disabled = false; button.textContent = "Save Notice"; message.textContent = "Unable to save notice"; });
}

function archiveNotificationItem(notificationId) {
  if (!window.confirm("Archive this notice? It will no longer be visible to parents or teachers.")) return;
  api.archiveNotification(notificationId).then((result) => result.success ? loadNotifications() : renderNotificationsError(result.message || "Unable to archive notice")).catch(() => renderNotificationsError("Unable to archive notice"));
}

function renderNotificationsError(message) {
  const host = document.getElementById("notificationsHost");
  if (host) host.innerHTML = `<div class="message">${escapeHtml(message)}</div>`;
}

function renderAcademicCalendarShell(user = currentUser) {
  const isAdmin = user && user.role === "Admin";
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (!calendarState.filters.month) calendarState.filters.month = currentMonth;
  return `
    <section class="module-header">
      <div><div class="section-kicker">School Year Planner</div><h1>Academic Calendar</h1><p>${isAdmin ? "Plan holidays, school events, exams, meetings, activities, and important deadlines." : "Keep track of holidays, events, and important dates throughout the school year."}</p></div>
      ${isAdmin ? '<button class="primary-btn compact" id="addCalendarEventButton" type="button">Add Calendar Entry</button>' : ""}
    </section>
    <section class="toolbar calendar-toolbar"><div class="field"><label for="calendarMonthFilter">Month</label><input id="calendarMonthFilter" type="month" value="${escapeHtml(calendarState.filters.month)}"></div><div class="field"><label for="calendarTypeFilter">Type</label><select id="calendarTypeFilter"></select></div><div class="field"><label for="calendarYearFilter">Academic Year</label><select id="calendarYearFilter"></select></div></section>
    <div id="calendarHost"><div class="user-chip">Loading academic calendar...</div></div>
  `;
}

function loadAcademicCalendar() {
  api.listAcademicCalendar(calendarState.filters).then((result) => {
    if (!result.success) return renderCalendarError(result.message || "Unable to load calendar");
    calendarState = { ...calendarState, ...result, filters: { ...calendarState.filters, academicYear: result.academicYear || calendarState.filters.academicYear } };
    bindCalendarFilters(); renderAcademicCalendar();
  }).catch((error) => { console.error(error); renderCalendarError("Unable to load the academic calendar"); });
}

function bindCalendarFilters() {
  populateSelect("calendarTypeFilter", calendarState.dayTypes, "All types", calendarState.filters.dayType);
  populateSelect("calendarYearFilter", calendarState.academicYears, "Academic year", calendarState.filters.academicYear);
  const month = document.getElementById("calendarMonthFilter");
  if (month) month.onchange = (event) => { calendarState.filters.month = event.target.value; loadAcademicCalendar(); };
  const type = document.getElementById("calendarTypeFilter");
  if (type) type.onchange = (event) => { calendarState.filters.dayType = event.target.value; loadAcademicCalendar(); };
  const year = document.getElementById("calendarYearFilter");
  if (year) year.onchange = (event) => { calendarState.filters.academicYear = event.target.value; loadAcademicCalendar(); };
  const add = document.getElementById("addCalendarEventButton");
  if (add) add.onclick = () => openCalendarEventForm();
}

function renderAcademicCalendar() {
  const host = document.getElementById("calendarHost");
  if (!host) return;
  const events = calendarState.events || [];
  const summary = calendarState.summary || {};
  host.innerHTML = `
    <section class="calendar-summary-grid">
      ${renderFinancialMetric("Entries", summary.total || 0, "In this view")}
      ${renderFinancialMetric("Upcoming", summary.upcoming || 0, "Published dates ahead", "positive")}
      ${renderFinancialMetric("Holidays", summary.holidays || 0, "Attendance disabled", "holiday")}
    </section>
    ${events.length ? `<section class="calendar-agenda">${events.map(renderCalendarEventCard).join("")}</section>` : '<section class="empty-state"><h2>No dates scheduled</h2><p>No calendar entries match the selected month and type.</p></section>'}
  `;
  document.querySelectorAll("[data-edit-calendar]").forEach((button) => { button.onclick = () => openCalendarEventForm(events.find((item) => item.EventID === button.dataset.editCalendar)); });
  document.querySelectorAll("[data-archive-calendar]").forEach((button) => { button.onclick = () => archiveCalendarItem(button.dataset.archiveCalendar); });
}

function renderCalendarEventCard(event) {
  const typeClass = String(event.DayType || "event").toLowerCase();
  const dateRange = event.EndDate && event.EndDate !== event.Date ? `${formatFriendlyDate(event.Date)} – ${formatFriendlyDate(event.EndDate)}` : formatFriendlyDate(event.Date);
  return `
    <article class="calendar-event-card type-${typeClass}">
      <div class="calendar-date-block"><strong>${escapeHtml(getDateDay(event.Date))}</strong><span>${escapeHtml(getDateMonth(event.Date))}</span><small>${escapeHtml(getDateWeekday(event.Date))}</small></div>
      <div class="calendar-event-content"><div class="calendar-event-meta"><span class="calendar-type-badge">${escapeHtml(event.DayType)}</span><span>${escapeHtml(event.TargetLabel || event.Audience)}</span>${event.Status !== "Published" ? `<span class="status-pill inactive">${escapeHtml(event.Status)}</span>` : ""}</div><h2>${escapeHtml(event.Title)}</h2><p>${escapeHtml(event.Note || "School calendar entry")}</p><small>${escapeHtml(dateRange)} · ${escapeHtml(event.AcademicYear)}</small>${event.DayType === "Holiday" && event.Status === "Published" ? '<div class="attendance-link-note">Attendance is disabled for this date range.</div>' : ""}</div>
      ${calendarState.permissions.canManage && !event.Legacy ? `<div class="notice-actions"><button class="text-btn" type="button" data-edit-calendar="${escapeHtml(event.EventID)}">Edit</button>${event.Status !== "Archived" ? `<button class="text-btn danger" type="button" data-archive-calendar="${escapeHtml(event.EventID)}">Archive</button>` : ""}</div>` : event.ManagedInSettings && calendarState.permissions.canManage ? '<span class="managed-label">Managed in Settings</span>' : ""}
    </article>
  `;
}

function openCalendarEventForm(event = {}) {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  const selectedYear = event.AcademicYear || calendarState.filters.academicYear || calendarState.academicYears[0] || "";
  modal.innerHTML = `
    <form class="student-form calendar-form" id="calendarEventForm">
      <div class="form-head"><div><span class="section-kicker">${event.EventID ? "Edit Calendar Entry" : "New Calendar Entry"}</span><h2>${event.EventID ? escapeHtml(event.Title) : "Plan an important date"}</h2></div><button class="icon-btn" type="button" data-close-modal>X</button></div>
      <input type="hidden" name="EventID" value="${escapeHtml(event.EventID || "")}">
      <div class="field"><label for="calendarTitle">Title</label><input id="calendarTitle" name="Title" maxlength="100" value="${escapeHtml(event.Title || "")}" required></div>
      <div class="form-grid"><div class="field"><label for="calendarDayType">Type</label><select id="calendarDayType" name="DayType">${calendarState.dayTypes.map((item) => `<option value="${escapeHtml(item)}" ${item === (event.DayType || "Event") ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select></div><div class="field"><label for="calendarAcademicYear">Academic Year</label><select id="calendarAcademicYear" name="AcademicYear">${calendarState.academicYears.map((year) => `<option value="${escapeHtml(year)}" ${year === selectedYear ? "selected" : ""}>${escapeHtml(year)}</option>`).join("")}</select></div></div>
      <div class="form-grid"><div class="field"><label for="calendarStartDate">Start date</label><input id="calendarStartDate" name="Date" type="date" value="${escapeHtml(event.Date || getTodayDate())}" required></div><div class="field"><label for="calendarEndDate">End date</label><input id="calendarEndDate" name="EndDate" type="date" value="${escapeHtml(event.EndDate || event.Date || getTodayDate())}" required></div></div>
      <div class="form-grid"><div class="field"><label for="calendarAudience">Audience</label><select id="calendarAudience" name="Audience">${calendarState.audiences.map((item) => `<option value="${escapeHtml(item)}" ${item === (event.Audience || "All") ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select></div><div id="calendarTargetHost"></div></div>
      <div class="field"><label for="calendarNote">Details</label><textarea id="calendarNote" name="Note" rows="4" maxlength="500">${escapeHtml(event.Note || "")}</textarea></div>
      <div class="field"><label for="calendarStatus">Publication</label><select id="calendarStatus" name="Status"><option value="Draft" ${event.Status === "Draft" ? "selected" : ""}>Save as draft</option><option value="Published" ${event.Status !== "Draft" && event.Status !== "Archived" ? "selected" : ""}>Publish</option></select></div>
      <div class="form-note calendar-holiday-guidance">Published holidays automatically disable attendance for every date in the selected range.</div>
      <button class="primary-btn" id="saveCalendarEventButton" type="submit">Save Calendar Entry</button><div class="message" id="calendarFormMessage"></div>
    </form>
  `;
  document.body.appendChild(modal); bindSimpleModal(modal);
  const audience = modal.querySelector("#calendarAudience");
  audience.onchange = () => renderCalendarTarget(audience.value, "");
  renderCalendarTarget(audience.value, event.TargetValue || "");
  modal.querySelector("form").onsubmit = submitCalendarEvent;
}

function renderCalendarTarget(audience, selectedValue) {
  const host = document.getElementById("calendarTargetHost");
  if (!host) return;
  host.innerHTML = audience === "Grade"
    ? `<div class="field"><label for="calendarTarget">Class</label><select id="calendarTarget" name="TargetValue" required>${calendarState.grades.map((grade) => `<option value="${escapeHtml(grade)}" ${grade === selectedValue ? "selected" : ""}>${escapeHtml(formatGradeLabel(grade))}</option>`).join("")}</select></div>`
    : '<div class="audience-note">The entry will be visible to the selected audience.</div>';
}

function submitCalendarEvent(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const button = document.getElementById("saveCalendarEventButton");
  const message = document.getElementById("calendarFormMessage");
  if (data.EndDate < data.Date) { message.textContent = "End date cannot be before the start date."; return; }
  button.disabled = true; button.textContent = "Saving..."; message.textContent = "";
  api.saveCalendarEvent(data).then((result) => {
    if (!result.success) { button.disabled = false; button.textContent = "Save Calendar Entry"; message.textContent = result.message || "Unable to save calendar entry"; return; }
    form.closest(".modal-backdrop").remove(); loadAcademicCalendar();
  }).catch((error) => { console.error(error); button.disabled = false; button.textContent = "Save Calendar Entry"; message.textContent = "Unable to save calendar entry"; });
}

function archiveCalendarItem(eventId) {
  if (!window.confirm("Archive this calendar entry? It will no longer be visible to families or teachers.")) return;
  api.archiveCalendarEvent(eventId).then((result) => result.success ? loadAcademicCalendar() : renderCalendarError(result.message || "Unable to archive entry")).catch(() => renderCalendarError("Unable to archive entry"));
}

function renderCalendarError(message) {
  const host = document.getElementById("calendarHost");
  if (host) host.innerHTML = `<div class="message">${escapeHtml(message)}</div>`;
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
          <p>Add sudden holidays or continuous holiday ranges. They appear in the Academic Calendar and immediately disable attendance for the selected dates.</p>
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
        <p class="password-guidance">Use at least 5 characters.</p>
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
  if (password.length < 5) return "Use at least 5 characters.";
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
    grades: user.grades || [],
    studentIds: user.studentIds || [],
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

function formatGradeLabel(value) {
  const grade = String(value || "").trim();
  if (!grade) return "Not set";
  if (grade.toLowerCase() === "all classes") return "All Classes";
  if (grade.toLowerCase() === "all") return "All Classes";
  if (grade.toLowerCase() === "nursery") return "Nursery";
  if (/^(lkg|ukg)$/i.test(grade)) return grade.toUpperCase();
  return `Class ${grade}`;
}

function normalizeTimeValue(value) {
  const cleanValue = String(value || "").trim();
  const match = cleanValue.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return cleanValue;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatFriendlyDate(value) {
  if (!value) return "Not set";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getDateDay(value) {
  const date = new Date(`${String(value || "").slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "--" : String(date.getDate()).padStart(2, "0");
}

function getDateMonth(value) {
  const date = new Date(`${String(value || "").slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
}

function getDateWeekday(value) {
  const date = new Date(`${String(value || "").slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-IN", { weekday: "short" });
}

function bindSimpleModal(modal) {
  const close = modal.querySelector("[data-close-modal]");
  if (close) close.onclick = () => modal.remove();
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.remove();
  });
}

function populateSelect(id, values, emptyLabel, selectedValue) {
  const select = document.getElementById(id);
  if (!select) return;
  const options = (values || []).map((value) =>
    `<option value="${escapeHtml(value)}" ${String(value) === String(selectedValue || "") ? "selected" : ""}>${escapeHtml(value)}</option>`,
  );
  select.innerHTML = `<option value="">${escapeHtml(emptyLabel)}</option>${options.join("")}`;
  if (selectedValue) select.value = selectedValue;
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
