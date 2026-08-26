import app from '../../app.js';
import { beforeEach, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { prisma } from '../../config/prisma.js';
import { hashPassword } from '../../utils/hash.js';

describe('User auth integration tests.', () => {
  const email = 'auth-test@gmail.com';
  const password = 'password123';

  beforeEach(async () => {
    await prisma.todos.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /users/register', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/users/register').send({
        email,
        password,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should not register the same email twice', async () => {
      await request(app).post('/users/register').send({ email, password });

      const response = await request(app).post('/users/register').send({
        email,
        password,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already exists.');
    });

    it('should reject registering with the reserved admin email', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({ email: process.env.ADMIN_EMAIL, password: 'whatever123' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /users/login', () => {
    beforeEach(async () => {
      await request(app).post('/users/register').send({ email, password });
    });

    it('should log in with correct credentials and return a token', async () => {
      const response = await request(app).post('/users/login').send({
        email,
        password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(email);
    });

    it('should reject an incorrect password', async () => {
      const response = await request(app).post('/users/login').send({
        email,
        password: 'wrong-password',
      });

      expect(response.status).toBe(401);
    });

    it('should reject a non-existent email', async () => {
      const response = await request(app).post('/users/login').send({
        email: 'nobody@gmail.com',
        password,
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /users/me', () => {
    it('should reject requests with no token', async () => {
      const response = await request(app).get('/users/me');
      expect(response.status).toBe(401);
    });

    it('should reject requests with an invalid token', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', 'Bearer not-a-real-token');

      expect(response.status).toBe(401);
    });

    it('should return the authenticated user with a valid token', async () => {
      await request(app).post('/users/register').send({ email, password });
      const loginResponse = await request(app).post('/users/login').send({
        email,
        password,
      });
      const token = loginResponse.body.token;

      const response = await request(app).get('/users/me').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe(email);
    });
  });

  describe('GET /users', () => {
    it('should reject requests with no token', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(401);
    });

    it('should reject a normal user', async () => {
      await request(app).post('/users/register').send({ email, password });
      const loginResponse = await request(app).post('/users/login').send({
        email,
        password,
      });

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${loginResponse.body.token}`);

      expect(response.status).toBe(403);
    });

    it('should let a seeded admin list users without passwords', async () => {
      await request(app).post('/users/register').send({ email, password });
      await prisma.user.create({
        data: {
          email: 'admin@gmail.com',
          password: await hashPassword(password),
          role: 'admin',
        },
      });

      const adminLogin = await request(app).post('/users/login').send({
        email: 'admin@gmail.com',
        password,
      });

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminLogin.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            email,
            role: 'user',
          }),
          expect.objectContaining({
            email: 'admin@gmail.com',
            role: 'admin',
          }),
        ]),
      );
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).not.toHaveProperty('password');
    });
  });
});
