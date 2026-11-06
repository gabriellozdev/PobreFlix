// Camada HTTP compartilhada: deduplica chamadas em andamento e guarda
// respostas em memória + sessionStorage por um tempo (TTL), para não repetir
// requisições que podem ser reaproveitadas.

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string,
  ) {
    super(message);
  }
}

interface Entry {
  t: number;
  v: unknown;
}

const memory = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();
const STORE_PREFIX = 'pf:c:';

function readStore(key: string): Entry | undefined {
  try {
    const raw = sessionStorage.getItem(STORE_PREFIX + key);
    return raw ? (JSON.parse(raw) as Entry) : undefined;
  } catch {
    return undefined;
  }
}

function writeStore(key: string, e: Entry) {
  try {
    sessionStorage.setItem(STORE_PREFIX + key, JSON.stringify(e));
  } catch {
    // cota cheia: fica só em memória
  }
}

export interface FetchOptions {
  /** tempo de vida em ms (padrão 5 min) */
  ttl?: number;
  /** guardar também no sessionStorage (padrão true; desligue para respostas grandes) */
  persist?: boolean;
  headers?: Record<string, string>;
  timeout?: number;
}

export async function getJson<T>(url: string, opts: FetchOptions = {}): Promise<T> {
  const { ttl = 5 * 60_000, persist = true, headers, timeout = 15_000 } = opts;
  const now = Date.now();
  const mem = memory.get(url);
  if (mem && now - mem.t < ttl) return mem.v as T;
  if (persist) {
    const st = readStore(url);
    if (st && now - st.t < ttl) {
      memory.set(url, st);
      return st.v as T;
    }
  }
  const running = inflight.get(url);
  if (running) return running as Promise<T>;

  const p = (async () => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json', ...headers }, signal: ctrl.signal });
      if (!res.ok) {
        const msg =
          res.status === 429
            ? 'Muitas requisições em pouco tempo. Tente de novo em instantes.'
            : `O serviço respondeu com erro ${res.status}.`;
        throw new ApiError(msg, res.status, url);
      }
      const data = (await res.json()) as T;
      const entry = { t: Date.now(), v: data };
      memory.set(url, entry);
      if (persist) writeStore(url, entry);
      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const aborted = (err as Error)?.name === 'AbortError';
      throw new ApiError(
        aborted ? 'O serviço demorou demais para responder.' : 'Não foi possível conectar ao serviço.',
        0,
        url,
      );
    } finally {
      clearTimeout(timer);
      inflight.delete(url);
    }
  })();
  inflight.set(url, p);
  return p;
}

export function qs(params: Record<string, string | number | undefined | null>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') u.set(k, String(v));
  const s = u.toString();
  return s ? `?${s}` : '';
}
