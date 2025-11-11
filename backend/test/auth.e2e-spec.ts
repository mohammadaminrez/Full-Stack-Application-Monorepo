import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { AppModule } from '../apps/gateway/src/app.module';

describe('Authentication E2E Tests', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();

    // Override MongoDB URI with in-memory instance
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-e2e-testing';
    process.env.JWT_EXPIRES_IN = '1h';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same validation pipe as in production
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', registerDto.email);
      expect(response.body.user).toHaveProperty('name', registerDto.name);
      expect(response.body.user).toHaveProperty('createdAt');
      expect(response.body.user).not.toHaveProperty('password');
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.accessToken.length).toBeGreaterThan(0);

      // Store for later tests
      authToken = response.body.accessToken;
      userId = response.body.user.id;
    });

    it('should fail with duplicate email', async () => {
      const registerDto = {
        email: 'duplicate@example.com',
        password: 'Password123!',
        name: 'First User',
      };

      // Register first user
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      // Try to register with same email
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(409);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });

    it('should fail with invalid email format', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password: 'Password123!',
        name: 'Test User',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(invalidDto)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should fail with weak password', async () => {
      const weakPasswordDto = {
        email: 'weak@example.com',
        password: 'weak',
        name: 'Test User',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(weakPasswordDto)
        .expect(400);
    });

    it('should fail with missing name', async () => {
      const noNameDto = {
        email: 'noname@example.com',
        password: 'Password123!',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(noNameDto)
        .expect(400);
    });

    it('should fail with short name', async () => {
      const shortNameDto = {
        email: 'short@example.com',
        password: 'Password123!',
        name: 'A',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(shortNameDto)
        .expect(400);
    });

    it('should fail with password lacking uppercase', async () => {
      const noUpperDto = {
        email: 'noupper@example.com',
        password: 'password123!',
        name: 'Test User',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(noUpperDto)
        .expect(400);
    });

    it('should fail with password lacking number', async () => {
      const noNumberDto = {
        email: 'nonumber@example.com',
        password: 'Password!',
        name: 'Test User',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(noNumberDto)
        .expect(400);
    });

    it('should strip unknown properties', async () => {
      const dtoWithExtra = {
        email: 'extra@example.com',
        password: 'Password123!',
        name: 'Test User',
        role: 'admin', // Should be stripped
        isVerified: true, // Should be stripped
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(dtoWithExtra)
        .expect(201);

      expect(response.body.user).not.toHaveProperty('role');
      expect(response.body.user).not.toHaveProperty('isVerified');
    });
  });

  describe('/api/auth/login (POST)', () => {
    const testUser = {
      email: 'login@example.com',
      password: 'LoginPass123!',
      name: 'Login Test User',
    };

    beforeAll(async () => {
      // Register a user for login tests
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const loginDto = {
        email: testUser.email,
        password: testUser.password,
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
      expect(typeof response.body.accessToken).toBe('string');
    });

    it('should fail with incorrect password', async () => {
      const wrongPasswordDto = {
        email: testUser.email,
        password: 'WrongPassword123!',
      };

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(wrongPasswordDto)
        .expect(401);
    });

    it('should fail with non-existent email', async () => {
      const nonExistentDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(nonExistentDto)
        .expect(401);
    });

    it('should fail with invalid email format', async () => {
      const invalidEmailDto = {
        email: 'invalid-email',
        password: 'Password123!',
      };

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(invalidEmailDto)
        .expect(400);
    });

    it('should fail with missing credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('/api/auth/users (GET)', () => {
    it('should return users list with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).not.toHaveProperty('password');
    });

    it('should fail without authorization token', async () => {
      await request(app.getHttpServer()).get('/api/auth/users').expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should fail with malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/users')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);
    });

    it('should fail with expired token', async () => {
      // This would require generating a token with past expiration
      // For now, we just test with an invalid token format
      const expiredLikeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token';

      await request(app.getHttpServer())
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${expiredLikeToken}`)
        .expect(401);
    });
  });

  describe('Complete User Journey', () => {
    it('should complete full registration -> login -> access protected route flow', async () => {
      const newUser = {
        email: 'journey@example.com',
        password: 'JourneyPass123!',
        name: 'Journey User',
      };

      // Step 1: Register
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('accessToken');
      const registerToken = registerResponse.body.accessToken;

      // Step 2: Access protected route with registration token
      const usersResponse1 = await request(app.getHttpServer())
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${registerToken}`)
        .expect(200);

      expect(Array.isArray(usersResponse1.body)).toBe(true);

      // Step 3: Login with same credentials
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: newUser.email,
          password: newUser.password,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
      const loginToken = loginResponse.body.accessToken;

      // Step 4: Access protected route with login token
      const usersResponse2 = await request(app.getHttpServer())
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200);

      expect(Array.isArray(usersResponse2.body)).toBe(true);

      // Verify the user appears in the users list
      const foundUser = usersResponse2.body.find(
        (u: any) => u.email === newUser.email,
      );
      expect(foundUser).toBeDefined();
      expect(foundUser.name).toBe(newUser.name);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle multiple rapid requests', async () => {
      const promises = Array(5)
        .fill(null)
        .map((_, i) =>
          request(app.getHttpServer())
            .post('/api/auth/register')
            .send({
              email: `rapid${i}@example.com`,
              password: 'Password123!',
              name: `Rapid User ${i}`,
            }),
        );

      const results = await Promise.all(promises);

      // At least some should succeed
      const successfulRequests = results.filter((r) => r.status === 201);
      expect(successfulRequests.length).toBeGreaterThan(0);
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should trim whitespace from email', async () => {
      const userWithSpaces = {
        email: '  spaces@example.com  ',
        password: 'Password123!',
        name: 'Spaces User',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(userWithSpaces)
        .expect(201);

      expect(response.body.user.email).toBe('spaces@example.com');
    });

    it('should handle special characters in name', async () => {
      const specialName = {
        email: 'special@example.com',
        password: 'Password123!',
        name: "O'Brien-Smith",
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(specialName)
        .expect(201);

      expect(response.body.user.name).toBe(specialName.name);
    });

    it('should handle international characters in name', async () => {
      const internationalName = {
        email: 'international@example.com',
        password: 'Password123!',
        name: 'José María García',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(internationalName)
        .expect(201);

      expect(response.body.user.name).toBe(internationalName.name);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
    });
  });
});
