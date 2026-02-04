const FantasyTeam=require('../models/FantasyTeam');

const createFantasyTeam=async({userId,teamName})=>{
    const existingTeam=await FantasyTeam.getTeamByUserId(userId);

    if(existingTeam){
        throw new Error("User already has a fantasy team");
    }

    const team=await FantasyTeam.createFantasyTeam({
        user_id:userId,
        team_name:teamName,
    });
    return team;
};

const getFantasyTeam=async(userId)=>{
    const team=await FantasyTeam.getTeamByUserId(userId);

    if(!team){
        throw new Error("Fantasy team does not exist");
    }
    const players=await FantasyTeamPlayer.GetPlayersByTeam(
        team.fantasy_team_id
    );

    return{
        ...team,
        players,
    };
};

const addPlayer=async({
    userId,
    player_api_id,
    position,
})=>{
    const team=await await FantasyTeam.getTeamByUserId(userId);

    if(!team){
        throw new Error("team does not exist");
    }

    const players=await FantasyTeamPlayer.GetPlayersByTeam(
        team.fantasy_team_id
    );

    if(players.length >=11){
        throw new Error("Team already has minimum players");
    }

    const duplicate=players.find(
        (p)=>p.player_api_id==player_api_id
    );

      if (duplicate) {
    throw new Error("Player already in team");
  }

  return await FantasyTeamPlayer.addPlayer({
    fantasy_team_id:team.fantasy_team_id,
    player_api_id,
    position,
  });

};

const removePlayer=async({
    userId,
    player_api_id,
})=>{
    const team=await FantasyTeam.getTeamByUserId(userId);

    if(!team){
        throw new Error("Fantasy team not found");
    }

    await FantasyTeamPlayer.removePlayer({
        fantasy_team_id:team.fantasy_team_id,
        player_api_id,
    });
};

const updateCaptain=async({
    userId,
    captain_id,
    vice_captain_id
})=>{

    const team = await FantasyTeam.getTeamByUserId(userId);

  if (!team) {
    throw new Error("Fantasy team not found");
  }

  const players = await FantasyTeamPlayer.getPlayersByTeam(
    team.fantasy_team_id
  );

  const ids=players.map((p)=>p.player_api_id);

  if(captain_id && !ids.includes(captain_id)){
    throw new Error("Captain not in the team");
  }

     if (vice_captain_id && !ids.includes(vice_captain_id)) {
    throw new Error("Vice captain not in team");
  }

     if (
    captain_id &&
    vice_captain_id &&
    captain_id === vice_captain_id
  ) {
    throw new Error("Captain and vice captain cannot be same");
  }

  await FantasyTeamPlayer.resetCaptains(team.fantasy_team_id);

  if(captain_id){
    await FantasyTeamPlayer.setCaptain(
        team.fantasy_team_id,
        captain_id
    );
  }

   if (vice_captain_id) {
    await FantasyTeamPlayer.setViceCaptain(
      team.fantasy_team_id,
      vice_captain_id
    );
  }
};
const resetTeam = async (userId) => {
  const team = await FantasyTeam.getTeamByUserId(userId);

  if (!team) {
    throw new Error("Fantasy team not found");
  }

  await FantasyTeamPlayer.resetTeam(team.fantasy_team_id);
};

module.exports={
    createFantasyTeam,
    getFantasyTeam,
    addPlayer,
    removePlayer,
    updateCaptain,
    resetTeam
};