export default () => ({
  port: Number(process.env.PORT ?? 3000),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'notes',
    password: process.env.DB_PASSWORD ?? 'notes',
    name: process.env.DB_NAME ?? 'notes',
  },
});
