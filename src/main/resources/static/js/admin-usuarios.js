document.addEventListener('DOMContentLoaded', function () {
  if (!window.Auth || !window.Auth.ensureAccess(['ROLE_ADMIN'])) {
    return;
  }

  var pageContent = document.getElementById('adminUsersPageContent');

  if (pageContent) {
    pageContent.classList.remove('d-none');
  }

  if (!window.PendingUsersPanel) {
    return;
  }

  window.PendingUsersPanel.create({
    listId: 'pendingUsersList',
    countId: 'pendingUsersCount',
    alertId: 'userAdminAlert',
    loginReturnTo: 'admin-usuarios.html',
  }).init();
});
