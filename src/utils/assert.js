export function assert(expr, msg = "assertion failed", context = null) {
  if (!expr) {
    if (context) {
      console.error(msg, context)
    }
    throw new Error(`assert failed${msg ? `: ${msg}` : ""}`)
  }
}
assert.fail = (msg, context = null) => assert(false, msg, context)
