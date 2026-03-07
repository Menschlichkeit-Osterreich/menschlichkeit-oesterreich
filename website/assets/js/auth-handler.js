// Authentication Handler für Login/Register Forms

class AuthHandler {
  constructor() {
    this.init();
  }

  init() {
    // DOM ready check
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.bindEvents());
    } else {
      this.bindEvents();
    }
  }

  bindEvents() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', e => this.handleLogin(e));
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', e => this.handleRegister(e));
    }

    // Form Toggle Links
    const showRegisterLink = document.getElementById('showRegisterLink');
    const showLoginLink = document.getElementById('showLoginLink');

    if (showRegisterLink) {
      showRegisterLink.addEventListener('click', e => this.toggleForms(e, 'register'));
    }

    if (showLoginLink) {
      showLoginLink.addEventListener('click', e => this.toggleForms(e, 'login'));
    }

    // Password Visibility Toggle
    this.initPasswordToggle('toggleLoginPassword', 'loginPassword');
    this.initPasswordToggle('toggleRegisterPassword', 'registerPassword');

    // Password Strength Checker
    const registerPassword = document.getElementById('registerPassword');
    if (registerPassword) {
      registerPassword.addEventListener('input', () => this.checkPasswordStrength());
      registerPassword.addEventListener('keyup', () => this.validatePasswordMatch());
    }

    // Password Confirmation Validation
    const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
    if (registerPasswordConfirm) {
      registerPasswordConfirm.addEventListener('input', () => this.validatePasswordMatch());
      registerPasswordConfirm.addEventListener('keyup', () => this.validatePasswordMatch());
    }

    // Check if already logged in
    this.checkAuthStatus();
  }

  async handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validation
    if (!this.validateEmail(email)) {
      this.showFieldError('loginEmail', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    if (!password) {
      this.showFieldError('loginPassword', 'Bitte geben Sie Ihr Passwort ein.');
      return;
    }

    // Clear previous errors
    this.clearFieldErrors();

    // Show loading state
    this.setLoadingState(form, true, 'Anmeldung läuft...');

    try {
      // API call
      const result = await window.crmApi.login(email, password);

      if (result.success) {
        this.showAlert('Erfolgreich angemeldet!', 'success');

        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem('remember_me', 'true');
        } else {
          localStorage.removeItem('remember_me');
        }

        // Redirect to member area
        setTimeout(() => {
          window.location.href = 'member-area.html';
        }, 1000);
      } else {
        this.showAlert(result.error, 'danger');
      }
    } catch (error) {
      this.showAlert(
        'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
        'danger'
      );
    } finally {
      this.setLoadingState(form, false);
    }
  }

  async handleRegister(event) {
    event.preventDefault();

    const form = event.target;
    const firstName = document.getElementById('registerFirstName').value.trim();
    const lastName = document.getElementById('registerLastName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const privacyConsent = document.getElementById('privacyConsent').checked;
    const newsletterConsent = document.getElementById('newsletterConsent').checked;

    // Validation
    const validationErrors = this.validateRegistrationForm({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      privacyConsent,
    });

    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        this.showFieldError(error.field, error.message);
      });
      return;
    }

    // Clear previous errors
    this.clearFieldErrors();

    // Show loading state
    this.setLoadingState(form, true, 'Registrierung läuft...');

    try {
      // Prepare user data
      const userData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        privacy_consent: privacyConsent,
        newsletter_consent: newsletterConsent,
      };

      // API call
      const result = await window.crmApi.register(userData);

      if (result.success) {
        this.showAlert('Registrierung erfolgreich! Sie können sich jetzt anmelden.', 'success');

        // Switch to login form
        setTimeout(() => {
          this.toggleForms(null, 'login');

          // Pre-fill email
          document.getElementById('loginEmail').value = email;
        }, 2000);
      } else {
        this.showAlert(result.error, 'danger');
      }
    } catch (error) {
      this.showAlert(
        'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
        'danger'
      );
    } finally {
      this.setLoadingState(form, false);
    }
  }

  toggleForms(event, targetForm) {
    if (event) {
      event.preventDefault();
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (targetForm === 'register') {
      loginForm?.classList.add('d-none');
      registerForm?.classList.remove('d-none');
    } else {
      registerForm?.classList.add('d-none');
      loginForm?.classList.remove('d-none');
    }

    // Clear form errors
    this.clearFieldErrors();
  }

  initPasswordToggle(buttonId, inputId) {
    const toggleButton = document.getElementById(buttonId);
    const passwordInput = document.getElementById(inputId);

    if (!toggleButton || !passwordInput) return;

    toggleButton.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';

      const icon = toggleButton.querySelector('i');
      if (icon) {
        icon.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
      }
    });
  }

  checkPasswordStrength() {
    const password = document.getElementById('registerPassword').value;
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('strengthLevel');

    if (!password) {
      strengthBar.style.width = '0%';
      strengthBar.className = 'progress-bar';
      strengthText.textContent = '-';
      return;
    }

    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^a-zA-Z0-9]/.test(password),
    ];

    strength = checks.filter(check => check).length;

    const levels = ['Sehr schwach', 'Schwach', 'Mittel', 'Stark', 'Sehr stark'];
    const colors = ['bg-danger', 'bg-warning', 'bg-info', 'bg-success', 'bg-primary'];
    const widths = ['20%', '40%', '60%', '80%', '100%'];

    strengthBar.style.width = widths[strength - 1] || '0%';
    strengthBar.className = `progress-bar ${colors[strength - 1] || ''}`;
    strengthText.textContent = levels[strength - 1] || '-';
  }

  validatePasswordMatch() {
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const confirmField = document.getElementById('registerPasswordConfirm');

    if (passwordConfirm && password !== passwordConfirm) {
      this.showFieldError('registerPasswordConfirm', 'Die Passwörter stimmen nicht überein.');
      return false;
    } else if (passwordConfirm && password === passwordConfirm) {
      this.clearFieldError('registerPasswordConfirm');
      return true;
    }
    return true;
  }

  validateRegistrationForm(data) {
    const errors = [];

    if (!data.firstName) {
      errors.push({ field: 'registerFirstName', message: 'Bitte geben Sie Ihren Vornamen ein.' });
    }

    if (!data.lastName) {
      errors.push({ field: 'registerLastName', message: 'Bitte geben Sie Ihren Nachnamen ein.' });
    }

    if (!this.validateEmail(data.email)) {
      errors.push({
        field: 'registerEmail',
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      });
    }

    if (!data.password || data.password.length < 8) {
      errors.push({
        field: 'registerPassword',
        message: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
      });
    }

    if (data.password !== data.passwordConfirm) {
      errors.push({
        field: 'registerPasswordConfirm',
        message: 'Die Passwörter stimmen nicht überein.',
      });
    }

    if (!data.privacyConsent) {
      errors.push({
        field: 'privacyConsent',
        message: 'Sie müssen der Datenschutzerklärung zustimmen.',
      });
    }

    return errors;
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.add('is-invalid');

    const feedback = field.parentElement.querySelector('.invalid-feedback');
    if (feedback) {
      feedback.textContent = message;
    }
  }

  clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.remove('is-invalid');
  }

  clearFieldErrors() {
    const invalidFields = document.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => field.classList.remove('is-invalid'));
  }

  setLoadingState(form, loading, text = '') {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;

    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoading = submitButton.querySelector('.button-loading');

    if (loading) {
      submitButton.disabled = true;
      buttonText?.classList.add('d-none');
      buttonLoading?.classList.remove('d-none');

      if (text && buttonLoading) {
        const loadingText = buttonLoading.querySelector('span:not(.spinner-border)');
        if (loadingText) loadingText.textContent = text;
      }
    } else {
      submitButton.disabled = false;
      buttonText?.classList.remove('d-none');
      buttonLoading?.classList.add('d-none');
    }
  }

  showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.auth-alert');
    existingAlerts.forEach(alert => alert.remove());

    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show auth-alert`;
    alertDiv.setAttribute('role', 'alert');

    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

    // Insert at the top of the form container
    const authSection = document.querySelector('.auth-section');
    if (authSection) {
      const container = authSection.querySelector('.container');
      if (container) {
        container.insertBefore(alertDiv, container.firstChild);
      }
    }

    // Auto-dismiss after 5 seconds for success messages
    if (type === 'success') {
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.remove();
        }
      }, 5000);
    }

    // Scroll to alert
    alertDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  checkAuthStatus() {
    // Check if user is already logged in
    if (window.crmApi && window.crmApi.isLoggedIn()) {
      // Redirect to member area if on login page
      if (window.location.pathname.includes('login.html')) {
        window.location.href = 'member-area.html';
      }
    }
  }

  // Forgot Password Handler
  async handleForgotPassword() {
    const emailField = document.getElementById('loginEmail');
    const email = emailField.value.trim();

    if (!email) {
      this.showAlert('Bitte geben Sie zuerst Ihre E-Mail-Adresse ein.', 'warning');
      this.showFieldError('loginEmail', 'E-Mail-Adresse ist erforderlich.');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showAlert('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'danger');
      this.showFieldError('loginEmail', 'Ungültige E-Mail-Adresse.');
      return;
    }

    this.clearFieldErrors();
    const form = document.getElementById('loginForm');
    this.setLoadingState(form, true, 'Sende Anfrage...');

    try {
      // TODO: Backend-Team muss den API-Endpunkt 'forgotPassword' implementieren.
      // Der Endpunkt sollte eine E-Mail an den Benutzer senden und den Erfolg oder Misserfolg zurückgeben.
      // const result = await window.crmApi.forgotPassword(email);

      // Simulierter Aufruf für UI-Entwicklung
      await new Promise(resolve => setTimeout(resolve, 1500));
      const result = { success: true }; // Annahme für Testzwecke

      if (result.success) {
        this.showAlert(
          'Anweisungen zum Zurücksetzen des Passworts wurden an Ihre E-Mail-Adresse gesendet.',
          'success'
        );
      } else {
        this.showAlert(result.error || 'Die Anfrage zum Zurücksetzen des Passworts konnte nicht gesendet werden.', 'danger');
      }
    } catch (error) {
      this.showAlert(
        'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
        'danger'
      );
    } finally {
      this.setLoadingState(form, false);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AuthHandler();

  // Forgot password link handler
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', e => {
      e.preventDefault();
      const authHandler = new AuthHandler();
      authHandler.handleForgotPassword();
    });
  }
});
