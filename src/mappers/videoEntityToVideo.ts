import { Video } from '../db/entities/video.entity';
import { IVideoOutput } from './interfaces/IVideoOutput';

export const videoEntityToVideo = (video: Video): IVideoOutput => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, path, mode, openFor, ...oterProps } = video;
  return oterProps;
};
