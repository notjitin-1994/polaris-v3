export class OllamaError extends Error {
  public code: string;
  public causeError?: unknown;

  constructor(message: string, code = 'OLLAMA_ERROR', cause?: unknown) {
    super(message);
    this.name = 'OllamaError';
    this.code = code;
    this.causeError = cause;
  }
}

export class TimeoutError extends OllamaError {
  constructor(message = 'Ollama request timed out', cause?: unknown) {
    super(message, 'TIMEOUT', cause);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends OllamaError {
  constructor(message = 'Validation failed', cause?: unknown) {
    super(message, 'VALIDATION_ERROR', cause);
    this.name = 'ValidationError';
  }
}

export class ServiceUnavailableError extends OllamaError {
  constructor(message = 'Ollama service unavailable', cause?: unknown) {
    super(message, 'SERVICE_UNAVAILABLE', cause);
    this.name = 'ServiceUnavailableError';
  }
}
