import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';
import { ERROR_CODES } from '../../../common/exceptions/error-codes.enum';

export class InvalidFileTypeException extends BaseException {
  constructor(message?: string) {
    super(
      ERROR_CODES.INVALID_FILE_TYPE.code,
      message || ERROR_CODES.INVALID_FILE_TYPE.defaultMessage,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class FileTooLargeException extends BaseException {
  constructor(message?: string) {
    super(
      ERROR_CODES.FILE_TOO_LARGE.code,
      message || ERROR_CODES.FILE_TOO_LARGE.defaultMessage,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class UploadFailedException extends BaseException {
  constructor(message?: string) {
    super(
      ERROR_CODES.UPLOAD_FAILED.code,
      message || ERROR_CODES.UPLOAD_FAILED.defaultMessage,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class StorageOperationFailedException extends BaseException {
  constructor(message?: string) {
    super(
      'STORAGE_OPERATION_FAILED',
      message || 'Storage operation failed.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
