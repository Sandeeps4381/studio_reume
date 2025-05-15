"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListChecks, Info } from 'lucide-react';

interface JobTitle {
  id: number;
  title: string;
}

interface JobSuggestionsListProps {
  jobTitles: JobTitle[];
}

export default function JobSuggestionsList({ jobTitles }: JobSuggestionsListProps) {
  if (!jobTitles || jobTitles.length === 0) {
    return (
      <Card id="job-suggestions-list" className="w-full max-w-md mt-4 shadow-lg rounded-lg" role="region" aria-live="polite">
        <CardContent className="p-6 flex items-center justify-center text-muted-foreground">
          <Info className="mr-2 h-5 w-5" />
          No job suggestions available at this time.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="job-suggestions-list" className="w-full max-w-md mt-4 shadow-lg rounded-lg overflow-hidden" role="region" aria-live="polite">
      <CardHeader className="bg-secondary/50">
        <CardTitle className="flex items-center text-xl text-primary">
          <ListChecks className="mr-3 h-6 w-6" />
          Potential Job Titles
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Based on general job roles, here are some suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {jobTitles.map((job, index) => (
            <li 
              key={job.id} 
              className={`p-4 text-foreground transition-colors hover:bg-muted/30 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
            >
              {job.title}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
