// Main JavaScript for Menschlichkeit Österreich Website
/* eslint-env browser */
/* global gtag */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavbarScroll();
    initSmoothScrolling();
    initFormSubmissions();
    initAnimations();
    initAccessibility();
    initPerformanceMonitoring();
    initAuthentication();
    initLazyImages();
    
    // Initialize Cookie Manager
    window.cookieManager = new CookieManager();
});

// Performance Monitoring - Core Web Vitals
function initPerformanceMonitoring() {
    // Track Core Web Vitals
    if ('web-vital' in window) {
        return; // Already loaded
    }
    
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
         
        console.log('LCP:', lastEntry.startTime);
        
        // Send to analytics (replace with your analytics)
        sendVital('lcp', lastEntry.startTime);
    });
    
    try {
        lcpObserver.observe({entryTypes: ['largest-contentful-paint']});
    } catch (error) {
         
        console.warn('LCP observation not supported:', error.message);
    }
    
    // First Input Delay (FID) / Interaction to Next Paint (INP)
    const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
             
            console.log('FID:', entry.processingStart - entry.startTime);
            sendVital('fid', entry.processingStart - entry.startTime);
        }
    });
    
    try {
        fidObserver.observe({entryTypes: ['first-input']});
    } catch (error) {
         
        console.warn('FID observation not supported:', error.message);
    }
    
    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
                clsValue += entry.value;
            }
        }
         
        console.log('CLS:', clsValue);
        sendVital('cls', clsValue);
    });
    
    try {
        clsObserver.observe({entryTypes: ['layout-shift']});
    } catch (error) {
         
        console.warn('CLS observation not supported:', error.message);
    }
}

// Send vital metrics
function sendVital(name, value) {
    // Privacy-friendly analytics - no personal data
    if (typeof gtag !== 'undefined') {
        gtag('event', 'web_vital', {
            'name': name,
            'value': Math.round(value),
            'custom_parameter_1': 'core_web_vitals'
        });
    }
    
    // Alternative: send to your own analytics endpoint
    /*
    fetch('/api/vitals', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, value: Math.round(value)})
    });
    */
}

// Navbar scroll effect
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Form submissions
function initFormSubmissions() {
    // Newsletter form
    const newsletterForm = document.querySelector('#newsletter form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleNewsletterSubmission(this);
        });
    }
}

// Handle newsletter subscription
function handleNewsletterSubmission(form) {
    const email = form.querySelector('input[type="email"]').value;
    const button = form.querySelector('button[type="submit"]');
    
    // Show loading state
    const originalText = button.textContent;
    button.textContent = 'Wird angemeldet...';
    button.disabled = true;
    
    // Simulate API call (replace with actual implementation)
    setTimeout(() => {
        // Show success message
        showNotification('Erfolgreich angemeldet! Du erhältst bald unseren Newsletter.', 'success');
        
        // Reset form
        form.reset();
        button.textContent = originalText;
        button.disabled = false;
    }, 2000);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span>${message}</span>
            <button type="button" class="btn-close" aria-label="Close"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add close functionality
    notification.querySelector('.btn-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Initialize scroll animations und lazy loading
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    // Animation Observer
    const animationObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in', 'visible');
            }
        });
    }, observerOptions);
    
    // Lazy Loading Observer für Images
    const lazyImageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    lazyImageObserver.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px 0px'
    });
    
    // Observe elements for animation
    document.querySelectorAll('.card, .action-card, .trust-card, .membership-card').forEach(el => {
        animationObserver.observe(el);
    });
    
    // Observe images for lazy loading
    document.querySelectorAll('img[data-src]').forEach(img => {
        lazyImageObserver.observe(img);
    });
}

// Accessibility improvements
function initAccessibility() {
    // Add keyboard navigation for cards
    document.querySelectorAll('.card, .action-card, .trust-card').forEach(card => {
        card.setAttribute('tabindex', '0');
        
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                const link = this.querySelector('a');
                if (link) {
                    link.click();
                }
            }
        });
    });
    
    // Improve button accessibility
    document.querySelectorAll('.btn').forEach(button => {
        if (!button.getAttribute('aria-label') && button.innerHTML.includes('<i class=')) {
            const text = button.textContent.trim();
            if (text) {
                button.setAttribute('aria-label', text);
            }
        }
    });
}

// Utility function to detect mobile devices
function isMobile() {
    return window.innerWidth <= 768;
}

