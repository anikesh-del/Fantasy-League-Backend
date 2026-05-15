require("dotenv").config();
const app=require("./app");
const pool=require("./config/db")

require('./workers/sync.worker');
require('./workers/settlement.worker');
const { startScheduler } = require('./workers/scheduler');

const PORT= process.env.PORT || 5000;
(async ()=>{
    try{
        const res= await pool.query("SELECT current_database()");
        console.log("DB connection verified", res.rows[0].current_database);
        
        await startScheduler();
        
        app.listen(PORT, ()=>{
            console.log(`server running on port ${PORT}`);
        });
    }catch(error){
        console.error("DB connection failed:", error.message);
        process.exit(1);
    }
}) ();