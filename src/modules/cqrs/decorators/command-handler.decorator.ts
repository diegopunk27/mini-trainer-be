import { CommandHandler as CqrsCommandHandler, ICommand } from '@nestjs/cqrs';

export const CommandHandler = (command: ICommand): ClassDecorator => {
  return CqrsCommandHandler(command);
};
