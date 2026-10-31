import pkg from 'pg';
const { Pool } = pkg;

let currentPool: any = null;

function isValidPostgresUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.startsWith('postgres://') || trimmed.startsWith('postgresql://');
}

function createPoolInstance(connectionString: string) {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,                          // 10 koneksi paralel untuk melayani burst permintaan
    idleTimeoutMillis: 30000,          // Biarkan koneksi idle hingga 30 detik untuk reuse cepat
    connectionTimeoutMillis: 20000,    // 20 detik untuk toleransi latensi jaringan cloud/Aiven
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

  pool.on('error', (err: any) => {
    console.warn('PostgreSQL idle client warning/error:', err?.message || err);
  });

  return pool;
}

export function getPool() {
  const connectionString = (process.env.DATABASE_URL || '').trim();
  if (!isValidPostgresUrl(connectionString)) {
    return null;
  }
  if (!currentPool) {
    currentPool = createPoolInstance(connectionString);
  }
  return currentPool;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransientConnectionError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  const code = (err.code || '').toLowerCase();
  return (
    msg.includes('timeout exceeded') ||
    msg.includes('connection timeout') ||
    msg.includes('etimedout') ||
    msg.includes('econnreset') ||
    msg.includes('connection terminated') ||
    msg.includes('the database system is starting up') ||
    msg.includes('too many clients already') ||
    code === '57p01' || // admin_shutdown
    code === '57p02' || // crash_shutdown
    code === '57p03'    // cannot_connect_now
  );
}

export async function query(text: string, params?: any[], maxRetries: number = 2): Promise<any> {
  const connectionString = (process.env.DATABASE_URL || '').trim();
  if (!isValidPostgresUrl(connectionString)) {
    throw new Error('DATABASE_URL belum dikonfigurasi atau tidak valid. Harap tentukan DATABASE_URL Aiven PostgreSQL di panel Aiven.');
  }

  let attempt = 0;
  while (true) {
    let pool = getPool();
    if (!pool) {
      currentPool = createPoolInstance(connectionString);
      pool = currentPool;
    }

    let client: any = null;
    try {
      client = await pool.connect();
      // Handle error on acquired client to avoid uncaught ECONNRESET crashing node process
      client.on('error', (clientErr: any) => {
        console.warn('PostgreSQL client connection error (handled):', clientErr?.message || clientErr);
      });
      const start = Date.now();
      const res = await client.query(text, params);
      const duration = Date.now() - start;
      if (duration > 2000) {
        console.log(`Executed query (${duration}ms)`, { text: text.substring(0, 50), rows: res.rowCount });
      }
      return res;
    } catch (err: any) {
      const isTransient = isTransientConnectionError(err);
      if (attempt < maxRetries && isTransient) {
        attempt++;
        const backoffMs = attempt * 800;
        console.warn(`[Aiven DB Retry ${attempt}/${maxRetries}] ${err?.message || 'Connection error'}. Retrying in ${backoffMs}ms...`);
        // Jika pool terindikasi corrupt atau deadlock, reset pool
        if (attempt === maxRetries && currentPool) {
          try {
            currentPool.end().catch(() => {});
          } catch (_) {}
          currentPool = null;
        }
        await sleep(backoffMs);
        continue;
      }
      throw err;
    } finally {
      if (client) {
        try {
          client.release();
        } catch (_) {}
      }
    }
  }
}

export function updatePoolConfig(newUrl: string) {
  process.env.DATABASE_URL = newUrl;
  if (currentPool) {
    currentPool.end().catch(() => {});
    currentPool = null;
  }
}

