import { DataSource } from 'typeorm';
import { PrivateVideoRelation } from './entities/privateVideoRelation';
import { RefreshToken } from './entities/refreshToken.entity';
import { User } from './entities/user.entity';
import { Video } from './entities/video.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'video_gallery_test',
  synchronize: true,
  logging: true,
  entities: [Video, User, RefreshToken, PrivateVideoRelation],
  subscribers: [],
  migrations: [],
});
