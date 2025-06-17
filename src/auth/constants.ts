export const jwtConstants = {
    secret: process.env.JWT_SECRET || 'DEFAULT_SECRET_FOR_DEV_ONLY', // NEVER hardcode in production, use environment variables!
    // Example: secret: process.env.JWT_SECRET,
  };
  