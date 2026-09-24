import { ICommand, IQuery } from '@nestjs/cqrs';
import { CommandBus } from '../buses/command-bus';
import { QueryBus } from '../buses/query-bus';

export class CqrsController {
  constructor(
    protected readonly queryBus: QueryBus,
    protected readonly commandBus: CommandBus,
  ) {}

  async executeCommand<T>(command: ICommand): Promise<T> {
    return this.commandBus.execute<T>(command);
  }

  async executeQuery<T>(query: IQuery): Promise<T> {
    return this.queryBus.execute<T>(query);
  }
}
