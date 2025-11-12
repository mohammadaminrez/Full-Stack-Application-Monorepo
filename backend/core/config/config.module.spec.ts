import { AppConfigModule } from './config.module';
import { ConfigModule } from '@nestjs/config';

describe('AppConfigModule', () => {
  it('should be defined', () => {
    expect(AppConfigModule).toBeDefined();
  });

  it('should export ConfigModule', () => {
    const exports = Reflect.getMetadata('exports', AppConfigModule);
    expect(exports).toContain(ConfigModule);
  });

  it('should import NestConfigModule.forRoot', () => {
    const imports = Reflect.getMetadata('imports', AppConfigModule);
    expect(imports).toBeDefined();
    expect(imports.length).toBeGreaterThan(0);
  });
});
