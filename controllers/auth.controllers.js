const authService = require("../services/auth.services");

const signup= async(req, res)=>{
    const{username, email, password }=req.body;

    const result =await authService.signup({
        username , email , password
    });

    res.status(201).json({
        success:true,
        data: result,
    });
};

const login= async(req,res)=>{
 const{email,password}=req.body;

 const result= await authService.login({
    email, password,
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
