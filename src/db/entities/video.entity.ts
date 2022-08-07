import { Column, PrimaryGeneratedColumn, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Video {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  path!: string;

  @Column()
  mode!: boolean;

  @Column('simple-array')
  openFor!: string[];

  @ManyToOne(() => User, (user: User) => user.videos)
  user!: User;
}
