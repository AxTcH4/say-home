import { Request, Response, NextFunction } from "express";
import { z } from "zod"; 

import * as searchService from "./search.service.js";

const searchSchema = z.object({
    title: z.string().optional(),
    type: z.string().optional(),
    secteur: z.string().optional(),
    prixMin: z.coerce.number().optional(),
    prixMax: z.coerce.number().optional(),
    });

/**
 * rechercher des propritétes en focntion des données reçu du client (à remplacer par search engine ML model)
 * @param Request req
 * @param Response res
 * @returns Promise<void>
 */
export const searchProperties = async (req:Request, res:Response, next:NextFunction) => {
    try{ 
    
        //sanitize inputs (zod validation)
        const data = searchSchema.parse(req.query);
            
        //call service
        const results = await searchService.searchPropertiesService({
            title: data.title,
            type: data.type,
            secteur: data.secteur,
            prixMin: data.prixMin,
            prixMax: data.prixMax,
        });
        
        if (results == null || results.length === 0 ) {
             return res.status(404).json({
                success: false, 
                message: 'Aucun resultat trouve'
            });
        }
        
        return res.status(201).json({
        success: true, 
        message: 'Resultats trouve',
        data: results
        });

    }
    catch(error) {
        next (error)
    }
    
};