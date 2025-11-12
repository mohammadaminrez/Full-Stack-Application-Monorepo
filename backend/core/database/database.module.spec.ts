import { DatabaseModule } from './database.module';
import { MongooseModule } from '@nestjs/mongoose';

describe('DatabaseModule', () => {
  it('should be defined', () => {
    expect(DatabaseModule).toBeDefined();
  });

  it('should export MongooseModule', () => {
    const exports = Reflect.getMetadata('exports', DatabaseModule);
    expect(exports).toContain(MongooseModule);
  });

  it('should import MongooseModule.forRootAsync', () => {
    const imports = Reflect.getMetadata('imports', DatabaseModule);
    expect(imports).toBeDefined();
    expect(imports.length).toBeGreaterThan(0);
  });
});
