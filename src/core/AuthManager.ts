import { AuthConfig, BasicAuth, BearerAuth } from '../types/config';
import { AuthenticationError } from '../utils/error-handler';

/**
 * Manages authentication for Jira API requests.
 *
 * Supports Basic Auth (email + API token) and Bearer token authentication.
 */
export class AuthManager {
  constructor(private readonly authConfig: AuthConfig) {
    this.validateAuth();
  }

  private validateAuth(): void {
    if (this.authConfig.type === 'basic') {
      const basicAuth = this.authConfig;
      if (!basicAuth.email || !basicAuth.apiToken) {
        throw new AuthenticationError('Basic auth requires email and API token');
      }
    } else if (this.authConfig.type === 'bearer') {
      const bearerAuth = this.authConfig;
      if (!bearerAuth.token) {
        throw new AuthenticationError('Bearer auth requires a token');
      }
    }
  }

  /**
   * Get authorization headers for HTTP requests.
   *
   * @returns Authorization header object
   */
  getAuthHeaders(): Record<string, string> {
    if (this.authConfig.type === 'basic') {
      return this.getBasicAuthHeaders();
    } else if (this.authConfig.type === 'bearer') {
      return this.getBearerAuthHeaders();
    }

    throw new AuthenticationError(`Unsupported auth type: ${(this.authConfig as { type: string }).type}`);
  }

  private getBasicAuthHeaders(): Record<string, string> {
    const { email, apiToken } = this.authConfig as BasicAuth;
    const credentials = Buffer.from(`${email}:${apiToken}`).toString('base64');

    return {
      Authorization: `Basic ${credentials}`,
    };
  }

  private getBearerAuthHeaders(): Record<string, string> {
    const { token } = this.authConfig as BearerAuth;

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  getAuthType(): string {
    return this.authConfig.type;
  }

  /**
   * Validate credentials format.
   *
   * @returns True if credentials are properly formatted
   */
  isValid(): boolean {
    try {
      this.validateAuth();
      return true;
    } catch {
      return false;
    }
  }
}
