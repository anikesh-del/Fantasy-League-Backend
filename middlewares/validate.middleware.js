const ApiError = require('../errors/ApiError');

const validate=(schema)=>(req,res,next)=>{
    const result=schema.safeParse({
  body: req.body,
  params: req.params,
  query: req.query,
});

if(!result.success){
    const message=result.error.issues.map(e=>e.message).join(',');
    throw new ApiError(400, message);
}

 if (result.data.body)   Object.assign(req.body,   result.data.body);
  if (result.data.params) Object.assign(req.params, result.data.params);
  if (result.data.query)  Object.assign(req.query,  result.data.query);
next();
}

module.exports={validate};