function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: requireEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_REDIRECT_URI: requireEnv("GOOGLE_REDIRECT_URI"),
  APP_URL: requireEnv("APP_URL"),
  SESSION_SECRET: requireEnv("SESSION_SECRET")
};