// Handle window resize
window.addEventListener('resize', function() {
    // Adjust layouts if needed
    if (isMobile()) {
        document.body.classList.add('mobile');
    } else {
        document.body.classList.remove('mobile');
    }
});

// Handle form validations
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
        
        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                input.classList.add('is-invalid');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Initialize tooltips (if Bootstrap 5 is loaded)
if (typeof bootstrap !== 'undefined') {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Website error:', e.error);
    // Could send error to analytics or error tracking service
});

// Performance monitoring
window.addEventListener('load', function() {
    // Log page load time
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log('Page load time:', loadTime + 'ms');
});

// DSGVO Cookie Management System
class CookieManager {
    constructor() {
        this.cookieSettings = {
            essential: true,
            analytics: false,
            marketing: false
        };
        this.init();
    }

    init() {
        this.loadStoredPreferences();
        this.bindEvents();
        this.showBannerIfNeeded();
        this.createSettingsButton();
    }

    loadStoredPreferences() {
        const stored = localStorage.getItem('cookiePreferences');
        if (stored) {
            try {
                this.cookieSettings = { ...this.cookieSettings, ...JSON.parse(stored) };
            } catch (error) {
                console.warn('Invalid cookie preferences in storage:', error);
            }
        }
    }

    savePreferences() {
        localStorage.setItem('cookiePreferences', JSON.stringify(this.cookieSettings));
        localStorage.setItem('cookieConsentGiven', 'true');
        this.applySettings();
    }

    showBannerIfNeeded() {
        const consentGiven = localStorage.getItem('cookieConsentGiven');
        if (!consentGiven) {
            document.getElementById('cookieConsent').classList.remove('hidden');
        }
    }

    hideBanner() {
        document.getElementById('cookieConsent').classList.add('hidden');
    }

    bindEvents() {
        const banner = document.getElementById('cookieConsent');
        if (!banner) return;

        // Accept all cookies
        banner.querySelector('.btn-cookie-accept').addEventListener('click', () => {
            this.cookieSettings = { essential: true, analytics: true, marketing: true };
            this.savePreferences();
            this.hideBanner();
            this.showNotification('Alle Cookies akzeptiert', 'success');
        });

        // Decline non-essential cookies
        banner.querySelector('.btn-cookie-decline').addEventListener('click', () => {
            this.cookieSettings = { essential: true, analytics: false, marketing: false };
            this.savePreferences();
            this.hideBanner();
            this.showNotification('Nur essentielle Cookies aktiv', 'info');
        });

        // Configure cookies
        banner.querySelector('.btn-cookie-configure').addEventListener('click', () => {
            this.configureCookies();
        });

        // Update checkboxes to reflect current settings
        this.updateCheckboxes();
    }

    updateCheckboxes() {
        const analyticsCheckbox = document.getElementById('analytics-cookies');
        const marketingCheckbox = document.getElementById('marketing-cookies');
        
        if (analyticsCheckbox) {
            analyticsCheckbox.checked = this.cookieSettings.analytics;
            analyticsCheckbox.addEventListener('change', (e) => {
                this.cookieSettings.analytics = e.target.checked;
            });
        }
        
        if (marketingCheckbox) {
            marketingCheckbox.checked = this.cookieSettings.marketing;
            marketingCheckbox.addEventListener('change', (e) => {
                this.cookieSettings.marketing = e.target.checked;
            });
        }
    }

    configureCookies() {
        this.savePreferences();
        this.hideBanner();
        this.showNotification('Cookie-Einstellungen gespeichert', 'success');
    }

    applySettings() {
        // Apply analytics cookies
        if (this.cookieSettings.analytics) {
            this.enableAnalytics();
        } else {
            this.disableAnalytics();
        }

        // Apply marketing cookies
        if (this.cookieSettings.marketing) {
            this.enableMarketing();
        } else {
            this.disableMarketing();
        }
    }

    enableAnalytics() {
        // Enable Google Analytics or other analytics
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
        console.log('Analytics cookies enabled');
    }

    disableAnalytics() {
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
        console.log('Analytics cookies disabled');
    }

