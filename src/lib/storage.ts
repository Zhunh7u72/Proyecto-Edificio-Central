import fs from 'fs'
import path from 'path'
import { Writable } from 'stream'

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function saveLocalFile(file: File, relativePath: string): Promise<string> {
  const fullPath = path.join(UPLOADS_DIR, relativePath)
  const dir = path.dirname(fullPath)

  await fs.promises.mkdir(dir, { recursive: true })

  // Stream the file to disk in chunks to avoid loading it all into RAM
  const writeStream = fs.createWriteStream(fullPath)

  try {
    const reader = file.stream().getReader()
    const writable = new Writable({
      write(chunk, _encoding, callback) {
        writeStream.write(chunk, callback)
      },
    })

    // Read chunks from the File stream and pipe to disk
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      await new Promise<void>((resolve, reject) => {
        writable.write(value, (err) => (err ? reject(err) : resolve()))
      })
    }

    // Close the write stream
    await new Promise<void>((resolve, reject) => {
      writeStream.end((err: Error | null | undefined) => (err ? reject(err) : resolve()))
    })
  } catch (err) {
    writeStream.destroy()
    // Clean up partial file
    try { await fs.promises.unlink(fullPath) } catch {}
    throw err
  }

  return `/uploads/${relativePath}`
}

export async function deleteLocalFile(relativePath: string): Promise<void> {
  const fullPath = path.join(UPLOADS_DIR, relativePath)
  try {
    await fs.promises.unlink(fullPath)
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.error('Error deleting file:', err)
    }
  }
}

