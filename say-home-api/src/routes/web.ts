import { Router } from "express";
import searchRouter from "../search/search.routes.js"

// construct routing tool
const router = Router();

//CREATE ROUTES 
router.get('/test', (req,res)=> {
    res.json({status:'ok'});
});

router.use('/search', searchRouter)

export default router;
