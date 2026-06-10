const pool=require("../config/db")

const bulkInsertUserGameweekPoints= async(userGameweekData)=>{

    const values =[];
    const placeholder=[];
 
    userGameweekData.forEach((u , i) => {
        const base =i*4;
        placeholder.push(`($${base+1}, $${base+2}, $${base+3}, $${base+4})`);

        values.push(
            u.user_id, 
            u.fantasy_team_id,
            u.gameweek,
            u.points
        );
    });

    const query= `
    INSERT INTO user_gameweek_points(user_id, fantasy_team_id, gameweek , points)
    VALUES ${placeholder.join(",")}
    ON CONFLICT (fantasy_team_id , gameweek) DO UPDATE SET
    user_id=EXCLUDED.user_id,
    fantasy_team_id=EXCLUDED.fantasy_team_id,
    gameweek=EXCLUDED.gameweek,
    points=EXCLUDED.points,
    created_at= CURRENT_TIMESTAMP
    `;

    await pool.query(query, values);
    
}


const getLeaderboard=async({gameweekId,limit,offset})=>{
    let query;
    let params;

    if(gameweekId){
        query=`
        SELECT 
        RANK() OVER (ORDER BY ugp.points DESC) AS rank,
        u.username, ft.team_name,ugp.points
        FROM user_gameweek_points ugp
        INNER JOIN users u ON u.user_id=ugp.user_id
        INNER JOIN fantasy_team ft ON ft.fantasy_team_id =ugp.fantasy_team_id
        WHERE ugp.gameweek=$1
        ORDER BY ugp.points DESC
        LIMIT $2 OFFSET $3`;
        params=[gameweekId, limit , offset];
    }else{
        query=`
        SELECT 
        RANK() OVER (ORDER BY ugp.points DESC) AS rank,
        u.username, ft.team_name,
        SUM(ugp.points) AS points
        FROM user_gameweek_points ugp
        INNER JOIN users u ON u.user_id=ugp.user_id
        INNER JOIN fantasy_team ft ON ft.fantasy_team_id =ugp.fantasy_team_id
        GROUP BY u.user_id, u.username, ft.team_name, ugp.fantasy_team_id
        ORDER BY points DESC
        LIMIT $1 OFFSET $2`;
        params=[limit , offset];
    }
    const result=await pool.query(query, params);
    return result.rows;
}

async function getLeaderboardCount({ gameweekId }) {
  let query;
  let params;

  if (gameweekId) {
    query = `SELECT COUNT(*) FROM user_gameweek_points WHERE gameweek = $1`;
    params = [gameweekId];
  } else {
    query = `SELECT COUNT(DISTINCT user_id) FROM user_gameweek_points`;
    params = [];
  }

  const result = await pool.query(query, params);
  return parseInt(result.rows[0].count, 10);
}

module.exports={
    bulkInsertUserGameweekPoints,
     getLeaderboard,
     getLeaderboardCount
}