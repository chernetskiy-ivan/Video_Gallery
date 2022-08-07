import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  refreshToken!: string;

  @OneToOne(() => User, (user: User) => user.refreshToken) // specify inverse side as a second parameter
  @JoinColumn()
  user!: User;
}
