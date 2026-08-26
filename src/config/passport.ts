import 'dotenv/config';

import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import * as repo from '../repositories/user.repository.js';

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET is not set.');
}

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret,
};

passport.use(
  new JwtStrategy(options, async (payload: { id: string }, done) => {
    try {
      const user = await repo.findById(payload.id);

      if (!user) {
        return done(null, false);
      }

      const { password: _password, ...safeUser } = user;
      return done(null, safeUser);
    } catch (error) {
      return done(error, false);
    }
  }),
);

export default passport;
