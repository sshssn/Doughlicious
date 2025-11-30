function mustGet(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

export const ENV = {
  SUPABASE_URL: () => mustGet("SUPABASE_URL"),
  SUPABASE_ANON_KEY: () => mustGet("SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: () => process.env["SUPABASE_SERVICE_ROLE_KEY"],
  DATABASE_URL: () => mustGet("DATABASE_URL"),
  CLERK_SECRET_KEY: () => mustGet("CLERK_SECRET_KEY"),
  STRIPE_SECRET_KEY: () => mustGet("STRIPE_SECRET_KEY")
}