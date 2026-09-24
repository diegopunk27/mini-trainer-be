import { Injectable } from '@nestjs/common';
import { QueryBus as CqrsQueryBus } from '@nestjs/cqrs';
import { IQuery as NestjsIQuery } from '@nestjs/cqrs';

export type IQuery = NestjsIQuery;

@Injectable()
export class QueryBus {
  constructor(protected readonly queryBus: CqrsQueryBus) {}

  async execute<TResponse>(query: NestjsIQuery): Promise<TResponse> {
    return this.queryBus.execute<NestjsIQuery, TResponse>(query);
  }
}