    enableMarketing() {
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted'
            });
        }
        console.log('Marketing cookies enabled');
    }

    disableMarketing() {
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied'
            });
        }
        console.log('Marketing cookies disabled');
    }

    createSettingsButton() {
        // Create floating cookie settings button
        const button = document.createElement('button');
        button.className = 'cookie-settings-trigger';
        button.innerHTML = '<i class="bi bi-gear-fill"></i>';
        button.title = 'Cookie-Einstellungen';
        button.setAttribute('aria-label', 'Cookie-Einstellungen öffnen');

        button.addEventListener('click', () => {
            document.getElementById('cookieConsent').classList.remove('hidden');
        });

        document.body.appendChild(button);
    }

    showNotification(message, type = 'info') {
        // Reuse existing notification system
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Authentication System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadStoredUser();
        this.bindAuthEvents();
        this.updateUIForUser();
    }

    loadStoredUser() {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                this.currentUser = JSON.parse(stored);
            } catch (error) {
                console.warn('Invalid user data in storage:', error);
                localStorage.removeItem('currentUser');
            }
        }
    }

    bindAuthEvents() {
        // Form switching
        const showRegisterLink = document.getElementById('showRegisterLink');
        const showLoginLink = document.getElementById('showLoginLink');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (showRegisterLink && registerForm && loginForm) {
            showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToRegister();
            });
        }

        if (showLoginLink && registerForm && loginForm) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToLogin();
            });
        }

        // Password visibility toggles
        this.bindPasswordToggles();
        
        // Form submissions
        this.bindFormSubmissions();
        
        // Password strength checker
        this.bindPasswordStrength();
    }

    switchToRegister() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        loginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
    }

    switchToLogin() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        registerForm.classList.add('d-none');
        loginForm.classList.remove('d-none');
    }

    bindPasswordToggles() {
        const toggles = ['toggleLoginPassword', 'toggleRegisterPassword'];
        
        toggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                toggle.addEventListener('click', () => {
                    const passwordField = toggle.closest('.input-group').querySelector('input[type="password"], input[type="text"]');
                    const icon = toggle.querySelector('i');
                    
                    if (passwordField.type === 'password') {
                        passwordField.type = 'text';
                        icon.className = 'bi bi-eye-slash';
                    } else {
                        passwordField.type = 'password';
                        icon.className = 'bi bi-eye';
                    }
                });
            }
        });
    }

    bindFormSubmissions() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    bindPasswordStrength() {
        const passwordField = document.getElementById('registerPassword');
        if (passwordField) {
            passwordField.addEventListener('input', (e) => {
                this.checkPasswordStrength(e.target.value);
            });
        }

        // Password confirmation validation
        const confirmField = document.getElementById('registerPasswordConfirm');
        if (confirmField && passwordField) {
            confirmField.addEventListener('input', () => {
                this.validatePasswordMatch(passwordField.value, confirmField.value);
            });
            
            passwordField.addEventListener('input', () => {
                if (confirmField.value) {
                    this.validatePasswordMatch(passwordField.value, confirmField.value);
                }
            });
        }
    }

    checkPasswordStrength(password) {
        const strengthBar = document.getElementById('passwordStrengthBar');
        const strengthText = document.getElementById('strengthLevel');
        
        if (!strengthBar || !strengthText) return;

        const score = this.calculatePasswordScore(password);
        let strength = 'Schwach';
        let className = 'strength-weak';

        if (score >= 4) {
            strength = 'Sehr stark';
            className = 'strength-strong';
        } else if (score >= 3) {
            strength = 'Stark';
            className = 'strength-good';
        } else if (score >= 2) {
            strength = 'Mittel';
            className = 'strength-fair';
        }

        strengthBar.className = `progress-bar ${className}`;
        strengthText.textContent = strength;
    }

    calculatePasswordScore(password) {
        let score = 0;
        
        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // Character variety
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z\d]/.test(password)) score++;
        
        return Math.min(score, 4);
    }

    validatePasswordMatch(password, confirmation) {
        const confirmField = document.getElementById('registerPasswordConfirm');
        
        if (password === confirmation && password.length > 0) {
            confirmField.classList.remove('is-invalid');
            confirmField.classList.add('is-valid');
        } else if (confirmation.length > 0) {
            confirmField.classList.remove('is-valid');
            confirmField.classList.add('is-invalid');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Basic validation
        if (!this.validateLoginForm(form)) {
            return;
        }

        // Show loading state
        this.setButtonLoading(submitButton, true);

        try {
            // Simulate API call (replace with real authentication)
            await this.simulateLogin(email, password, rememberMe);
            
            this.showNotification('Erfolgreich angemeldet!', 'success');
            
            // Redirect to dashboard or previous page
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            this.showNotification(error.message || 'Anmeldung fehlgeschlagen', 'error');
        } finally {
            this.setButtonLoading(submitButton, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');

        // Validate form
        if (!this.validateRegisterForm(form)) {
            return;
        }

        // Show loading state
        this.setButtonLoading(submitButton, true);

        try {
            const userData = {
                firstName: document.getElementById('registerFirstName').value,
                lastName: document.getElementById('registerLastName').value,
                email: document.getElementById('registerEmail').value,
                password: document.getElementById('registerPassword').value,
                newsletter: document.getElementById('newsletterConsent').checked
            };

            // Simulate API call (replace with real registration)
            await this.simulateRegister(userData);
            
            this.showNotification('Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail.', 'success');
            
            // Switch to login form
            setTimeout(() => {
                this.switchToLogin();
                document.getElementById('loginEmail').value = userData.email;
            }, 2000);
            
        } catch (error) {
            this.showNotification(error.message || 'Registrierung fehlgeschlagen', 'error');
        } finally {
            this.setButtonLoading(submitButton, false);
        }
    }

    validateLoginForm(form) {
        const email = form.querySelector('#loginEmail');
        const password = form.querySelector('#loginPassword');
        let isValid = true;

        // Email validation
        if (!email.value || !this.isValidEmail(email.value)) {
            email.classList.add('is-invalid');
            isValid = false;
        } else {
            email.classList.remove('is-invalid');
        }

        // Password validation
        if (!password.value) {
            password.classList.add('is-invalid');
            isValid = false;
        } else {
            password.classList.remove('is-invalid');
        }

        return isValid;
    }

    validateRegisterForm(form) {
        const fields = [
            { id: 'registerFirstName', required: true },
            { id: 'registerLastName', required: true },
            { id: 'registerEmail', required: true, email: true },
            { id: 'registerPassword', required: true, minLength: 8 },
            { id: 'registerPasswordConfirm', required: true, match: 'registerPassword' },
            { id: 'privacyConsent', required: true, checkbox: true }
        ];

        let isValid = true;

        fields.forEach(fieldConfig => {
            const field = document.getElementById(fieldConfig.id);
            let fieldValid = true;

            if (fieldConfig.required) {
                if (fieldConfig.checkbox) {
                    fieldValid = field.checked;
                } else {
                    fieldValid = field.value.trim() !== '';
                }
            }

            if (fieldValid && fieldConfig.email) {
                fieldValid = this.isValidEmail(field.value);
            }

            if (fieldValid && fieldConfig.minLength) {
                fieldValid = field.value.length >= fieldConfig.minLength;
            }

            if (fieldValid && fieldConfig.match) {
                const matchField = document.getElementById(fieldConfig.match);
                fieldValid = field.value === matchField.value;
            }

            if (fieldValid) {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
            } else {
                field.classList.remove('is-valid');
                field.classList.add('is-invalid');
                isValid = false;
            }
        });

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async simulateLogin(email, password, rememberMe) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if user exists in localStorage (for demo)
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = existingUsers.find(u => u.email === email);

        if (!user) {
            throw new Error('Benutzer nicht gefunden');
        }

        if (user.password !== password) {
            throw new Error('Ungültiges Passwort');
        }

        // Create session
        const sessionUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe
        };

        this.currentUser = sessionUser;
        localStorage.setItem('currentUser', JSON.stringify(sessionUser));

        if (!rememberMe) {
            // Set session to expire when browser closes
            sessionStorage.setItem('userSession', 'active');
        }
    }

    async simulateRegister(userData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        if (existingUsers.find(u => u.email === userData.email)) {
            throw new Error('E-Mail-Adresse bereits registriert');
        }

        // Create user record
        const newUser = {
            id: 'user_' + Date.now(),
            ...userData,
            registeredAt: new Date().toISOString(),
            emailVerified: false // In real app, would require email verification
        };

        existingUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('userSession');
        
        this.showNotification('Erfolgreich abgemeldet', 'info');
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    updateUIForUser() {
        // Update navigation and UI based on login status
        // This would be implemented based on the specific UI requirements
        if (this.currentUser) {
            console.log('User logged in:', this.currentUser.firstName);
        }
    }

    showNotification(message, type = 'info') {
        // Reuse existing notification system
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Initialize Authentication System
function initAuthentication() {
    if (document.getElementById('loginForm') || document.getElementById('registerForm')) {
        window.authManager = new AuthManager();
    }
}

// Enhanced Contact Form Management
function initEnhancedForms() {
    const contactForm = document.getElementById('contactForm');
    const newsletterForm = document.getElementById('newsletterForm');

    if (contactForm) {
        initContactForm(contactForm);
    }

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmission);
    }
}

function initContactForm(form) {
    // Character counter for message field
    const messageField = form.querySelector('#message');
    const messageCount = form.querySelector('#messageCount');
    
    if (messageField && messageCount) {
        messageField.addEventListener('input', function() {
            messageCount.textContent = this.value.length;
            
            // Visual feedback for character limit
            const maxLength = parseInt(this.getAttribute('maxlength')) || 1500;
            const percentage = (this.value.length / maxLength) * 100;
            
            messageCount.className = '';
            if (percentage >= 90) {
                messageCount.className = 'text-danger';
            } else if (percentage >= 75) {
                messageCount.className = 'text-warning';
            } else {
                messageCount.className = 'text-muted';
            }
        });
    }

    // Form submission
    form.addEventListener('submit', handleContactFormSubmission);
    
    // Real-time validation
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateContactField(this);
        });
        
        input.addEventListener('input', function() {
            // Clear validation state on input
            this.classList.remove('is-invalid', 'is-valid');
        });
    });
}

