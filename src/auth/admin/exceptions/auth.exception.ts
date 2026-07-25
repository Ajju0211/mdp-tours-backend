import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';
import { ERROR_CODES } from '../../../common/exceptions/error-codes.enum';

export class InvalidCredentialsException extends BaseException {
  constructor(message?: string) {
    super(
      ERROR_CODES.INVALID_CREDENTIALS.code,
      message || ERROR_CODES.INVALID_CREDENTIALS.defaultMessage,
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class AdminAlreadyExistsException extends BaseException {
  constructor(message?: string) {
    super(
      ERROR_CODES.USER_ALREADY_EXISTS.code,
      message || ERROR_CODES.USER_ALREADY_EXISTS.defaultMessage,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidTokenException extends BaseException {
  constructor(message?: string) {
    super(
      ERROR_CODES.INVALID_TOKEN.code,
      message || ERROR_CODES.INVALID_TOKEN.defaultMessage,
      HttpStatus.UNAUTHORIZED,
    );
  }
}
