const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 10;

module.exports = function authRateLimit(req, res, next) {
  const now = Date.now();
  const key = `${req.ip}:${req.path}`;
  let state = attempts.get(key);
  if (!state || now >= state.resetAt) state = { count: 0, resetAt: now + WINDOW_MS };
  if (state.count >= LIMIT) {
    res.set('Retry-After', String(Math.ceil((state.resetAt - now) / 1000)));
    return res.status(429).json({ success: false, message: 'Too many attempts. Try again later.' });
  }
  state.count += 1;
  attempts.set(key, state);
  if (attempts.size > 10_000) attempts.delete(attempts.keys().next().value);
  next();
};
