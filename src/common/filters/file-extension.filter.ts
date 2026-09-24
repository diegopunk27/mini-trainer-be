import { FileWithoutStream } from '@common/interfaces/file-without-stream.interface';
import { BadRequestException } from '@nestjs/common';

export const fileExtensionFilter = (
  allowedExtensions: string[],
  req: Express.Request,
  file: FileWithoutStream,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void => {
  const extension = file.originalname.split('.').pop()?.toLowerCase() || '';
  if (allowedExtensions.includes(extension)) {
    callback(null, true);
  } else {
    callback(new BadRequestException('Invalid file extension'), false);
  }
};
