import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Admin, AdminSchema } from "./schema/admin.schema";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";


@Module({
    imports: [MongooseModule.forFeature([
        {name: Admin.name, schema: AdminSchema}
    ]),
JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    secret: config.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: '1d' },
  }),
})],
    providers: [AuthService],
    controllers: [AuthController]
})
export class AuthModule{}