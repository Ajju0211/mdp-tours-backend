export const ERROR_CODES = {
  // General Errors
  INTERNAL_SERVER_ERROR: { code: 'INTERNAL_SERVER_ERROR', defaultMessage: 'An unexpected error occurred.' },
  BAD_REQUEST: { code: 'BAD_REQUEST', defaultMessage: 'Invalid request data.' },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', defaultMessage: 'Authentication required.' },
  FORBIDDEN: { code: 'FORBIDDEN', defaultMessage: 'You do not have permission to access this resource.' },
  NOT_FOUND: { code: 'NOT_FOUND', defaultMessage: 'Resource not found.' },
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', defaultMessage: 'Validation failed.' },
  
  // Auth Errors
  USER_NOT_FOUND: { code: 'USER_NOT_FOUND', defaultMessage: 'The requested user could not be found.' },
  USER_ALREADY_EXISTS: { code: 'USER_ALREADY_EXISTS', defaultMessage: 'A user with these details already exists.' },
  INVALID_CREDENTIALS: { code: 'INVALID_CREDENTIALS', defaultMessage: 'Invalid email or password.' },
  INVALID_TOKEN: { code: 'INVALID_TOKEN', defaultMessage: 'Invalid or expired authentication token.' },

  // Package Errors
  PACKAGE_NOT_FOUND: { code: 'PACKAGE_NOT_FOUND', defaultMessage: 'The requested package was not found.' },

  // Query Errors
  QUERY_NOT_FOUND: { code: 'QUERY_NOT_FOUND', defaultMessage: 'The requested query was not found.' },

  // Upload Errors
  UPLOAD_FAILED: { code: 'UPLOAD_FAILED', defaultMessage: 'File upload failed.' },
  INVALID_FILE_TYPE: { code: 'INVALID_FILE_TYPE', defaultMessage: 'Invalid file type.' },
  FILE_TOO_LARGE: { code: 'FILE_TOO_LARGE', defaultMessage: 'File exceeds the maximum allowed size.' },
};
