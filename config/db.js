const {Pool} =require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on("connect",(client)=>{
   client.query("SET timezone='UTC'").catch(err => 
        console.error('[DB] Failed to set timezone:', err.message)
    );
    console.log("PostgreSQL connected");
});

pool.on("error", (err) => {
    console.error("[Pool] Idle client error:", err.message);
});

module.exports=pool;
