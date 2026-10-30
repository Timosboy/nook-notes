export default () => {
  const secret = process.env.JWT_SECRET;
  if (
    process.env.NODE_ENV === 'production' &&
    (!secret || secret.length < 32)
  ) {
    throw new Error(
      'JWT_SECRET must contain at least 32 characters in production',
    );
  }
  return {
    jwt: { secret: secret || 'nook-development-secret-for-local-use' },
    port: Number(process.env.PORT ?? 3000),
    frontendUrls: (process.env.FRONTEND_URL ?? 'http://localhost:5173')
      .split(',')
      .map((url) => url.trim().replace(/\/+$/, ''))
      .filter(Boolean),
    database: {
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5433),
      user: process.env.DB_USER ?? 'notes',
      password: process.env.DB_PASSWORD ?? 'notes',
      name: process.env.DB_NAME ?? 'notes',
      ssl: process.env.DB_SSL === 'true',
    },
  };
};
