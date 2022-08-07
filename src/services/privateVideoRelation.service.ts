import { User } from '../db/entities/user.entity';
import { Video } from '../db/entities/video.entity';
import { userService } from './user.service';
import { DeleteResult } from 'typeorm';
import { AppDataSource } from '../db/data-source';
import { PrivateVideoRelation } from '../db/entities/privateVideoRelation';
import { PrivateViodeRelationDto } from './dto/PrivateVideoRelationDto';

class PrivateViodeRelationService {
  async createPrivateVideoRelation(
    relation: PrivateViodeRelationDto,
  ): Promise<PrivateVideoRelation> {
    const createdRelation: PrivateVideoRelation =
      AppDataSource.getRepository(PrivateVideoRelation).create(relation);

    return await AppDataSource.getRepository(PrivateVideoRelation).save(
      createdRelation,
    );
  }

  async createRealationByVideo(video: Video): Promise<void> {
    for (const email of video.openFor) {
      const user: User | null = await userService.getUserByEmail(email);
      if (user) {
        const realtion: PrivateViodeRelationDto = {
          videoId: video.id,
          userId: user.id,
        };

        await this.createPrivateVideoRelation(realtion);
      }
    }
  }

  async getPrivateVideoIdsByUserId(userId: number): Promise<number[]> {
    const relations: PrivateVideoRelation[] = await AppDataSource.getRepository(
      PrivateVideoRelation,
    ).find({
      where: {
        userId,
      },
    });

    return relations.map((relation: PrivateVideoRelation) => {
      return relation.videoId;
    });
  }

  async deleteRelationByVideoId(videoId: number): Promise<DeleteResult> {
    return await AppDataSource.getRepository(PrivateVideoRelation).delete({
      videoId,
    });
  }
}

export const privateViodeRelationService: PrivateViodeRelationService =
  new PrivateViodeRelationService();
