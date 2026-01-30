const bcrypt= require("bcrypt");
const jwt =require("jsonwebtoken");
const User= require("../models/User");

const signup= async ({ username , email , password})=>{
     const existingUser=await User.findUserByEmail(email);
     if(existingUser)
        throw new Error("User already exits");

     const hashedPassword=await bcrypt.hash(password, 10);

     const user= await User.createUser({
        username ,
        email,
        password: hashedPassword,
     });

     const token=jwt.sign(
        {userId:user.user_id},
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
     );

     return {user, token};
};  

const login= async({email, password})=>{

    const user=await User.findUserByEmail(email);
    if(!user){
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error("Invalid credentials");
    }

     const token = jwt.sign(
    { userId: user.user_id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user :{
        user_id:user.user_id,
        username: user.username,
        email: user.email_id,
    },
    token,
  };
};

module.exports = {
  signup,
  login,
};