function validateContactField(field) {
    const value = field.value.trim();
    let isValid = true;
    
    // Required field check
    if (field.hasAttribute('required') && !value) {
        isValid = false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
    }
    
    // Message minimum length
    if (field.id === 'message' && value && value.length < 10) {
        isValid = false;
    }
    
    // Checkbox validation
    if (field.type === 'checkbox' && field.hasAttribute('required')) {
        isValid = field.checked;
    }
    
    // Apply validation classes
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
    }
    
    return isValid;
}

async function handleContactFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateContactField(input)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showNotification('Bitte überprüfen Sie Ihre Eingaben.', 'error');
        return;
    }
    
    // Show loading state
    setButtonLoading(submitButton, true);
    
    try {
        // Collect form data
        const formData = {
            firstName: form.firstName.value.trim(),
            lastName: form.lastName.value.trim(),
            email: form.email.value.trim(),
            subject: form.subject.value,
            message: form.message.value.trim(),
            privacyConsent: form.privacyConsent.checked,
            newsletterConsent: form.newsletterConsent?.checked || false,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language
        };
        
        // Simulate form submission (replace with real endpoint)
        await simulateContactFormSubmission(formData);
        
        // Success feedback
        showNotification('Vielen Dank für Ihre Nachricht! Wir melden uns binnen 24-48 Stunden bei Ihnen.', 'success');
        
        // Reset form
        form.reset();
        
        // Clear validation classes
        inputs.forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });
        
        // Reset character counter
        const messageCount = form.querySelector('#messageCount');
        if (messageCount) {
            messageCount.textContent = '0';
            messageCount.className = 'text-muted';
        }
        
    } catch (error) {
        showNotification('Entschuldigung, es gab ein Problem beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut.', 'error');
        console.error('Contact form submission error:', error);
    } finally {
        setButtonLoading(submitButton, false);
    }
}

async function simulateContactFormSubmission(formData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Store in localStorage for demo purposes (replace with real API call)
    const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    submissions.push({
        id: 'contact_' + Date.now(),
        ...formData,
        status: 'pending'
    });
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
    
    // Log for development
    console.log('Contact form submitted:', formData);
    
    // In a real application, this would be:
    // const response = await fetch('/api/contact', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    // });
    // return response.json();
}

function setButtonLoading(button, loading) {
    const buttonText = button.querySelector('.button-text');
    const buttonLoading = button.querySelector('.button-loading');
    
    if (loading) {
        button.disabled = true;
        if (buttonText) buttonText.classList.add('d-none');
        if (buttonLoading) buttonLoading.classList.remove('d-none');
    } else {
        button.disabled = false;
        if (buttonText) buttonText.classList.remove('d-none');
        if (buttonLoading) buttonLoading.classList.add('d-none');
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleNewsletterSubmission,
        showNotification,
        validateForm,
        isMobile,
        CookieManager,
        AuthManager
    };
}

// Lazy-load images fallback (ensure all images not above-the-fold are lazy)
function initLazyImages() {
    const imgs = document.querySelectorAll('img');
    imgs.forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        if (!img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
        }
    });
}
