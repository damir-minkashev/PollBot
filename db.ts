import pg from "pg"

let pool = new pg.Pool({
    user: "postgres",
    database: "gimme",
    port: 5432
});

export default pool;
