import { Test } from '@nestjs/testing';
import { NormalizeFilenameInterceptor } from '../normalize-filename.interceptor';
import * as iconv from 'iconv-lite';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('NormalizeFilenameInterceptor', () => {
  let interceptor: NormalizeFilenameInterceptor;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [NormalizeFilenameInterceptor],
    }).compile();

    interceptor = moduleRef.get<NormalizeFilenameInterceptor>(NormalizeFilenameInterceptor);
  });

  it('should normalize filename of uploaded files', (done) => {
    const req = {
      files: [
        {
          originalname: 'test-éñá.pdf',
          size: 12345,
          mimetype: 'application/pdf',
        },
      ],
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = {
      handle: () => of({}),
    };

    interceptor.intercept(context, next).subscribe(() => {
      expect(req.files[0].originalname).toBe(iconv.decode(Buffer.from('test-éñá.pdf', 'latin1'), 'utf8'));
      done();
    });
  });
});
