import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

// GET /api/properties/latest - Home Page
export const getLatestProperties = async (req: Request, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        media: true,
        agent: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    res.json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error });
  }
};

// GET /api/properties - Liste des biens
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const { minPrice, maxPrice } = req.query;
    const properties = await prisma.property.findMany({
      where: {
        ...(minPrice && { price: { gte: Number(minPrice) } }),
        ...(maxPrice && { price: { lte: Number(maxPrice) } }),
      },
      include: {
        media: true,
        agent: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error });
  }
};

// GET /api/properties/:id - Détail d'un bien
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        media: true,
        agent: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Bien non trouvé' });
    }

    const similarProperties = await prisma.property.findMany({
      where: { id: { not: Number(id) } },
      include: { media: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: property, similar: similarProperties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error });
  }
};

// POST /api/properties - Créer un bien
export const createProperty = async (req: Request, res: Response) => {
  try {
    const { title, description, price, agentId } = req.body;
    const property = await prisma.property.create({
      data: {
        title,
        description,
        price: Number(price),
        agentId: Number(agentId),
      },
    });
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error });
  }
};