import pg from "pg"

let pool = new pg.Pool({
    user: "postgres",
    database: "gimme",
    host: "postgres",
    password: "postgres",
    port: 5432
});

export default pool;
