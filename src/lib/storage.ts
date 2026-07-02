import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)
const unlink = promisify(fs.unlink)

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function saveLocalFile(file: File, relativePath: string): Promise<string> {
  const fullPath = path.join(UPLOADS_DIR, relativePath)
  const dir = path.dirname(fullPath)

  try {
    await mkdir(dir, { recursive: true })
  } catch (err: any) {
    if (err.code !== 'EEXIST') throw err
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  await writeFile(fullPath, buffer)

  return `/uploads/${relativePath}`
}

export async function deleteLocalFile(relativePath: string): Promise<void> {
  const fullPath = path.join(UPLOADS_DIR, relativePath)
  try {
    await unlink(fullPath)
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.error('Error deleting file:', err)
    }
  }
}
