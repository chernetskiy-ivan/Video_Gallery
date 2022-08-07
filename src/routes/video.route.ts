import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { videoController } from '../controllers/video.controller';
import { openForAuthorMiddleware } from '../middleware/video.author.middleware';
import { convertVideoCreateMiddleware } from '../middleware/convert.video.create.middleware';
import { validateVideoCreateMiddleware } from '../middleware/validate.video.create.middleware';
import { validateVideoUpdateMiddleware } from '../middleware/validate.video.update.middleware';
import { openForAuthorAndFavsMiddleware } from '../middleware/video.author.favs.middleware';

const videoRoutes = express.Router();

videoRoutes.use(authMiddleware);

videoRoutes
  .get('/', videoController.getVideos)
  .post(
    '/upload',
    [validateVideoCreateMiddleware, convertVideoCreateMiddleware],
    videoController.addVideo,
  )
  .get(
    '/:videoId',
    openForAuthorAndFavsMiddleware,
    videoController.getVideoById,
  )
  .put(
    '/:videoId',
    [openForAuthorMiddleware, validateVideoUpdateMiddleware],
    videoController.updateVideoById,
  )
  .delete('/:videoId', openForAuthorMiddleware, videoController.deleteVideoById)
  .get(
    '/:videoId/download',
    openForAuthorAndFavsMiddleware,
    videoController.downloadVideo,
  );

export { videoRoutes };
