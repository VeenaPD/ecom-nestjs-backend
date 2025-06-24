export const jwtConstants = {
    secret: process.env.JWT_SECRET || 'DEFAULT_SECRET_FOR_DEV_ONLY', // NEVER hardcode in production, use environment variables!
    // Example: secret: process.env.JWT_SECRET,
    expirationTime: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpirationTime: process.env.JWT_REFRESH_ACCESS_TOKEN_EXPIRATION_TIME
};
  