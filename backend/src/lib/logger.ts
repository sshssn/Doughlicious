type Entry = { level: "info" | "error" | "warn"; message: string; context?: Record<string, unknown> }

export function log(entry: Entry) {
  const payload = { ts: new Date().toISOString(), ...entry }
  console.log(JSON.stringify(payload))
}