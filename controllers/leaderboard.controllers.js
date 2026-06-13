const { getLeaderboardServices } = require('../services/leaderboard.services');

async function getGameweekLeaderboard(req,res, next) {
        const {gameweek , page, limit}=req.query;

        const data= await getLeaderboardServices({
            gameweekId: gameweek , 
            page,
            limit
        });

        res.status(200).json({
            success:true,
            ...data,
        });

       next(err);
    
}

module.exports = { getGameweekLeaderboard };