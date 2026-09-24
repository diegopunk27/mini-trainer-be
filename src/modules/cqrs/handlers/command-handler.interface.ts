import { ICommand, ICommandHandler as CqrsICommandHandler } from '@nestjs/cqrs';

export type ICommandHandler<T extends ICommand = ICommand> = CqrsICommandHandler<T>;
