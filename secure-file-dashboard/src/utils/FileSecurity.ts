export interface FileSecuritySpec {
  allowedTypes: readonly ['application/pdf', 'image/png']; // Literal type with readonly
  maxSize: 100_000_000; // 100MB
  scanMethod: 'client-side validation using browser APIs';
}

export const validateFile = (file: File, spec: FileSecuritySpec): boolean => {
  const isValidType = (spec.allowedTypes as readonly string[]).includes(file.type); // Convert to a generic array
  const isValidSize = file.size <= spec.maxSize;

  return isValidType && isValidSize;
};