import { Router } from 'express';
import upload from '../middlewares/fileUpload'
import { fileReadController } from '../controllers/fileReadController';

const router = Router();
router.post('/', function(req,res,next){
  upload(req,res,function(err){
    if(err){
      console.log(err)
      return res.status(400).json({error:err.message})
    }
    next()
  })
}, fileReadController);

export default router;