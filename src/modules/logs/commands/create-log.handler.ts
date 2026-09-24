import { CommandHandler, ICommandHandler } from '@cqrs';
import { CreateLogCommand } from './create-log.command';
import Logger from '@common/config-logs/winston.logs';

@CommandHandler(CreateLogCommand)
export class CreateLogCommandHandler implements ICommandHandler<CreateLogCommand> {
  async execute(command: CreateLogCommand): Promise<void> {
    Logger.error(`Error: ${command.stackTrace}`);
  }
}
