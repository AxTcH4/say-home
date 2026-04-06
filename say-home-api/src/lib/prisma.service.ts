import { PrismaClient } from "../../generated/prisma/client.js";
import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'say_home_db',
  connectionLimit: 5,
})

const prisma = new PrismaClient({ adapter });
export { prisma };