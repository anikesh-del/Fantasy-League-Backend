require("dotenv").config();
const app=require("./app");
const pool=require("./config/db")

const PORT= process.env.PORT || 5000;
(async ()=>{
    try{
        await pool.query("SELECT 1");
        console.log("DB connection verified");


        app.listen(PORT, ()=>{
            console.log(`server running on port ${PORT}`);
        });
    }catch(error){
        console.error("DB connection failed:", error.message);
    }
}) ();