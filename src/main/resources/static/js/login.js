document.addEventListener('DOMContentLoaded', function () {
  if (!window.Auth) {
    return;
  }

  if (window.Auth.isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  var form = document.getElementById('loginForm');
  var alertBox = document.getElementById('loginAlert');
  if (!form || !alertBox) {
    return;
  }

  function showAlert(message, type) {
    alertBox.className = 'alert mt-4 alert-' + type;
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    try {
      await window.Auth.login({
        email: form.email.value.trim(),
        password: form.password.value,
      });

      var params = new URLSearchParams(window.location.search);
      window.location.href = params.get('returnTo') || 'index.html';
    } catch (error) {
      showAlert('No se pudo iniciar sesion. Verifica correo y contrasena.', 'danger');
    }
  });
});
