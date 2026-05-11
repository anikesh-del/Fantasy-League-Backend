const { getLeaderboardService } = require('../services/leaderboard.services');
const ApiError = require('../errors/ApiError');

async function getGameweekLeaderboard(req,res, next) {
    try{
        const {gameweek , page='1', limit='50'}=req.query;

        const parsedPage=parseInt(page , 10);
        if(isNaN(parsedPage) || parsedPage<1){
            throw new ApiError(400 , 'page must be a positive integer');
        }

        const parsedLimit=parseInt(limit , 10);
        if(isNaN(parsedLimit) || parsedLimit<1 || parsedLimit >100){
            throw new ApiError(400 , 'limit must be between 1 nd 100');
        }

        let parsedGameweek=null;
        if(gameweek!==undefined){
            parsedGameweek=parseInt(gameweek , 10);
            if (isNaN(parsedGameweek) || parsedGameweek < 1) {
        throw new ApiError(400, 'gameweek must be a positive integer');
      }
        }

        const data= await getLeaderboardService({
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