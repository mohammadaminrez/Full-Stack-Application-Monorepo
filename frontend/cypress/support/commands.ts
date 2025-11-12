/// <reference types="cypress" />

// ***********************************************
// Custom commands for Cypress E2E tests
// ***********************************************

/**
 * Login command - authenticates user via API and stores token
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: {
      email,
      password,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    localStorage.setItem('accessToken', response.body.accessToken);
    localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

/**
 * Register command - creates new user via API and stores token
 */
Cypress.Commands.add('register', (name: string, email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: {
      name,
      email,
      password,
    },
  }).then((response) => {
    expect(response.status).to.eq(201);
    localStorage.setItem('accessToken', response.body.accessToken);
    localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

/**
 * Get by test ID command
 */
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// Prevent Cypress from failing on uncaught exceptions
Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Type declarations for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via API
       * @example cy.login('test@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Custom command to register a new user via API
       * @example cy.register('John Doe', 'test@example.com', 'SecurePass123')
       */
      register(name: string, email: string, password: string): Chainable<void>;

      /**
       * Custom command to get by data-testid attribute
       * @example cy.getByTestId('submit-button')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};
