import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1772000000000 implements MigrationInterface {
  name = 'InitialSchema1772000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('SELECT 1');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('SELECT 1');
  }
}
