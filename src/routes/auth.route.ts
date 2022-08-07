import express from 'express';
import { check } from 'express-validator';
import { authController } from '../controllers/auth.controller';

const authRoutes = express.Router();

authRoutes.post(
  '/register',
  [
    check('email', 'Enter valid email address').isEmail(),
    check(
      'password',
      'The password must be more than 4 and less than 10 characters',
    ).isLength({ min: 4, max: 10 }),
  ],
  authController.register,
);

authRoutes.post('/login', authController.login);

authRoutes.post('/refresh', authController.refresh);

export { authRoutes };
