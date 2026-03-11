document.addEventListener('DOMContentLoaded', function () {
  if (!window.Auth || !window.Auth.ensureAccess(['ROLE_EDITOR', 'ROLE_ADMIN'])) {
    return;
  }

  var pageContent = document.getElementById('nuevosPageContent');
  var form = document.getElementById('autoForm');
  var clearBtn = document.getElementById('clearBtn');
  var saveAlert = document.getElementById('saveAlert');
  var pendingList = document.getElementById('pendingList');
  var pendingCount = document.getElementById('pendingCount');
  var autoModalElement = document.getElementById('autoModal');
  var autoModal = autoModalElement ? bootstrap.Modal.getOrCreateInstance(autoModalElement) : null;
  var pendingUsersPanel = null;
  var CREATE_API_URL = '/api/autos/with-image';
  var PENDING_API_URL = '/api/autos/pending';

  if (pageContent) {
    pageContent.classList.remove('d-none');
  }

  if (!form || !clearBtn || !saveAlert || !pendingList || !pendingCount) {
    return;
  }

  if (window.PendingUsersPanel && window.Auth.isAdmin()) {
    pendingUsersPanel = window.PendingUsersPanel.create({
      sectionId: 'pendingUsersSection',
      listId: 'pendingUsersList',
      countId: 'pendingUsersCount',
      alertId: 'pendingUsersAlert',
      loginReturnTo: 'nuevos.html',
    });
    pendingUsersPanel.init();
  }

  function getAuthHeaders() {
    return {
      Authorization: 'Bearer ' + window.Auth.getToken(),
    };
  }

  function showAlert(message, type) {
    saveAlert.className = 'alert mt-4 alert-' + type;
    saveAlert.textContent = message;
    saveAlert.classList.remove('d-none');
    setTimeout(function () {
      saveAlert.classList.add('d-none');
    }, 3000);
  }

  function formatPrice(value) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  function buildStatusBadge(status) {
    if (status === 'APPROVED') {
      return '<span class="badge text-bg-success pending-status-badge">Aprobado</span>';
    }
    if (status === 'REJECTED') {
      return '<span class="badge text-bg-danger pending-status-badge">Rechazado</span>';
    }
    if (status === 'ARCHIVED') {
      return '<span class="badge text-bg-secondary pending-status-badge">Archivado</span>';
    }
    return '<span class="badge text-bg-warning pending-status-badge">Pendiente</span>';
  }

  function renderPendingList(autos) {
    pendingCount.textContent = autos.length + (autos.length === 1 ? ' pendiente' : ' pendientes');

    if (!autos || autos.length === 0) {
      pendingList.innerHTML = '<div class="text-center py-5 text-secondary">No hay autos pendientes por ahora.</div>';
      return;
    }

    pendingList.innerHTML = autos
      .map(function (auto) {
        var title = auto.marca + ' ' + auto.modelo;
        var imageBlock = auto.imagenUrl
          ? '<img class="pending-auto-image" src="' + auto.imagenUrl + '" alt="Imagen de ' + title + '">'
          : '<div class="pending-auto-image pending-auto-placeholder">Sin imagen</div>';

        return (
          '<article class="pending-auto-card">' +
          '<div class="pending-auto-media">' +
          imageBlock +
          '</div>' +
          '<div class="pending-auto-body">' +
          '<div class="d-flex flex-column flex-lg-row justify-content-between gap-3">' +
          '<div>' +
          '<div class="d-flex align-items-center gap-2 flex-wrap mb-2">' +
          '<h3 class="h5 mb-0">' +
          title +
          '</h3>' +
          buildStatusBadge(auto.status) +
          '</div>' +
          '<ul class="pending-auto-meta">' +
          '<li><strong>Anio:</strong> ' +
          auto.anio +
          '</li>' +
          '<li><strong>Color:</strong> ' +
          auto.color +
          '</li>' +
          '<li><strong>Precio:</strong> ' +
          formatPrice(auto.precio) +
          '</li>' +
          '<li><strong>Transmision:</strong> ' +
          auto.transmision +
          '</li>' +
          '</ul>' +
          '</div>' +
          '<div class="pending-auto-actions">' +
          '<button type="button" class="btn btn-sm btn-primary" data-action="approve" data-id="' +
          auto.id +
          '">Aprobar</button>' +
          '<button type="button" class="btn btn-sm btn-outline-secondary" data-action="pending" data-id="' +
          auto.id +
          '">En espera</button>' +
          '<button type="button" class="btn btn-sm btn-outline-danger" data-action="delete" data-id="' +
          auto.id +
          '">Eliminar</button>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</article>'
        );
      })
      .join('');
  }

  function handleAuthError(statusCode) {
    if (statusCode === 401 || statusCode === 403) {
      window.Auth.logout();
      window.Auth.redirectToLogin('nuevos.html');
      return true;
    }
    return false;
  }

  async function loadPendingAutos() {
    pendingList.innerHTML = '<div class="text-center py-5 text-secondary">Cargando autos pendientes...</div>';

    try {
      var response = await fetch(PENDING_API_URL, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (handleAuthError(response.status)) {
          return;
        }
        throw new Error('HTTP ' + response.status);
      }

      var autos = await response.json();
      renderPendingList(autos);
    } catch (error) {
      pendingList.innerHTML = '<div class="text-center py-5 text-danger">No se pudo cargar la lista de pendientes.</div>';
    }
  }

  async function updateAutoStatus(id, status) {
    var response = await fetch('/api/autos/' + id + '/status?status=' + encodeURIComponent(status), {
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

  async function deleteAuto(id) {
    var response = await fetch('/api/autos/' + id, {
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

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    var autoData = {
      marca: form.marca.value.trim(),
      modelo: form.modelo.value.trim(),
      color: form.color.value.trim(),
      anio: Number(form.anio.value),
      precio: Number(form.precio.value),
      transmision: form.transmision.value,
    };
    var imageFile = form.imagen.files && form.imagen.files.length > 0 ? form.imagen.files[0] : null;

    try {
      var formData = new FormData();
      formData.append('marca', autoData.marca);
      formData.append('modelo', autoData.modelo);
      formData.append('color', autoData.color);
      formData.append('anio', String(autoData.anio));
      formData.append('precio', String(autoData.precio));
      formData.append('transmision', autoData.transmision);
      if (imageFile) {
        formData.append('imagen', imageFile);
      }

      var response = await fetch(CREATE_API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        if (handleAuthError(response.status)) {
          return;
        }
        throw new Error('HTTP ' + response.status);
      }

      await response.json();
      showAlert('Auto guardado y enviado a la lista de pendientes.', 'success');
      form.reset();
      form.classList.remove('was-validated');
      if (autoModal) {
        autoModal.hide();
      }
      loadPendingAutos();
    } catch (error) {
      showAlert('No se pudo guardar el auto. Revisa backend y vuelve a intentar.', 'danger');
    }
  });

  clearBtn.addEventListener('click', function () {
    form.reset();
    form.classList.remove('was-validated');
  });

  pendingList.addEventListener('click', async function (event) {
    var actionButton = event.target.closest('[data-action]');
    if (!actionButton) {
      return;
    }

    var id = actionButton.getAttribute('data-id');
    var action = actionButton.getAttribute('data-action');

    try {
      if (action === 'approve') {
        if (await updateAutoStatus(id, 'APPROVED')) {
          showAlert('Auto aprobado correctamente.', 'success');
          loadPendingAutos();
        }
        return;
      }

      if (action === 'pending') {
        if (await updateAutoStatus(id, 'PENDING')) {
          showAlert('El auto permanece en espera.', 'secondary');
          loadPendingAutos();
        }
        return;
      }

      if (action === 'delete') {
        if (await deleteAuto(id)) {
          showAlert('Auto eliminado correctamente.', 'warning');
          loadPendingAutos();
        }
      }
    } catch (error) {
      showAlert('No se pudo completar la accion solicitada.', 'danger');
    }
  });

  loadPendingAutos();
});
