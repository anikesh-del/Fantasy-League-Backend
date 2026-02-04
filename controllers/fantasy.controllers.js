const fantasyService = require("../services/fantasy-services");

const createFantasyTeam=async(req,res)=>{
    const userId=req.user.user_id;
    const {team_name}=req.body;

      const team = await fantasyService.createFantasyTeam({
    userId,
    teamName: team_name,
  });

  res.status(201).json({
    success:true,
    data:team,
  });
};

const viewFantasyTeam=async(req,res)=>{
    const userId=req.user.user_id;
  const team = await fantasyService.getFantasyTeam(userId);

  res.status(200).json({
    success: true,
    data: team,
  });

};

const addPlayer=async(req,res)=>{
    const userId=req.user.user_id;
      const { player_api_id, position } = req.body;

      const player=await fantasyService.addPlayer({
        userId,
        player_api_id,
        position,
      });

      res.status(201).json({
        success:true,
        data:player,
      });
};

const removePlayer = async (req, res) => {
  const userId = req.user.user_id;
  const { player_api_id } = req.params;

  await fantasyService.removePlayerFromTeam({
    userId,
    player_api_id: Number(player_api_id),
  });

  res.status(200).json({
    success: true,
    message: "Player removed from team",
  });
};

const updateCaptain = async (req, res) => {
  const userId = req.user.user_id;
  const { captain_id, vice_captain_id } = req.body;

  await fantasyService.updateCaptain({
    userId,
    captain_id,
    vice_captain_id,
  });

  res.status(200).json({
    success: true,
    message: "Captain updated successfully",
  });
};

const resetTeam = async (req, res) => {
  const userId = req.user.user_id;

  await fantasyService.resetTeam(userId);

  res.status(200).json({
    success: true,
    message: "Fantasy team reset successfully",
  });
};


module.exports = {
  createFantasyTeam,
  viewFantasyTeam,
  addPlayer,
  removePlayer,
  updateCaptain,
  resetTeam,
};
