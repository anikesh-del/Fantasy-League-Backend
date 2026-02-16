const ApiError=require("../errors/ApiError");

const errorHandler=(err,req,res,next)=>{

  if(err instanceof ApiError){
    return res.status(err.statusCode).json({
      success:false,
      error:{
        message:err.message,
      },
    });
  }

  //unexpected crash
  console.error("Unexpected error:",err);

  return res.status(500).json({
    success:false,
    error:{
      message:"Something went wrong",
    },
  });
};

module.exports=errorHandler;
