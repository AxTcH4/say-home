import { Router } from "express";
import * as searchController from "./search.controller.js"

const searchRouter = Router();

//search routes
searchRouter.get('/properties', searchController.searchProperties);

export default searchRouter;