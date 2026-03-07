/**
 * @jest-environment jsdom
 */

import AuthHandler from '../assets/js/auth-handler.js';
import { JSDOM } from 'jsdom';

// Mock the crmApi
const mockCrmApi = {
  forgotPassword: jest.fn(),
};

// Setup the DOM
const setupDOM = () => {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <body>
        <div class="auth-section">
          <div class="container">
            <form id="loginForm">
              <input type="email" id="loginEmail" />
              <button type="submit">
                <span class="button-text">Submit</span>
                <span class="button-loading d-none"><span>Loading...</span></span>
              </button>
            </form>
          </div>
        </div>
      </body>
    </html>
  `);

  global.document = dom.window.document;
  global.window = dom.window;
  window.crmApi = mockCrmApi;
};

describe('AuthHandler - handleForgotPassword', () => {
  let authHandler;

  beforeEach(() => {
    setupDOM();
    authHandler = new AuthHandler();
    // Spy on showAlert to check if it's called
    jest.spyOn(authHandler, 'showAlert');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show an error if the email is empty', async () => {
    await authHandler.handleForgotPassword();
    expect(authHandler.showAlert).toHaveBeenCalledWith(
      'Bitte geben Sie zuerst Ihre E-Mail-Adresse ein.',
      'warning'
    );
  });

  it('should show an error if the email is invalid', async () => {
    document.getElementById('loginEmail').value = 'invalid-email';
    await authHandler.handleForgotPassword();
    expect(authHandler.showAlert).toHaveBeenCalledWith(
      'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      'danger'
    );
  });

  it('should show a success message when the simulated API call is successful', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';

    // Since the actual API call is a setTimeout, we can just test the success path
    await authHandler.handleForgotPassword();

    expect(authHandler.showAlert).toHaveBeenCalledWith(
      'Anweisungen zum Zurücksetzen des Passworts wurden an Ihre E-Mail-Adresse gesendet.',
      'success'
    );
  });
});
