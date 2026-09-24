import { Injectable } from '@nestjs/common';
import { CommandBus as CqrsCommandBus, ICommand as NestjsICommand } from '@nestjs/cqrs';

@Injectable()
export class CommandBus {
  constructor(protected readonly commandBus: CqrsCommandBus) {}

  async execute<TResponse>(query: NestjsICommand): Promise<TResponse> {
    return this.commandBus.execute<NestjsICommand, TResponse>(query);
  }
}
