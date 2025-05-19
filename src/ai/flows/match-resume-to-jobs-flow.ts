
'use server';
/**
 * @fileOverview An AI flow to match job titles to resume content.
 *
 * - matchResumeToJobs - A function that takes resume text and available job titles,
 *   and returns a list of job titles that match the resume.
 * - MatchJobsInput - The input type for the matchResumeToJobs function.
 * - MatchJobsOutput - The return type for the matchResumeToJobs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JobTitleSchema = z.object({
  id: z.number().describe('The unique identifier for the job title.'),
  title: z.string().describe('The name of the job title.'),
});

export const MatchJobsInputSchema = z.object({
  resumeText: z.string().describe('The full text content of the resume.'),
  availableJobTitles: z
    .array(JobTitleSchema)
    .describe('A list of all available job titles with their IDs.'),
});
export type MatchJobsInput = z.infer<typeof MatchJobsInputSchema>;

export const MatchJobsOutputSchema = z.object({
  matchedJobs: z
    .array(JobTitleSchema)
    .describe(
      'A list of job titles from the available list that are a good match for the resume.'
    ),
});
export type MatchJobsOutput = z.infer<typeof MatchJobsOutputSchema>;

export async function matchResumeToJobs(
  input: MatchJobsInput
): Promise<MatchJobsOutput> {
  return matchResumeToJobsFlow(input);
}

const matchPrompt = ai.definePrompt({
  name: 'matchResumeToJobsPrompt',
  input: {schema: MatchJobsInputSchema},
  output: {schema: MatchJobsOutputSchema},
  prompt: `You are an expert recruitment AI. Your task is to analyze the provided resume text and identify which job titles from the given list are a strong match for the candidate's skills, experience, and qualifications.

Resume Text:
{{{resumeText}}}

Available Job Titles (with their IDs):
{{#each availableJobTitles}}
- ID: {{this.id}}, Title: "{{this.title}}"
{{/each}}

Based on the resume, list the job titles (including their original IDs and titles) from the 'Available Job Titles' list that are suitable matches.
Only include jobs that are present in the 'Available Job Titles' list.
If no jobs from the list are a good match for the resume, return an empty list for 'matchedJobs'.
Ensure your output is a JSON object strictly matching the specified output schema.
`,
});

const matchResumeToJobsFlow = ai.defineFlow(
  {
    name: 'matchResumeToJobsFlow',
    inputSchema: MatchJobsInputSchema,
    outputSchema: MatchJobsOutputSchema,
  },
  async (input) => {
    if (!input.resumeText.trim()) {
        return { matchedJobs: [] }; // No resume text, no matches
    }
    if (!input.availableJobTitles || input.availableJobTitles.length === 0) {
        return { matchedJobs: [] }; // No jobs to match against
    }
    const {output} = await matchPrompt(input);
    return output!;
  }
);
