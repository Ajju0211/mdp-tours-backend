import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  public readonly errorCode: string;

  constructor(
    errorCode: string,
    message?: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details?: any,
  ) {
    super(message || errorCode, statusCode);
    this.errorCode = errorCode;
  }
}
