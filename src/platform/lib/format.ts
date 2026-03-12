export function formatChipCount(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return value.toLocaleString("en-US");
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The request could not be completed.";
}
