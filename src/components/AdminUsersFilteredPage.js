import React from 'react';
import AdminUserManagement from './AdminUserManagement';

/**
 * Thin wrapper to provide route-based filtering.
 * 
 * Route usage:
 *   /admin/users/active
 *   /admin/users/banned
 *   /admin/users/pending
 */
const AdminUsersFilteredPage = ({ status }) => {
  // AdminUserManagement reads querystring `status`.
  const urlStatus = status || 'active';

  // We keep AdminUserManagement logic untouched by using a deterministic querystring.
  // React Router v6 won't allow passing query to the component directly without navigation,
  // but AdminSidebar submenu already navigates via query. For this wrapper route,
  // we rely on the App router to redirect with query.
  //
  // This component is intentionally minimal.
  return <AdminUserManagement key={urlStatus} />;
};

export default AdminUsersFilteredPage;

