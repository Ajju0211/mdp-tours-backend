import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin } from './schema/admin.schema';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Admin.name) private adminModel: Model<Admin>,
        private jwtService: JwtService,
    ) { }

    async login(email: string, password: string) {
        const admin = await this.adminModel.findOne({ email });

        if (!admin) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        const payload = { sub: admin._id, role: admin.role };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async signup(email: string, password: string) {
        const existingAdmin = await this.adminModel.findOne({ email });
        if (existingAdmin) {
            throw new Error('Admin already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await this.adminModel.create({
            email,
            password: hashedPassword,
        });

        return {
            message: 'Admin created successfully',
        };
    }
}