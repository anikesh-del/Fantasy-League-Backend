const authService = require("../services/auth.services");

const signup= async(req, res)=>{
    const{username, email_id, password }=req.body;

    const result =await authService.signup({
        username , email_id , password
    });

    res.status(201).json({
        success:true,
        data: result,
    });
};

const login= async(req,res)=>{
 const{email_id,password}=req.body;

 const result= await authService.login({
    email_id, password,
 });

 res.status(200).json({
     success: true,
    data: result,
 });
};

const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

module.exports = {
  signup,
  login,
  getMe,
};
