import fs from 'fs';
import path from 'path';
import mime from 'mime';
import express from 'express';
import { Video } from '../db/entities/video.entity';
import { VideoDto } from '../services/dto/VideoDto';
import { userService } from '../services/user.service';
import { videoService } from '../services/video.service';
import { IVideoOutput } from 'src/mappers/interfaces/IVideoOutput';
import { DeleteResult } from 'typeorm';
import { errorLogsService } from '../services/logs.service';
import { videoEntityToVideo } from '../mappers/videoEntityToVideo';

class VideoController {
  async getVideos(
    req: express.Request,
    res: express.Response,
  ): Promise<object> {
    try {
      const publicVideos: Video[] = await videoService.getAllPublicVideos();

      const userId: number | undefined = userService.getUserIdFromToken(req);

      if (userId) {
        const ownPrivateVideos: Video[] =
          await videoService.getOwnPrivateVideosByUserId(userId);

        const privateVideos: Video[] =
          await videoService.getPrivateViodesOpendByUserId(userId);

        const buffer: Video[] = [
          ...publicVideos,
          ...ownPrivateVideos,
          ...privateVideos,
        ];

        //modify video object for presentation
        const result = buffer.map((video: Video) => {
          return videoEntityToVideo(video);
        });

        if (result.length !== 0) {
          return res.status(200).json(result);
        } else {
          return res.status(404).send('Videos not found');
        }
      } else {
        throw new Error('Unexpected error');
      }
    } catch (e: any) {
      errorLogsService.logErrors(e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  async getVideoById(
    req: express.Request,
    res: express.Response,
  ): Promise<object> {
    try {
      const videoId = Number(req.params.videoId);
      const video: Video | null = await videoService.getVideoById(videoId);

      if (video) {
        const result: IVideoOutput = videoEntityToVideo(video);
        return res.status(200).json(result);
      } else {
        return res.status(404).send(`Video not found`);
      }
    } catch (e: any) {
      errorLogsService.logErrors(e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  async addVideo(req: express.Request, res: express.Response): Promise<object> {
    try {
      const { description, mode, openFor } = req.body;

      const userId: number | undefined = userService.getUserIdFromToken(req);
      if (req.files && userId) {
        const uploadedFile: any = req.files.file;

        const uploadPath = 'E:\\Programming\\Node+TS\\src\\uploads\\';

        const uploadPathWithName = uploadPath + uploadedFile.name;

        const videoToSave: VideoDto = {
          title: uploadedFile.name,
          path: uploadPathWithName,
          description,
          mode,
          openFor,
        };

        if (fs.existsSync(uploadPath)) {
          await videoService
            .createInDBAndSaveInFSVideo(
              uploadedFile,
              videoToSave,
              userId,
              uploadPathWithName,
            )
            .catch((e: any) => {
              throw e;
            });
        } else {
          fs.mkdirSync(path.join(uploadPath));

          await videoService
            .createInDBAndSaveInFSVideo(
              uploadedFile,
              videoToSave,
              userId,
              uploadPathWithName,
            )
            .catch((e: any) => {
              throw e;
            });
        }

        return res.status(200).send('Video uploaded successfully');
      } else {
        return res
          .status(400)
          .send('No files were uploaded. Or bad request body');
      }
    } catch (e: any) {
      errorLogsService.logErrors(e.message);
      return res.status(500).send(e.message);
    }
  }

  async updateVideoById(
    req: express.Request,
    res: express.Response,
  ): Promise<object> {
    try {
      const videoId = Number(req.params.videoId);
      const options = req.body;

      const updatedVideo: Video | undefined =
        await videoService.updateVideoById(videoId, options);
      if (updatedVideo) {
        return res.status(200).send('Video updated successfully');
      } else {
        return res.status(500).send('Error during update video');
      }
    } catch (e: any) {
      errorLogsService.logErrors(e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  async deleteVideoById(
    req: express.Request,
    res: express.Response,
  ): Promise<object> {
    try {
      const videoId = Number(req.params.videoId);
      const deleteResult: DeleteResult | undefined =
        await videoService.deleteVideoById(videoId);
      if (deleteResult) {
        return res.status(200).send('video successfully deleted');
      } else {
        return res.status(500).send('Error during delete video');
      }
    } catch (e: any) {
      errorLogsService.logErrors(e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  async downloadVideo(
    req: express.Request,
    res: express.Response,
  ): Promise<object> {
    try {
      const videoId = Number(req.params.videoId);

      const video: Video | null = await videoService.getVideoById(videoId);

      if (video) {
        const patToFile: string = video.path;

        const mimetype = mime.lookup(patToFile);

        res.setHeader('Content-type', mimetype);

        res.setHeader(
          'Content-Disposition',
          'attachment; filename=' + `${video.title}`,
        );

        const filestream = fs.createReadStream(patToFile);
        return filestream.pipe(res);
      } else {
        throw new Error('Video not found');
      }
    } catch (e: any) {
      errorLogsService.logErrors(e.message);
      return res.status(500).json({ error: e.message });
    }
  }
}

export const videoController = new VideoController();
