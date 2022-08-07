import fs from 'fs';
import { User } from '../db/entities/user.entity';
import { Video } from '../db/entities/video.entity';
import { unlink } from 'node:fs/promises';
import { VideoDto } from './dto/VideoDto';
import { userService } from './user.service';
import { DeleteResult } from 'typeorm';
import { IUpdateVideo } from './interfaces/IUpdateVideo';
import { AppDataSource } from '../db/data-source';
import { PrivateVideoRelation } from '../db/entities/privateVideoRelation';
import { privateViodeRelationService } from './privateVideoRelation.service';

class VideoService {
  async createVideo(
    video: VideoDto,
    userId: number,
  ): Promise<Video | undefined> {
    const authorOfVideo: User | null = await userService.getUserById(userId);

    if (authorOfVideo) {
      if (!video.mode) {
        this.checkOpenEmailsContainAuthor(video, authorOfVideo.email);
      }

      const createdVideo: Video = await AppDataSource.getRepository(
        Video,
      ).create(video);

      createdVideo.user = authorOfVideo;

      return await AppDataSource.getRepository(Video).save(createdVideo);
    }
  }

  async getVideoById(id: number): Promise<Video | null> {
    return await AppDataSource.getRepository(Video).findOne({
      where: {
        id,
      },
    });
  }

  async getVideoByTitle(title: string): Promise<Video | null> {
    return await AppDataSource.getRepository(Video).findOne({
      where: { title },
    });
  }

  async deleteVideoById(videoId: number): Promise<DeleteResult | undefined> {
    const videoToDelete = await this.getVideoById(videoId);
    if (videoToDelete) {
      try {
        const path = videoToDelete.path;

        //delete from fs
        await unlink(path);

        //delete video relation
        if (!videoToDelete.mode) {
          privateViodeRelationService.deleteRelationByVideoId(videoToDelete.id);
        }

        //delete from db
        return await this.deleteVideoByIdInDB(videoId);
      } catch (error: any) {
        console.error('there was an error:', error.message);
      }
    }
  }

  async deleteVideoByIdInDB(id: number): Promise<DeleteResult> {
    return await AppDataSource.getRepository(Video).delete({ id });
  }

  async updateVideoById(
    videoId: number,
    options: IUpdateVideo,
  ): Promise<Video | undefined> {
    const videoForUpdate: Video | null = await this.getVideoById(videoId);
    if (videoForUpdate) {
      if (options.title) {
        const fileEXT: string = videoForUpdate.title.split('.')[1];

        const newFileName = options.title + '.' + fileEXT;
        fs.renameSync(
          `E:\\Programming\\Node+TS\\src\\uploads\\${videoForUpdate.title}`,
          `E:\\Programming\\Node+TS\\src\\uploads\\${newFileName}`,
        );
        videoForUpdate.title = newFileName;

        //also we need to change path
        videoForUpdate.path = `E:\\Programming\\Node+TS\\src\\uploads\\${newFileName}`;
      }
      if (options.description) {
        videoForUpdate.description = options.description;
      }
      if (options.mode) {
        videoForUpdate.mode = options.mode;
      }
      if (options.openFor) {
        videoForUpdate.openFor = options.openFor;

        //delete previous relations
        await privateViodeRelationService.deleteRelationByVideoId(
          videoForUpdate.id,
        );

        //create new relation according updated information
        await privateViodeRelationService.createRealationByVideo(
          videoForUpdate,
        );
      }
      if (options.mode && typeof options.openFor === 'undefined') {
        privateViodeRelationService.deleteRelationByVideoId(videoForUpdate.id);
        videoForUpdate.openFor = [];
      }
      if (!options.mode && options.openFor) {
        videoForUpdate.mode = Boolean(options.mode);
      }

      return await AppDataSource.getRepository(Video).save(videoForUpdate);
    }
  }

  async createInDBAndSaveInFSVideo(
    uploadedFile: any,
    videoToSave: VideoDto,
    userId: number,
    uploadPathWithName: string,
  ): Promise<void> {
    const videoWithSameTitle: Video | null = await videoService.getVideoByTitle(
      uploadedFile.name,
    );

    if (!videoWithSameTitle) {
      const createdVideo: Video | undefined = await videoService.createVideo(
        videoToSave,
        userId,
      );
      if (createdVideo) {
        //create and save private relation
        if (!createdVideo.mode) {
          await privateViodeRelationService.createRealationByVideo(
            createdVideo,
          );
        }
        uploadedFile.mv(uploadPathWithName, (err: any) => {
          if (err) {
            throw new Error(err);
          }
        });
      }
    } else {
      throw new Error('Video with same title already exists');
    }
  }

  async getAllPublicVideos(): Promise<Video[]> {
    return await AppDataSource.getRepository(Video).find({
      where: { mode: true },
    });
  }

  async getOwnPrivateVideosByUserId(userId: number): Promise<Video[]> {
    const videos: any = await AppDataSource.getRepository(Video).find({
      relations: ['user'],
    });
    if (videos) {
      return videos.filter(function (video: Video) {
        if (!video.mode) {
          if (video.user.id === userId) {
            return true;
          }
        }
      });
    } else {
      throw new Error('Video not found');
    }
  }

  async getPrivateViodesOpendByUserId(userId: number): Promise<Video[]> {
    const videoIds: number[] =
      await privateViodeRelationService.getPrivateVideoIdsByUserId(userId);

    const privateVideosOpendForUser: Video[] = [];

    for (const videoId of videoIds) {
      const video: Video | null = await this.getVideoById(videoId);
      if (video) {
        privateVideosOpendForUser.push(video);
      }
    }

    return privateVideosOpendForUser;
  }

  checkOpenEmailsContainAuthor(video: VideoDto, authorEmail: string): void {
    if (video.openFor.indexOf(authorEmail) != -1) {
      throw new Error(
        'Invalid body. Do not mention author email in openFor property',
      );
    }
  }

  async isAutorByUserIdAndVideoId(
    userId: number,
    videoId: number,
  ): Promise<boolean> {
    const videos: any = await AppDataSource.getRepository(Video).find({
      relations: ['user'],
    });
    if (videos) {
      const authorVideo: Video = videos.filter(function (video: Video) {
        if (video.id === videoId) {
          if (video.user.id === userId) {
            return true;
          }
        }
      })[0];

      if (authorVideo) {
        return true;
      } else {
        const isvideo: Video = videos.filter(function (video: Video) {
          if (video.id === videoId) {
            return true;
          }
        })[0];
        if (isvideo) {
          return false;
        } else {
          throw new Error('Video not found');
        }
      }
    } else {
      throw new Error('Video not found');
    }
  }

  async isFavByUserIdAndVideoId(
    userId: number,
    videoId: number,
  ): Promise<boolean> {
    const relation: PrivateVideoRelation | null =
      await AppDataSource.getRepository(PrivateVideoRelation).findOne({
        where: {
          videoId,
          userId,
        },
      });

    if (relation) {
      return true;
    } else {
      return false;
    }
  }
}

export const videoService: VideoService = new VideoService();
