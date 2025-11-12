/// <reference types="cypress" />

describe('User Registration Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/register');
  });

  it('should display registration form correctly', () => {
    // Check page title
    cy.contains('Create Account').should('be.visible');
    cy.contains('Join us to get started').should('be.visible');

    // Check form fields
    cy.get('input[placeholder="John Doe"]').should('be.visible');
    cy.get('input[placeholder="john@example.com"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');

    // Check submit button
    cy.contains('button', 'Create Account').should('be.visible');

    // Check login link
    cy.contains('Already have an account?').should('be.visible');
    cy.contains('a', 'Sign In').should('be.visible').and('have.attr', 'href', '/login');
  });

  it('should show validation errors for empty fields', () => {
    // Click submit without filling fields
    cy.contains('button', 'Create Account').click();

    // Check for validation errors
    cy.contains('Name is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should show validation error for invalid email', () => {
    cy.get('input[placeholder="John Doe"]').type('John Doe');
    cy.get('input[placeholder="john@example.com"]').type('invalid-email');
    cy.get('input[type="password"]').type('SecurePass123');

    cy.contains('button', 'Create Account').click();

    cy.contains('Please enter a valid email').should('be.visible');
  });

  it('should show validation error for weak password', () => {
    cy.get('input[placeholder="John Doe"]').type('John Doe');
    cy.get('input[placeholder="john@example.com"]').type('john@example.com');
    cy.get('input[type="password"]').type('weak');

    cy.contains('button', 'Create Account').click();

    cy.contains('Password must be at least 8 characters').should('be.visible');
  });

  it('should show validation error for password without uppercase', () => {
    cy.get('input[placeholder="John Doe"]').type('John Doe');
    cy.get('input[placeholder="john@example.com"]').type('john@example.com');
    cy.get('input[type="password"]').type('lowercase123');

    cy.contains('button', 'Create Account').click();

    cy.contains('Password must contain uppercase, lowercase, and number').should('be.visible');
  });

  it('should show validation error for short name', () => {
    cy.get('input[placeholder="John Doe"]').type('J');
    cy.get('input[placeholder="john@example.com"]').type('john@example.com');
    cy.get('input[type="password"]').type('SecurePass123');

    cy.contains('button', 'Create Account').click();

    cy.contains('Name must be at least 2 characters').should('be.visible');
  });

  it('should successfully register a new user', () => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;

    cy.get('input[placeholder="John Doe"]').type('Test User');
    cy.get('input[placeholder="john@example.com"]').type(email);
    cy.get('input[type="password"]').type('SecurePass123');

    cy.contains('button', 'Create Account').click();

    // Should redirect to users page
    cy.url().should('include', '/users');

    // Should show success message
    cy.contains('Welcome, Test User!').should('be.visible');

    // Should store token in localStorage
    cy.window().then((window) => {
      const token = window.localStorage.getItem('accessToken');
      expect(token).to.exist;
      expect(token).to.not.be.empty;
    });
  });

  it('should show error for duplicate email', () => {
    // First, register a user
    const timestamp = Date.now();
    const email = `duplicate${timestamp}@example.com`;

    cy.register('Duplicate User', email, 'SecurePass123');

    // Visit register page again
    cy.visit('/register');

    // Try to register with same email
    cy.get('input[placeholder="John Doe"]').type('Another User');
    cy.get('input[placeholder="john@example.com"]').type(email);
    cy.get('input[type="password"]').type('SecurePass123');

    cy.contains('button', 'Create Account').click();

    // Should show error message - be flexible as it could say "already registered" or "already exists"
    cy.get('body').should('contain.text', 'already');
  });

  it('should navigate to login page when clicking Sign In link', () => {
    cy.contains('a', 'Sign In').click();

    cy.url().should('include', '/login');
    cy.contains('Welcome Back').should('be.visible');
  });

  it('should show loading state during registration', () => {
    const timestamp = Date.now();
    const email = `loading${timestamp}@example.com`;

    cy.get('input[placeholder="John Doe"]').type('Loading User');
    cy.get('input[placeholder="john@example.com"]').type(email);
    cy.get('input[type="password"]').type('SecurePass123');

    // Intercept the request to simulate slow response
    cy.intercept('POST', '**/auth/register', (req) => {
      req.reply((res) => {
        res.delay = 1000;
      });
    }).as('registerRequest');

    cy.contains('button', 'Create Account').click();

    // Button should be disabled during loading
    cy.contains('button', 'Create Account').should('be.disabled');

    cy.wait('@registerRequest');
  });

  it('should display helper text for password requirements', () => {
    // Check if helper text is visible
    cy.contains('Min 8 characters with uppercase, lowercase, and number').should('be.visible');
  });
});
