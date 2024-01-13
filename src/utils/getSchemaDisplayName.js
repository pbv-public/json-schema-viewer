export function getSchemaDisplayName (schema) {
  return schema.title ?? schema.$id
}
