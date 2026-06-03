# Pinnacle ERP - Phase 2 Authentication & RBAC

This project contains the Phase 2 UI and Apps Script backend foundation for Pinnacle Upper Primary School ERP.

## Local UI Testing

Open `index.html` with VS Code Live Server.

Mock login users:

- Admin: `admin` / `admin123`
- Teacher: `teacher` / `teacher123`
- Parent: `parent` / `parent123`

The local UI uses `scripts.js` mock functions instead of `google.script.run`, so login, session persistence, dashboard redirects, access denied, and logout can be tested before connecting to Apps Script.
The sidebar hides `Settings` for Teacher and Parent users. Only Admin users can see it.

The Apps Script deployment URL is stored in `scripts.js` as `SCRIPT_URL` for the next integration step:

`https://script.google.com/macros/s/AKfycbyZ0wz-gdI0yFFDZOUUit9PPZTSRzCmMHyojKU_GPZvZnD4zU-Jafh7Ik1gCOaHvSbl/exec`

## Apps Script Backend

The `.gs` files implement Phase 2 plus Phase 3 Student Management:

- Single login page for Admin, Teacher, and Parent users.
- Authentication against the existing Google Sheet tabs: `AdminUsers`, `Teachers`, and `Parents`.
- Role detection and dashboard routing.
- Server-side session token storage with expiry.
- Protected Admin, Teacher, and Parent placeholder dashboards.
- Logout and access-denied handling.
- Student Management using the existing `Students` sheet.
- Admin can add, edit, and deactivate students.
- Teacher can view students in assigned grades only.
- Parent can view only matching child records through `Parents.StudentID`.
- Admin can add, edit, and deactivate teachers.
- Teacher grade assignment uses comma-separated values in `Teachers.Grade`, for example `3,4,5`.
- Password comparison supports future hashed passwords with the `sha256:` prefix while existing plain-text passwords continue to work during migration.
- Admin Settings includes academic year fields, attendance timings, and special holiday entries.
- Special holidays are stored in the existing `Settings` sheet under the `SpecialHolidays` key as JSON.
- Future-ready navigation placeholders for modules not implemented yet.

The project uses the existing spreadsheet ID from the provided Pinnacle ERP database and does not add or redesign sheets.
