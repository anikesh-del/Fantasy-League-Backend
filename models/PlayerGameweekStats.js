const pool= require("../config/db");

const bulkUpsertPlayerGameweekStats=async(stats)=>{
    if(!stats || stats.length==0) return;

    let values=[];
    let placeholders=[];

    stats.forEach((s,i)=>{
        const base=i*12;

        placeholders.push(`(
      $${base+1}, $${base+2}, $${base + 3}, $${base + 4},
      $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8},
      $${base + 9}, $${base + 10}, $${base + 11}, $${base+12}
            )`);
        values.push(

      s.playerId,
      s.gameweekId,
      s.minutes,
      s.goals,
      s.assists,
      s.cleanSheets,
      s.goalsConceded,
      s.yellowCards,
      s.redCards,
      s.saves,
      s.bonus,
      s.totalPoints
        ) ;   
    });

    const query= `
    INSERT INTO player_gameweek_stats(
      player_id, gameweek_id, minutes, goals, assists,
      clean_sheets, goals_conceded, yellow_cards, red_cards,
      saves,bonus, total_points
    )
      VALUES ${placeholders.join(",")}
      ON CONFLICT (player_id, gameweek_id) DO UPDATE SET
      minutes = EXCLUDED.minutes,
      goals = EXCLUDED.goals,
      assists = EXCLUDED.assists,
      clean_sheets = EXCLUDED.clean_sheets,
      goals_conceded = EXCLUDED.goals_conceded,
      yellow_cards = EXCLUDED.yellow_cards,
      red_cards = EXCLUDED.red_cards,
      saves = EXCLUDED.saves,
      bonus = EXCLUDED.bonus,
      total_points = EXCLUDED.total_points,
      updated_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(query, values);
};


const getGameweekStatsForPlayers=async(playerIds, gameweekId)=>{
   if(!playerIds || playerIds.length==0){
    return [];
   }

   const placeholders=playerIds.map((_,i)=> `$${i+1}`).join(',');

   const query=`
   SELECT 
   player_id,
   gameweek_id,
   minutes,
   goals,
   assists,
   clean_sheets,
   goals_conceded,
   yellow_cards,
   red_cards,
   saves,
   total_points FROM player_gameweek_stats
   WHERE player_id IN (${placeholders})
   AND gameweek_id=$${playerIds.length+1}
   `;

   const {rows}= await pool.query(query,[...playerIds, gameweekId]);
   return rows;
}

module.exports={
  bulkUpsertPlayerGameweekStats,
  getGameweekStatsForPlayers
};