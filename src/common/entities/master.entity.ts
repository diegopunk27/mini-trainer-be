import { Column, PrimaryColumn } from 'typeorm';

export class MasterEntity {
  @PrimaryColumn()
  id: number;
  @Column()
  description: string;
}
