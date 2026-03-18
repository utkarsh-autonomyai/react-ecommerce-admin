const DEFAULT_MESSAGE = 'Something went wrong';

/**
 * Extracts a human-readable message from an API error.
 * Handles the hey-api client response shape where the actual
 * error body is nested under `error.response`.
 */
const getErrorMessage = (error: unknown): string => {
  const obj = typeof error === 'object' && error !== null ? error : null;

  // hey-api client wraps the response body — check nested shape first
  const source =
    obj &&
    'response' in obj &&
    typeof (obj as Record<string, unknown>).response === 'object'
      ? (obj as Record<string, unknown>).response
      : obj;

  if (source && typeof source === 'object' && 'message' in source) {
    const msg = (source as { message: unknown }).message;
    if (Array.isArray(msg)) {
      return typeof msg[0] === 'string' ? msg[0] : String(msg[0]);
    }
    if (typeof msg === 'string') return msg;
  }

  return DEFAULT_MESSAGE;
};

/**
 * Extracts the HTTP status code from an API error, if available.
 */
const getErrorStatus = (error: unknown): number | null => {
  const obj = typeof error === 'object' && error !== null ? error : null;

  if (
    obj &&
    'status' in obj &&
    typeof (obj as Record<string, unknown>).status === 'number'
  ) {
    return (obj as { status: number }).status;
  }

  return null;
};

export { getErrorMessage, getErrorStatus };
