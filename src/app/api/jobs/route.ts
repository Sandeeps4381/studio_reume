
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

interface JobTitle {
  id: number;
  title: string;
}

// Function to get environment variables with fallbacks or errors if not set
function getEnvVariable(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return value;
}

export async function GET() {
  let connection;
  try {
    const dbHost = getEnvVariable('DB_HOST');
    const dbUser = getEnvVariable('DB_USER');
    const dbPassword = getEnvVariable('DB_PASSWORD', ''); // Default to empty string if not set
    const dbName = getEnvVariable('DB_NAME');
    const dbTable = getEnvVariable('DB_TABLE');
    const dbPort = parseInt(getEnvVariable('MYSQL_PORT', '3306'), 10);

    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      port: dbPort,
    });

    // Assuming your table has 'id' and 'name' columns.
    // The 'name' column from the DB will be mapped to 'title' for the frontend.
    const [rows] = await connection.execute(`SELECT id, name FROM ${dbTable}`);
    
    const jobTitles = (rows as any[]).map(row => ({
      id: Number(row.id), // Ensure id is a number
      title: String(row.name), // Map DB 'name' column to 'title' property
    }));

    await connection.end();
    return NextResponse.json(jobTitles);

  } catch (error: any) {
    console.error('Database Error:', error);
    if (connection) {
      await connection.end();
    }
    // It's good practice to avoid sending detailed error messages to the client in production
    return NextResponse.json({ message: 'Failed to fetch job titles', error: error.message }, { status: 500 });
  }
}

