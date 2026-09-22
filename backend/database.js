import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// OID 1700 corresponde al tipo NUMERIC/DECIMAL en PostgreSQL.
// Por defecto el driver 'pg' lo devuelve como string para evitar pérdida de precisión en números gigantes.
// Al registrar este parser, lo parseamos automáticamente a Number en todas las consultas de la aplicación.
pg.types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));

const pool = new pg.Pool({
	host: process.env.DB_HOST || "localhost",
	port: Number(process.env.DB_PORT) || 5433,
	user: process.env.DB_USER || "finance_user",
	password: process.env.DB_PASSWORD	|| "finance_password",
	database: process.env.DB_NAME || "finance_db",
});

export default pool;