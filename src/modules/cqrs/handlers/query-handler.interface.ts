import { IQuery, IQueryHandler as CqrsIQueryHandler } from '@nestjs/cqrs';

export type IQueryHandler<T extends IQuery = IQuery> = CqrsIQueryHandler<T>;
