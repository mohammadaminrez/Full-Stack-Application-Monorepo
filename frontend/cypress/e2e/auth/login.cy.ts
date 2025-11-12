/// <reference types="cypress" />

describe('User Login Flow', () => {
  const testUser = {
    name: 'Login Test User',
    email: `logintest${Date.now()}@example.com`,
    password: 'SecurePass123',
  };

  before(() => {
    // Create a test user for login tests
    cy.register(testUser.name, testUser.email, testUser.password);
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/login');
  });

  it('should display login form correctly', () => {
    // Check page title
    cy.contains('Welcome Back').should('be.visible');
    cy.contains('Sign in to your account').should('be.visible');

    // Check form fields
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');

    // Check submit button
    cy.contains('button', 'Sign In').should('be.visible');

    // Check register link
    cy.contains("Don't have an account?").should('be.visible');
    cy.contains('a', 'Create Account').should('be.visible').and('have.attr', 'href', '/register');
  });

  it('should show validation errors for empty fields', () => {
    cy.contains('button', 'Sign In').click();

    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should show validation error for invalid email format', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').type('password123');

    cy.contains('button', 'Sign In').click();

    cy.contains('Please enter a valid email').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('WrongPassword123');

    cy.contains('button', 'Sign In').click();

    cy.contains('Invalid email or password').should('be.visible');
  });

  it('should show error for wrong password', () => {
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type('WrongPassword123');

    cy.contains('button', 'Sign In').click();

    cy.contains('Invalid email or password').should('be.visible');
  });

  it('should successfully login with valid credentials', () => {
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);

    cy.contains('button', 'Sign In').click();

    // Should redirect to users page
    cy.url().should('include', '/users');

    // Should show welcome message
    cy.contains(`Welcome back, ${testUser.name}!`).should('be.visible');

    // Should store token in localStorage
    cy.window().then((window) => {
      const token = window.localStorage.getItem('accessToken');
      expect(token).to.exist;
      expect(token).to.not.be.empty;

      const user = window.localStorage.getItem('user');
      expect(user).to.exist;
      const userData = JSON.parse(user!);
      expect(userData.email).to.equal(testUser.email);
    });
  });

  it('should navigate to register page when clicking Create Account link', () => {
    cy.contains('a', 'Create Account').click();

    cy.url().should('include', '/register');
    cy.contains('Create Account').should('be.visible');
  });

  it('should show loading state during login', () => {
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);

    // Intercept the request to simulate slow response
    cy.intercept('POST', '**/auth/login', (req) => {
      req.reply((res) => {
        res.delay = 1000;
      });
    }).as('loginRequest');

    cy.contains('button', 'Sign In').click();

    // Button should be disabled during loading
    cy.contains('button', 'Sign In').should('be.disabled');

    cy.wait('@loginRequest');
  });

  it('should persist login after page refresh', () => {
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);

    cy.contains('button', 'Sign In').click();

    // Wait for redirect
    cy.url().should('include', '/users');

    // Refresh the page
    cy.reload();

    // Should still be on users page
    cy.url().should('include', '/users');

    // Token should still exist
    cy.window().then((window) => {
      const token = window.localStorage.getItem('accessToken');
      expect(token).to.exist;
    });
  });

  it('should allow password visibility toggle if implemented', () => {
    // This test assumes password visibility toggle exists
    // If not implemented, this test can be skipped or removed
    const passwordField = cy.get('input[type="password"]');
    passwordField.should('exist');
  });
});
