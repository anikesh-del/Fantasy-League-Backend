const ApiError = require('../errors/ApiError');

const validate=(schema)=>(req,res,next)=>{
    const result=schema.safeParse({
  body: req.body,
  params: req.params,
  query: req.query,
});

if(!result.success){
    const message=result.error.errors.map(e=>e.message).join(',');
    throw new ApiError(400, message);
}

 req.body = result.data.body ?? {};
  req.params = result.data.params ?? {};
  req.query = result.data.query ?? {};
next();
}

module.exports={validate};