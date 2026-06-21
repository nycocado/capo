const ttl = Number(process.env.THROTTLE_TTL ?? 60_000);

export const globalRateLimit = {
  ttl,
  limit: Number(process.env.THROTTLE_LIMIT ?? 100),
};

export const loginRateLimit = {
  ttl,
  limit: Number(process.env.THROTTLE_LOGIN_LIMIT ?? 5),
};
