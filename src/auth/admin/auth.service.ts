import { Injectable } from '@nestjs/common';
import { BaseException } from '../../common/exceptions/base.exception';
import { ERROR_CODES } from '../../common/exceptions/error-codes.enum';
import { AdminAlreadyExistsException, InvalidCredentialsException, InvalidTokenException } from './exceptions/auth.exception';
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
   * Authenticates an admin user using email and password.
   * 
   * @param email - The admin user's email address
   * @param password - The raw password provided during login
   * @throws InvalidCredentialsException if the user is not found or password does not match
   * @returns An object containing the JWT access token and the user's profile
   */
  async login(email: string, password: string) {
    const admin = await this.adminModel.findOne({ email });
    if (!admin) throw new InvalidCredentialsException();

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new InvalidCredentialsException();

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
   * Registers a new administrator account.
   * 
   * @param email - The desired email address
   * @param password - The raw password, which will be securely hashed
   * @throws BaseException if email or password are missing
   * @throws AdminAlreadyExistsException if user already exists
   * @returns A success message and the newly created admin profile
   */
  async signup(email: string, password: string) {
    if (!email || !password) {
      throw new BaseException(ERROR_CODES.BAD_REQUEST.code, 'Email and password are required');
    }
    const existingAdmin = await this.adminModel.findOne({ email });
    console.log('Existing admin:', existingAdmin);
    if (existingAdmin) {
      throw new AdminAlreadyExistsException();
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
   * Verifies and decodes a JWT access token, ensuring the associated admin user exists.
   * Used primarily by authentication guards.
   * 
   * @param token - The raw JWT string
   * @throws InvalidTokenException if the token is invalid, expired, or user no longer exists
   * @returns The decoded admin user document
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const admin = await this.adminModel.findById(payload.sub);
      if (!admin) throw new InvalidTokenException();
      return admin;
    } catch (err) {
      throw new InvalidTokenException();
    }
  }
}
