const express= require('express');
const router=express.Router();

const{signup, login, getMe}=require('../controllers/auth.controllers');

const authMiddleware=require('../middlewares/auth.middleware');
const rateLimiter = require('../middlewares/rateLimiter.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { signupSchema, loginSchema } = require('../schemas/auth.schemas');


router.route('/signup').post(rateLimiter(),validate(signupSchema),signup)
router.route('/login').post(rateLimiter(),validate(loginSchema),login)
router.route('/getme').get(authMiddleware,getMe)

module.exports=router;