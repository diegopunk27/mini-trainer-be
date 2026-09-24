import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileExtensionFilter } from '@common/filters/file-extension.filter';
import { NormalizeFilenameInterceptor } from '@common/interceptors/normalize-filename.interceptor';

/**
 * Custom decorator for file upload interceptors.
 * Validates file extensions and normalizes filenames (handles latin1 encoding from multer).
 * @param extensionsList Array of allowed file extensions (e.g. ['pdf', 'png', 'xlsx'])
 * @param maxFiles Maximum number of files to upload (default: 10)
 */
export function apiFileInterceptor(extensionsList: string[], maxFiles = 10): MethodDecorator & ClassDecorator {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor('files', maxFiles, {
        fileFilter: (req, file, callback) => {
          fileExtensionFilter(extensionsList, req, file, callback);
        },
      }),
      NormalizeFilenameInterceptor,
    ),
  );
}
