export function isClientEditorAvailable() {
  return process.env.NODE_ENV === "development";
}
