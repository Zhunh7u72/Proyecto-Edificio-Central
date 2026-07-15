import { query } from './src/lib/db.ts'

async function run() {
  try {
    await query('ALTER TABLE actividades ADD COLUMN mostrar_fecha BOOLEAN DEFAULT true');
    console.log('Column mostrar_fecha added successfully.');
  } catch (err: any) {
    if (err.message.includes('already exists')) {
      console.log('Column already exists.');
    } else {
      console.error('Error:', err.message);
    }
  }
}

run();
