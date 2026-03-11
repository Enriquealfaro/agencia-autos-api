window.PendingUsersPanel = (function () {
  function create(options) {
    if (!window.Auth || !window.Auth.isAdmin()) {
      return {
        init: function () {},
        reload: function () {},
      };
    }

    var listRoot = document.getElementById(options.listId);
    var countRoot = document.getElementById(options.countId);
    var alertBox = document.getElementById(options.alertId);
    var sectionRoot = options.sectionId ? document.getElementById(options.sectionId) : null;
    var loginReturnTo = options.loginReturnTo || 'admin-usuarios.html';

    function showSection() {
      if (sectionRoot) {
        sectionRoot.classList.remove('d-none');
      }
    }

    function hasRequiredNodes() {
      return !!listRoot && !!countRoot && !!alertBox;
    }

    function getAuthHeaders() {
      return {
        Authorization: 'Bearer ' + window.Auth.getToken(),
      };
    }

    function showAlert(message, type) {
      alertBox.className = 'alert mt-4 alert-' + type;
      alertBox.textContent = message;
      alertBox.classList.remove('d-none');
      setTimeout(function () {
        alertBox.classList.add('d-none');
      }, 3000);
    }

    function handleAuthError(statusCode) {
      if (statusCode === 401 || statusCode === 403) {
        window.Auth.logout();
        window.Auth.redirectToLogin(loginReturnTo);
        return true;
      }
      return false;
    }

    function renderUsers(users) {
      countRoot.textContent = users.length + (users.length === 1 ? ' pendiente' : ' pendientes');

      if (!users || users.length === 0) {
        listRoot.innerHTML = '<div class="text-center py-5 text-secondary">No hay usuarios pendientes por revisar.</div>';
        return;
      }

      listRoot.innerHTML = users
        .map(function (user) {
          var fullName = ((user.firstName || '') + ' ' + (user.lastName || '')).trim() || user.login;
          var authorities = Array.isArray(user.authorities) && user.authorities.length > 0 ? user.authorities.join(', ') : 'Sin roles';

          return (
            '<article class="admin-user-card">' +
            '<div class="admin-user-card-header">' +
            '<div>' +
            '<h2 class="h5 mb-1">' +
            fullName +
            '</h2>' +
            '<p class="text-secondary mb-0 small">' +
            (user.email || '') +
            '</p>' +
            '</div>' +
            '<span class="badge text-bg-warning pending-status-badge">Pendiente</span>' +
            '</div>' +
            '<dl class="admin-user-meta">' +
            '<div><dt>Login</dt><dd>' +
            user.login +
            '</dd></div>' +
            '<div><dt>Estado</dt><dd>' +
            user.status +
            '</dd></div>' +
            '<div><dt>Roles</dt><dd>' +
            authorities +
            '</dd></div>' +
            '</dl>' +
            '<div class="admin-user-actions">' +
            '<button type="button" class="btn btn-sm btn-primary" data-action="approve" data-login="' +
            user.login +
            '">Aprobar</button>' +
            '<button type="button" class="btn btn-sm btn-outline-secondary" data-action="pending" data-login="' +
            user.login +
            '">En espera</button>' +
            '<button type="button" class="btn btn-sm btn-outline-danger" data-action="reject" data-login="' +
            user.login +
            '">Rechazar</button>' +
            '<button type="button" class="btn btn-sm btn-danger" data-action="delete" data-login="' +
            user.login +
            '">Eliminar</button>' +
            '</div>' +
            '</article>'
          );
        })
        .join('');
    }

    async function loadPendingUsers() {
      listRoot.innerHTML = '<div class="text-center py-5 text-secondary">Cargando usuarios pendientes...</div>';

      try {
        var response = await fetch('/api/admin/users/pending', {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          if (handleAuthError(response.status)) {
            return;
          }
          throw new Error('HTTP ' + response.status);
        }

        renderUsers(await response.json());
      } catch (error) {
        listRoot.innerHTML = '<div class="text-center py-5 text-danger">No se pudo cargar la lista de usuarios pendientes.</div>';
      }
    }

    async function updateUserStatus(login, status) {
      var response = await fetch('/api/admin/users/' + encodeURIComponent(login) + '/status?status=' + encodeURIComponent(status), {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (handleAuthError(response.status)) {
          return false;
        }
        throw new Error('HTTP ' + response.status);
      }

      return true;
    }

    async function deleteUser(login) {
      var response = await fetch('/api/admin/users/' + encodeURIComponent(login), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (handleAuthError(response.status)) {
          return false;
        }
        throw new Error('HTTP ' + response.status);
      }

      return true;
    }

    function bindEvents() {
      listRoot.addEventListener('click', async function (event) {
        var actionButton = event.target.closest('[data-action]');
        if (!actionButton) {
          return;
        }

        var login = actionButton.getAttribute('data-login');
        var action = actionButton.getAttribute('data-action');

        try {
          if (action === 'approve') {
            if (await updateUserStatus(login, 'ACTIVE')) {
              showAlert('Usuario aprobado correctamente.', 'success');
              loadPendingUsers();
            }
            return;
          }

          if (action === 'pending') {
            if (await updateUserStatus(login, 'PENDING')) {
              showAlert('El usuario permanece en espera.', 'secondary');
              loadPendingUsers();
            }
            return;
          }

          if (action === 'reject') {
            if (await updateUserStatus(login, 'REJECTED')) {
              showAlert('Usuario rechazado correctamente.', 'warning');
              loadPendingUsers();
            }
            return;
          }

          if (action === 'delete') {
            if (await deleteUser(login)) {
              showAlert('Usuario eliminado correctamente.', 'danger');
              loadPendingUsers();
            }
          }
        } catch (error) {
          showAlert('No se pudo completar la accion solicitada.', 'danger');
        }
      });
    }

    function init() {
      if (!hasRequiredNodes()) {
        return;
      }
      showSection();
      bindEvents();
      loadPendingUsers();
    }

    return {
      init: init,
      reload: loadPendingUsers,
    };
  }

  return {
    create: create,
  };
})();
