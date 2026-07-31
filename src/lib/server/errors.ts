import "server-only";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ConfigurationError extends AppError {
  constructor(message = "El servicio no está configurado.") {
    super(503, "service_not_configured", message);
    this.name = "ConfigurationError";
  }
}
