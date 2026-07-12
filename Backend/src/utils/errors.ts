export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: number = 500,
    public readonly code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 422, "VALIDATION_ERROR");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden: insufficient permissions") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

export class InactiveAccountError extends AppError {
  constructor() {
    super("Account is inactive. Please contact support.", 403, "ACCOUNT_INACTIVE");
  }
}

export class AssetAlreadyAllocatedError extends AppError {
  readonly currentAllocation: Record<string, unknown>;
  constructor(currentAllocation: Record<string, unknown>) {
    super("Asset is already allocated", 409, "ASSET_ALREADY_ALLOCATED");
    this.currentAllocation = currentAllocation;
  }
}
