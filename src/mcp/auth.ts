import type { JwtPayload } from '../utils/jwt.js';

export interface MCPAuthRequest {
  jsonrpc: string;
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface AuthContext {
  user: JwtPayload;
  isAuthenticated: boolean;
}
