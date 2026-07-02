# JobLand Frontend

## 1. Overview
This repository contains the frontend client for the JobLand system. It provides role-based user interfaces for `admin`, `employer`, and `seeker` users and consumes REST APIs from the backend service.

## 2. Technology Stack
- React (Create React App)
- React Router
- Axios
- Bootstrap and custom CSS

## 3. Functional Scope
- Authentication: login and registration
- Role-based protected routing
- Seeker dashboard and profile management
- Job application workflow
- Admin dashboard
- User management
- Job approval and moderation
- Application status monitoring
- Platform analytics overview

## 4. Setup and Execution
1. Install dependencies:
```bash
npm install
```
2. Run development server:
```bash
npm start
```
3. Build for production:
```bash
npm run build
```

Default local URL: `http://localhost:3000`

## 5. Backend Dependency
The frontend expects the backend API to be available at:
- `http://localhost:5000/api`

If the backend base URL changes, update service files under `src/services/`.

## 6. Project Structure (Summary)
```text
src/
  components/   # UI components and dashboards
  pages/        # Page-level views
  services/     # API integration modules
  styles/       # Global and feature CSS
```

## 7. Academic Note
This frontend is designed as the presentation layer of a role-based job portal architecture and should be evaluated with the backend as an integrated full-stack system.
