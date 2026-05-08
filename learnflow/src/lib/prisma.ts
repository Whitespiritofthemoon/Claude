import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db'
  // Resolve to absolute path so libsql can find it
  let url = dbUrl
  if (url.startsWith('file:./') || url.startsWith('file:../')) {
    const { resolve } = require('path') as typeof import('path')
    const rel = url.replace(/^file:/, '')
    url = `file:${resolve(process.cwd(), rel)}`
  }
  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
