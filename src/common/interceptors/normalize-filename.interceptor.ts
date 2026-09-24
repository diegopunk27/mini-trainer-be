import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';

interface UploadedFile {
  originalname: string;
}
import { Observable } from 'rxjs';
import iconv from 'iconv-lite';
import { map } from 'rxjs/operators';

@Injectable()
export class NormalizeFilenameInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const files = request.files;
    const file = request.file;

    if (files) {
      files.forEach((f: UploadedFile) => {
        f.originalname = this.normalizeString(f.originalname);
      });
    }

    if (file) {
      file.originalname = this.normalizeString(file.originalname);
    }

    return next.handle().pipe(
      map((data) => {
        return data;
      }),
    );
  }

  private normalizeString(fileName: string): string {
    return iconv.decode(Buffer.from(fileName, 'latin1'), 'utf8');
  }
}
