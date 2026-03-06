import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
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
  ) {}

  /**
   * Login an admin user
   * @param email
   * @param password
   * @returns JWT access token
   */
  async login(email: string, password: string) {
    const admin = await this.adminModel.findOne({ email });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: admin._id.toString(),
      role: admin.role,
      email: admin.email,
    };
    const access_token = this.jwtService.sign(payload, { expiresIn: '1d' });

    return {
      access_token,
      user: {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  /**
   * Signup a new admin
   * @param email
   * @param password
   * @returns success message
   */
  async signup(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    const existingAdmin = await this.adminModel.findOne({ email });
    console.log('Existing admin:', existingAdmin);
    if (existingAdmin) {
      throw new BadRequestException('Admin already exists');
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await this.adminModel.create({
      email,
      password: hashedPassword,
      role: 'admin', // default role
    });

    return {
      message: 'Admin created successfully',
      user: {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  /**
   * Optional: verify token payload (for Guards)
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const admin = await this.adminModel.findById(payload.sub);
      if (!admin) throw new UnauthorizedException('Invalid token');
      return admin;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
