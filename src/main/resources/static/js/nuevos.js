document.addEventListener('DOMContentLoaded', function () {
  if (!window.Auth || !window.Auth.ensureAccess(['ROLE_EDITOR', 'ROLE_ADMIN'])) {
    return;
  }

  var pageContent = document.getElementById('nuevosPageContent');
  var form = document.getElementById('autoForm');
  var clearBtn = document.getElementById('clearBtn');
  var saveAlert = document.getElementById('saveAlert');
  var API_URL = '/api/autos/with-image';

  if (pageContent) {
    pageContent.classList.remove('d-none');
  }

  if (!form || !clearBtn || !saveAlert) {
    return;
  }

  function showAlert(message, type) {
    saveAlert.className = 'alert mt-4 alert-' + type;
    saveAlert.textContent = message;
    saveAlert.classList.remove('d-none');
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

      var response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + window.Auth.getToken(),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      await response.json();
      showAlert('Auto guardado correctamente en la base de datos.', 'success');
      form.reset();
      form.classList.remove('was-validated');
    } catch (error) {
      if (error.message === 'HTTP 401' || error.message === 'HTTP 403') {
        window.Auth.logout();
        window.Auth.redirectToLogin('nuevos.html');
        return;
      }
      showAlert('No se pudo guardar el auto. Revisa backend y vuelve a intentar.', 'danger');
    }

    setTimeout(function () {
      saveAlert.classList.add('d-none');
    }, 2500);
  });

  clearBtn.addEventListener('click', function () {
    form.reset();
    form.classList.remove('was-validated');
  });
});
