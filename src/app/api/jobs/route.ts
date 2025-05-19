
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { matchResumeToJobs, type MatchJobsInput } from '@/ai/flows/match-resume-to-jobs-flow';

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

export async function POST(request: Request) {
  let connection;
  try {
    const { resumeText } = await request.json();

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim() === '') {
      return NextResponse.json({ message: 'Resume text is required to find matches.' }, { status: 400 });
    }

    const dbHost = getEnvVariable('DB_HOST');
    const dbUser = getEnvVariable('DB_USER');
    const dbPassword = getEnvVariable('DB_PASSWORD', '');
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

    const [rows] = await connection.execute(`SELECT id, name FROM ${dbTable}`);
    
    const allDbJobs: JobTitle[] = (rows as any[]).map(row => ({
      id: Number(row.id),
      title: String(row.name),
    }));

    await connection.end();

    if (allDbJobs.length === 0) {
      return NextResponse.json([]); // No jobs in DB to match against
    }

    const flowInput: MatchJobsInput = {
      resumeText: resumeText,
      availableJobTitles: allDbJobs,
    };
    
    const flowOutput = await matchResumeToJobs(flowInput);
    
    // Ensure the output from the flow is an array, even if it's empty.
    const matchedJobs = flowOutput.matchedJobs || [];

    return NextResponse.json(matchedJobs);

  } catch (error: any) {
    console.error('API Error in /api/jobs:', error);
    if (connection) {
      await connection.end();
    }
    // Distinguish between known errors (like JSON parsing) and unknown server errors
    let errorMessage = 'Failed to fetch matched job titles';
    if (error instanceof SyntaxError) { // JSON parsing error
        errorMessage = 'Invalid request format.';
    } else if (error.message) {
        errorMessage = error.message;
    }
    
    return NextResponse.json({ message: 'Failed to process job matching request', error: errorMessage }, { status: 500 });
  }
}
