import express from 'express';
import { VideoPayloadDto } from '../services/dto/VideoPayloadDto';
import path from 'path';

export const validateVideoCreateMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const createVideoPayload: VideoPayloadDto = req.body;

    // const candidateFile: any = req.files?.undefined;
    const candidateFile: any = req.files?.file;
    const extensionName = path.extname(candidateFile.name);
    const allowedExtension = ['.mp4'];

    if (!allowedExtension.includes(extensionName)) {
      throw new Error('Invalide file, use only .mp4 format for video');
    }

    if (createVideoPayload.mode == 'true') {
      if (
        createVideoPayload.openFor != undefined &&
        createVideoPayload.openFor !== ''
      ) {
        throw new Error(
          'Invalide body. If video mode is true, put openFor empty',
        );
      }
    } else {
      if (
        createVideoPayload.openFor == undefined ||
        createVideoPayload.openFor === ''
      ) {
        throw new Error(
          'Invalide body. If video mode is false, openFor must not be empty',
        );
      }
    }
    if (
      createVideoPayload.description == undefined ||
      createVideoPayload.description === ''
    ) {
      throw new Error('Invalide body. Video must have description');
    }

    next();
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
};
