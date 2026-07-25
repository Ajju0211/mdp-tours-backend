import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';
import { ERROR_CODES } from '../../../common/exceptions/error-codes.enum';

export class QueryNotFoundException extends BaseException {
  constructor(message?: string) {
    super(
      ERROR_CODES.QUERY_NOT_FOUND.code,
      message || ERROR_CODES.QUERY_NOT_FOUND.defaultMessage,
      HttpStatus.NOT_FOUND,
    );
  }
}
