document.addEventListener('DOMContentLoaded', function () {
  if (!window.Auth) {
    return;
  }

  if (window.Auth.isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  var form = document.getElementById('registerForm');
  var alertBox = document.getElementById('registerAlert');
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
      await window.Auth.register({
        firstName: form.firstName.value.trim(),
        lastName: form.lastName.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value,
      });

      form.reset();
      form.classList.remove('was-validated');
      showAlert('Cuenta creada correctamente. Quedo pendiente de aprobacion administrativa.', 'success');
    } catch (error) {
      showAlert('No se pudo crear la cuenta. Revisa si el correo ya existe.', 'danger');
    }
  });
});
