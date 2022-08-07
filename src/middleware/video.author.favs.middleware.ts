import express from 'express';
import { Video } from '../db/entities/video.entity';
import { userService } from '../services/user.service';
import { videoService } from '../services/video.service';

export const openForAuthorAndFavsMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const userId: number | undefined = await userService.getUserIdFromToken(
      req,
    );

    if (userId) {
      const videoId = Number(req.params.videoId);

      const video: Video | null = await videoService.getVideoById(videoId);

      if (!video?.mode) {
        const isAutor = await videoService.isAutorByUserIdAndVideoId(
          userId,
          videoId,
        );

        const isFav = await videoService.isFavByUserIdAndVideoId(
          userId,
          videoId,
        );

        if (!isAutor && !isFav) {
          return res.status(403).json({ message: 'Forbidden' });
        }
      }
    } else {
      throw new Error('Unauthorized');
    }

    next();
  } catch (e: any) {
    if (e.message == 'Unauthorized') {
      return res.status(401).json({ error: e.message });
    }
    if (e.message == 'Video not found') {
      return res.status(404).json({ error: e.message });
    }
    return res.status(500).json({ error: e.message });
  }
};
