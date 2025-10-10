export async function callBackendFunction(name, payload) {
  // Retry avec backoff exponentiel
  const maxRetries = 3;
  let retryDelay = 1000;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(`/api/functions/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const contentType = res.headers.get("content-type") || "";
      const parsed = contentType.includes("application/json") ? await res.json() : await res.text();

      if (!res.ok) {
        console.warn(`[backend] Function ${name} returned status ${res.status}`, parsed);
        
        // Retry sur erreurs serveur (5xx) mais pas sur erreurs client (4xx)
        if (res.status >= 500 && attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2;
          continue;
        }
        
        return { ok: false, status: res.status, data: parsed };
      }

      return { ok: true, status: res.status, data: parsed };
      
    } catch (err) {
      console.warn(`[backend] Function ${name} attempt ${attempt + 1} failed:`, err);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2;
        continue;
      }
      
      return { ok: false, status: 0, error: String(err) };
    }
  }
}