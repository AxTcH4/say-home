import { prisma } from '../lib/prisma.service.js'
import { Prisma } from '@prisma/client/extension'

export async function searchPropertiesService(query: {
  title?: string
  type?: string
  secteur?: string
  prixMin?: number
  prixMax?: number
}) {
    const words = query.title?.toLowerCase().split(' ') ?? []


    return prisma.property.findMany({
    where: {
        AND: [
        query.prixMin ? { price: { gte: query.prixMin } } : {},
        query.prixMax ? { price: { lte: query.prixMax } } : {},
        words.length ? {
            OR: words.flatMap(word => [
            { title: { contains: word } },
            { description: { contains: word } },
            ])
        } : {},
        ]
    },
    orderBy: {
        price: 'desc', // 'asc' for ascending
  },
    })
};