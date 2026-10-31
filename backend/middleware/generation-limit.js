// Per-process cap for costly image requests. Authenticated users get 12/hour.
const windows = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 12;

module.exports = function generationLimit(req, res, next) {
  const now = Date.now();
  const key = String(req.user.userId);
  let state = windows.get(key);
  if (!state || now >= state.resetAt) state = { count: 0, resetAt: now + WINDOW_MS };
  if (state.count >= LIMIT) {
    res.set('Retry-After', String(Math.ceil((state.resetAt - now) / 1000)));
    return res.status(429).json({ success: false, message: 'Generation limit reached. Try again later.' });
  }
  state.count += 1;
  windows.set(key, state);
  if (windows.size > 5000) {
    for (const [userId, entry] of windows) if (now >= entry.resetAt) windows.delete(userId);
  }
  next();
};
