import { QueryHandler as CqrsQueryHandler, IQuery } from '@nestjs/cqrs';

export const QueryHandler = (query: IQuery): ClassDecorator => {
  return CqrsQueryHandler(query);
};
