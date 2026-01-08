/**
 * Unit tests for AuthManager
 */

import { AuthManager } from '../../src/core/AuthManager';
import { AuthConfig } from '../../src/types/config';
import { AuthenticationError } from '../../src/utils/error-handler';

describe('AuthManager', () => {
  describe('Basic Auth', () => {
    const basicAuth: AuthConfig = {
      type: 'basic',
      email: 'test@example.com',
      apiToken: 'test-token',
    };

    it('should create AuthManager with valid basic auth', () => {
      expect(() => new AuthManager(basicAuth)).not.toThrow();
    });

    it('should generate correct Basic Auth headers', () => {
      const authManager = new AuthManager(basicAuth);
      const headers = authManager.getAuthHeaders();

      expect(headers).toHaveProperty('Authorization');
      expect(headers.Authorization).toMatch(/^Basic /);

      // Decode and verify
      const encoded = headers.Authorization.replace('Basic ', '');
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      expect(decoded).toBe('test@example.com:test-token');
    });

    it('should return auth type', () => {
      const authManager = new AuthManager(basicAuth);
      expect(authManager.getAuthType()).toBe('basic');
    });

    it('should validate basic auth', () => {
      const authManager = new AuthManager(basicAuth);
      expect(authManager.isValid()).toBe(true);
    });

    it('should throw error for missing email', () => {
      const invalidAuth: AuthConfig = {
        type: 'basic',
        email: '',
        apiToken: 'test-token',
      };

      expect(() => new AuthManager(invalidAuth)).toThrow(AuthenticationError);
    });

    it('should throw error for missing API token', () => {
      const invalidAuth: AuthConfig = {
        type: 'basic',
        email: 'test@example.com',
        apiToken: '',
      };

      expect(() => new AuthManager(invalidAuth)).toThrow(AuthenticationError);
    });
  });

  describe('Bearer Auth', () => {
    const bearerAuth: AuthConfig = {
      type: 'bearer',
      token: 'test-bearer-token',
    };

    it('should create AuthManager with valid bearer auth', () => {
      expect(() => new AuthManager(bearerAuth)).not.toThrow();
    });

    it('should generate correct Bearer Auth headers', () => {
      const authManager = new AuthManager(bearerAuth);
      const headers = authManager.getAuthHeaders();

      expect(headers).toHaveProperty('Authorization');
      expect(headers.Authorization).toBe('Bearer test-bearer-token');
    });

    it('should return auth type', () => {
      const authManager = new AuthManager(bearerAuth);
      expect(authManager.getAuthType()).toBe('bearer');
    });

    it('should validate bearer auth', () => {
      const authManager = new AuthManager(bearerAuth);
      expect(authManager.isValid()).toBe(true);
    });

    it('should throw error for missing token', () => {
      const invalidAuth: AuthConfig = {
        type: 'bearer',
        token: '',
      };

      expect(() => new AuthManager(invalidAuth)).toThrow(AuthenticationError);
    });
  });
});
