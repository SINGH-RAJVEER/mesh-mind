import { Pool, type PoolClient } from "pg";

class PgVectorConnection {
  private static instance: PgVectorConnection;
  private pool: Pool;
  private isConnected: boolean = false;

  private constructor() {
    const config = {
      host: process.env.POSTGRES_HOST || "localhost",
      port: parseInt(process.env.POSTGRES_PORT || "5432"),
      database: process.env.POSTGRES_DB || "mindscribe_vectors",
      user: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(config);

    this.pool.on("error", (err: Error) => {
      console.error("Unexpected error on idle PostgreSQL client:", err);
    });

    this.pool.on("connect", () => {
      if (!this.isConnected) {
        console.log("Connected to PostgreSQL with pgvector");
        this.isConnected = true;
      }
    });
  }

  public static getInstance(): PgVectorConnection {
    if (!PgVectorConnection.instance) {
      PgVectorConnection.instance = new PgVectorConnection();
    }
    return PgVectorConnection.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  public async query(text: string, params?: unknown[]): Promise<unknown> {
    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (err) {
      console.error("Database query error:", err);
      throw err;
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
    this.isConnected = false;
    console.log("PostgreSQL connection pool closed");
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.pool.query("SELECT 1");
      return result.rows.length > 0;
    } catch (err) {
      console.error("PostgreSQL health check failed:", err);
      return false;
    }
  }
}

export const pgVector = PgVectorConnection.getInstance();
export default pgVector;
