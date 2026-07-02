import { Pool } from 'pg'


const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'FEUE',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123',
})

export const db = pool

export const query = async (text: string, params?: any[]) => {
  return await pool.query(text, params)
}
