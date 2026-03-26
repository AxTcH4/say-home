import { Router } from "express";

// construct routing tool
const router = Router();

//CREATE ROUTES 
router.get('/test', (req,res)=> {
    res.json({status:'ok'});
});

export default router;
