const KEY = "pulapay_offline_queue_v1";

function loadQueue() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function saveQueue(q) {
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function enqueueOperation(op) {
  const q = loadQueue();
  q.push({ ...op, enqueued_at: Date.now() });
  saveQueue(q);
}

export function getQueue() {
  return loadQueue();
}

export async function flushQueue(handlers) {
  const q = loadQueue();
  const remaining = [];
  for (const item of q) {
    try {
      const handler = handlers[item.entity]?.[item.action];
      if (!handler) {
        console.warn("[offlineQueue] No handler for", item);
        remaining.push(item);
        continue;
      }
      await handler(item.payload);
    } catch (e) {
      console.warn("[offlineQueue] Flush failed, keeping item", item, e);
      remaining.push(item);
    }
  }
  saveQueue(remaining);
  return remaining.length;
}