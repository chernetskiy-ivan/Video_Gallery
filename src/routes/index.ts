import express, { Router } from 'express';
import { videoRoutes } from './video.route';
import { authRoutes } from './auth.route';

const routes: Router = express.Router();

routes.use('/video', videoRoutes);

routes.use('/auth', authRoutes);

export { routes };
