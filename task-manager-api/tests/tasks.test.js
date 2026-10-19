const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Task Management API — CI/CD Automated Tests', () => {
  // ── TEST 1: GET /tasks returns 200 (Core Lab Requirement) ───────────
  test('GET /tasks returns 200', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ── TEST 2: GET /cache-stats (Supplementary Assignment Task) ─────────
  test('GET /cache-stats returns 200 and cache statistics', async () => {
    const res = await request(app).get('/cache-stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('hits');
    expect(res.body).toHaveProperty('misses');
  });

  // ── TEST 3: Validation Error on missing required field ────────────────
  test('POST /tasks without title returns 400 Bad Request', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ description: 'Testing missing title validation' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  // Clean up mongoose connection after all tests complete
  afterAll(async () => {
    await mongoose.connection.close();
  });
});
