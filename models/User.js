const pool= require("../config/db")

//Create a new user

const createUser=async({username , email_id , password})=>{
  const query=`
    INSERT INTO user(username , email_id, password)
    VALUES ($1, $2, $3)
    RETURNING user_id , username , email_id
  `;
  const values=[username , email_id , password];
  const{rows}= await pool.query(query,values);
  return rows[0];
};

//findUserByEmail

const findUserByEmail =async(email)=>{
  const query =`
   SELECT * FROM users where email_id= $1
  `;
  const {rows}= await pool.query(query,email);
  return rows[0];
};

//findUserById

const findUserById=async(id)=>{
 const query=`
 SELECT user_id, username , email_id
 FROM users
 WHERE user_id=$1
 `;
 const {rows}= await pool.query(query, id);
 return rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};