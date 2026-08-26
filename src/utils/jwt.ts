import jwt, { SignOptions } from 'jsonwebtoken';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set.');
  }
  return secret;
};

export const signToken = (payload: JwtPayload): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '1h') as SignOptions['expiresIn'];
  return jwt.sign(payload, getSecret(), { expiresIn });
};

export const verifyToken = (token: string): JwtPayload => {
  const payload = jwt.verify(token, getSecret());

  if (typeof payload === 'string' || !payload || typeof payload !== 'object') {
    throw new Error('Invalid token payload.');
  }

  const { id, email, role } = payload as Partial<JwtPayload>;

  if (typeof id !== 'string' || typeof email !== 'string' || typeof role !== 'string') {
    throw new Error('Invalid token payload.');
  }

  return { id, email, role };
};
