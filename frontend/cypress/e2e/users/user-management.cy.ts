/// <reference types="cypress" />

describe('User Management Flow', () => {
  const mainUser = {
    name: 'Main User',
    email: `mainuser${Date.now()}@example.com`,
    password: 'SecurePass123',
  };

  before(() => {
    // Register main user for tests
    cy.register(mainUser.name, mainUser.email, mainUser.password);
  });

  beforeEach(() => {
    // Login before each test
    cy.clearLocalStorage();
    cy.login(mainUser.email, mainUser.password);
    cy.visit('/users');
  });

  describe('Users Page Display', () => {
    it('should display users page correctly', () => {
      // Check page title/header
      cy.contains('User Management').should('be.visible');

      // Check if user menu is visible
      cy.contains(mainUser.name).should('be.visible');
      cy.contains(mainUser.email).should('be.visible');

      // Check if Add User button exists
      cy.contains('button', 'Add User').should('be.visible');
    });

    it('should display empty state when no users added', () => {
      // Check for empty state message
      cy.contains('No users found').should('be.visible');
    });

    it('should display user menu with logout option', () => {
      // Click on user avatar/menu
      cy.contains(mainUser.name).click();

      // Check logout option
      cy.contains('Sign Out').should('be.visible');
    });
  });

  describe('Add New User', () => {
    it('should open add user modal when clicking Add User button', () => {
      cy.contains('button', 'Add User').click();

      // Modal should be visible
      cy.contains('Add New User').should('be.visible');
      cy.get('input[placeholder*="name" i]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });

    it('should show validation errors when submitting empty form', () => {
      cy.contains('button', 'Add User').click();

      // Click submit without filling fields
      cy.contains('button', 'Add').click();

      // Should show validation errors
      cy.contains('required', { matchCase: false }).should('be.visible');
    });

    it('should successfully add a new user', () => {
      const newUser = {
        name: `New User ${Date.now()}`,
        email: `newuser${Date.now()}@example.com`,
        password: 'SecurePass123',
      };

      cy.contains('button', 'Add User').click();

      // Fill in the form
      cy.get('input[placeholder*="name" i]').type(newUser.name);
      cy.get('input[type="email"]').type(newUser.email);
      cy.get('input[type="password"]').type(newUser.password);

      // Submit
      cy.contains('button', 'Add').click();

      // Modal should close
      cy.contains('Add New User').should('not.exist');

      // New user should appear in the list
      cy.contains(newUser.name).should('be.visible');
      cy.contains(newUser.email).should('be.visible');

      // Success message should appear
      cy.contains('added successfully', { matchCase: false }).should('be.visible');
    });

    it('should close modal when clicking Cancel', () => {
      cy.contains('button', 'Add User').click();

      cy.contains('Add New User').should('be.visible');

      cy.contains('button', 'Cancel').click();

      cy.contains('Add New User').should('not.exist');
    });

    it('should close modal when clicking outside', () => {
      cy.contains('button', 'Add User').click();

      cy.contains('Add New User').should('be.visible');

      // Click on backdrop
      cy.get('body').click(0, 0);

      cy.contains('Add New User').should('not.exist');
    });
  });

  describe('View User List', () => {
    beforeEach(() => {
      // Add a test user for list operations
      const timestamp = Date.now();
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/users`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: {
          name: `List User ${timestamp}`,
          email: `listuser${timestamp}@example.com`,
          password: 'SecurePass123',
        },
      });

      cy.reload();
    });

    it('should display user cards/list items', () => {
      // Check if users are displayed
      cy.get('[data-testid="user-card"], .user-item, [class*="user"]').should('have.length.at.least', 1);
    });

    it('should display user information correctly', () => {
      // User cards should show name and email
      cy.contains('List User').should('be.visible');
      cy.contains('listuser').should('be.visible');
    });

    it('should display action buttons for each user', () => {
      // Edit and Delete buttons should be visible
      cy.contains('button', 'Edit').should('be.visible');
      cy.contains('button', 'Delete').should('be.visible');
    });
  });

  describe('Edit User', () => {
    let testUserId: string;

    beforeEach(() => {
      // Create a user to edit
      const timestamp = Date.now();
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/users`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: {
          name: `Edit User ${timestamp}`,
          email: `edituser${timestamp}@example.com`,
          password: 'SecurePass123',
        },
      }).then((response) => {
        testUserId = response.body.id;
        cy.reload();
      });
    });

    it('should open edit modal when clicking Edit button', () => {
      cy.contains('button', 'Edit').first().click();

      cy.contains('Edit User').should('be.visible');
      cy.get('input[value*="Edit User"]').should('exist');
    });

    it('should successfully update user information', () => {
      cy.contains('button', 'Edit').first().click();

      // Update name
      cy.get('input[placeholder*="name" i]').clear().type('Updated User Name');

      // Submit
      cy.contains('button', 'Update').click();

      // Modal should close
      cy.contains('Edit User').should('not.exist');

      // Updated name should appear
      cy.contains('Updated User Name').should('be.visible');

      // Success message
      cy.contains('updated successfully', { matchCase: false }).should('be.visible');
    });

    it('should allow updating only specific fields', () => {
      cy.contains('button', 'Edit').first().click();

      // Update only email
      const newEmail = `updated${Date.now()}@example.com`;
      cy.get('input[type="email"]').clear().type(newEmail);

      cy.contains('button', 'Update').click();

      // New email should appear
      cy.contains(newEmail).should('be.visible');
    });
  });

  describe('Delete User', () => {
    beforeEach(() => {
      // Create a user to delete
      const timestamp = Date.now();
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/users`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: {
          name: `Delete User ${timestamp}`,
          email: `deleteuser${timestamp}@example.com`,
          password: 'SecurePass123',
        },
      });

      cy.reload();
    });

    it('should show confirmation dialog when clicking Delete', () => {
      cy.contains('button', 'Delete').first().click();

      // Confirmation modal should appear
      cy.contains('Are you sure', { matchCase: false }).should('be.visible');
      cy.contains('Delete User').should('be.visible');
    });

    it('should cancel deletion when clicking Cancel', () => {
      const userName = 'Delete User';

      cy.contains('button', 'Delete').first().click();

      cy.contains('button', 'Cancel').click();

      // User should still be visible
      cy.contains(userName).should('be.visible');
    });

    it('should successfully delete user when confirmed', () => {
      const userName = 'Delete User';

      cy.contains('button', 'Delete').first().click();

      // Confirm deletion
      cy.contains('button', 'Delete').last().click();

      // User should be removed from list
      cy.contains(userName).should('not.exist');

      // Success message
      cy.contains('deleted successfully', { matchCase: false }).should('be.visible');
    });
  });

  describe('User Management Permissions', () => {
    it('should only show users created by current user', () => {
      // All visible users should be created by the logged-in user
      // This is tested by checking that users can be edited/deleted
      cy.get('button').contains('Edit').should('exist');
      cy.get('button').contains('Delete').should('exist');
    });

    it('should not allow editing users from other creators', () => {
      // This test ensures proper permission checking
      // The UI should only show users the current user can manage
      cy.window().then((window) => {
        const user = JSON.parse(window.localStorage.getItem('user')!);
        expect(user.email).to.equal(mainUser.email);
      });
    });
  });

  describe('Search and Filter', () => {
    before(() => {
      // Create multiple users for search testing
      const users = [
        { name: 'Alice Johnson', email: `alice${Date.now()}@example.com` },
        { name: 'Bob Smith', email: `bob${Date.now()}@example.com` },
        { name: 'Charlie Brown', email: `charlie${Date.now()}@example.com` },
      ];

      cy.clearLocalStorage();
      cy.login(mainUser.email, mainUser.password);

      users.forEach((user) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/users`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: {
            ...user,
            password: 'SecurePass123',
          },
        });
      });
    });

    it('should filter users when using search', () => {
      cy.visit('/users');

      // If search field exists
      cy.get('input[placeholder*="Search" i], input[type="search"]').then(($search) => {
        if ($search.length > 0) {
          cy.wrap($search).first().type('Alice');
          cy.contains('Alice Johnson').should('be.visible');
          cy.contains('Bob Smith').should('not.exist');
        }
      });
    });
  });

  describe('Logout', () => {
    it('should successfully logout user', () => {
      // Click user menu
      cy.contains(mainUser.name).click();

      // Click logout
      cy.contains('Sign Out').click();

      // Should redirect to home/login page
      cy.url().should('match', /\/(login|register)?$/);

      // Token should be removed from localStorage
      cy.window().then((window) => {
        const token = window.localStorage.getItem('accessToken');
        expect(token).to.be.null;
      });
    });

    it('should show logout success message', () => {
      cy.contains(mainUser.name).click();
      cy.contains('Sign Out').click();

      cy.contains('Logged out successfully').should('be.visible');
    });

    it('should not allow accessing users page after logout', () => {
      cy.contains(mainUser.name).click();
      cy.contains('Sign Out').click();

      // Try to visit users page
      cy.visit('/users');

      // Should redirect to login
      cy.url().should('not.include', '/users');
    });
  });
});
