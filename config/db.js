const {Pool} =require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on("connect",(client)=>{
    client.query("SET timezone='UTC'");
    console.log("PostgreSQL connected");
});

module.exports=pool;
