import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity()
export class PrivateVideoRelation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  videoId!: number;

  @Column()
  userId!: number;
}
