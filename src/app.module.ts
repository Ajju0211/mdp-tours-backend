import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from './config/ validation';
import { DatabaseModule } from './database/database.module';
import { PackageModule } from './module/packages/package.module';
import { AuthModule } from './auth/admin/auth.module';
import { QueryModule } from './module/query/query.module';
import { IntegrationModule } from './integration/integrantion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    DatabaseModule,
    IntegrationModule,
    PackageModule,
    QueryModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
