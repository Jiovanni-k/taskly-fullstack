import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport.js';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: unknown, user: Express.User | false) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        message: 'Unauthorized. Please log in.',
      });
    }
    req.user = user;
    return next();
  })(req, res, next);
};
