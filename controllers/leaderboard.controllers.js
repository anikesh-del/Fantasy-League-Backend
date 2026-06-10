const { getLeaderboardServices } = require('../services/leaderboard.services');
const ApiError = require('../errors/ApiError');

async function getGameweekLeaderboard(req,res, next) {
    try{
        const {gameweek , page='1', limit='50'}=req.query;

        const data= await getLeaderboardServices({
            gameweekId: parsedGameweek , 
            page:parsedPage,
            limit: parsedLimit,
        });

        res.status(200).json({
            success:true,
            ...data,
        });

    }catch(err){
        next(err);
    }
}

module.exports = { getGameweekLeaderboard };