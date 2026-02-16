const pool= require("../config/db");

const bulkUpsertTeams=async (teams)=>{
    if(!teams || teams.length==0) return;

    let values=[];
    let placeholders=[];

    teams.forEach((t,i)=>{
        const base=i*4;
        placeholders.push(`($${base+1}, $${base+2},$${base+3}, $${base+4})`);
        values.push(t.id, t.name, t.shortName, t.strength);
    });

    const query=`
      INSERT INTO teams(id, name , short_name,strength)
      VALUES ${placeholders.join(",")}
       ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      short_name = EXCLUDED.short_name,
      strength = EXCLUDED.strength,
      updated_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(query,values);
};

module.exports = { bulkUpsertTeams };