import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { RefreshToken } from './refreshToken.entity';
import { Video } from './video.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user) // specify inverse side as a second parameter
  refreshToken!: RefreshToken;

  @OneToMany(() => Video, (video: Video) => video.user)
  videos!: Video[];
}
