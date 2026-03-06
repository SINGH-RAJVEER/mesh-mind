import postgres, { type Sql } from "postgres";

class PgVectorConnection {
  private static instance: PgVectorConnection;
  private sql: Sql;
  private isConnected: boolean = false;

  private constructor() {
    this.sql = postgres({
      host: process.env.POSTGRES_HOST || "localhost",
      port: parseInt(process.env.POSTGRES_PORT || "5432"),
      database: process.env.POSTGRES_DB || "mindscribe_vectors",
      user: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD,
      max: 20, // Maximum number of connections
    });

    this.isConnected = true;
    console.log("Connected to PostgreSQL with pgvector");
  }

  public static getInstance(): PgVectorConnection {
    if (!PgVectorConnection.instance) {
      PgVectorConnection.instance = new PgVectorConnection();
    }
    return PgVectorConnection.instance;
  }

  public getSql(): Sql {
    return this.sql;
  }

  public async query(text: string, params?: unknown[]): Promise<unknown> {
    try {
      const result = await this.sql.unsafe(text, (params || []) as any);
      return result;
    } catch (err) {
      console.error("Database query error:", err);
      throw err;
    }
  }

  public async close(): Promise<void> {
    await this.sql.end();
    this.isConnected = false;
    console.log("PostgreSQL connection closed");
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.sql`SELECT 1`;
      return true;
    } catch (err) {
      console.error("PostgreSQL health check failed:", err);
      return false;
    }
  }
}

export const pgVector = PgVectorConnection.getInstance();
export default pgVector;
