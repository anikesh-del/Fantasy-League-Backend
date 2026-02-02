const express= require('express');
const router=express.Router();

const{signup, login, getMe}=require('../controllers/auth.controllers');

const authMiddleware=require('../middlewares/auth.middleware');

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/getme').get(authMiddleware,getMe)

module.exports=router;