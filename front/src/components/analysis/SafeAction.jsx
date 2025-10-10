export function safeAction(fn, { debounceMs = 250, lockMs = 700, retries = 3, onSuccess, onError } = {}) {
  let lastCall = 0;
  let lockedUntil = 0;

  return async (...args) => {
    const now = Date.now();
    if (now - lastCall < debounceMs) return;
    lastCall = now;
    if (now < lockedUntil) return;
    lockedUntil = now + lockMs;

    let attempt = 0;
    let delay = 1000;

    while (attempt <= retries) {
      try {
        const res = await fn(...args);
        lockedUntil = 0;
        if (onSuccess) onSuccess(res);
        return res;
      } catch (e) {
        attempt += 1;
        if (attempt > retries) {
          lockedUntil = 0;
          if (onError) onError(e);
          console.warn("[safeAction] final failure:", e);
          throw e;
        }
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  };
}