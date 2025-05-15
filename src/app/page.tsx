
"use client";

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import FileUpload from '@/components/FileUpload';
import ResumeDisplay from '@/components/ResumeDisplay';
import JobSuggestionsBox from '@/components/JobSuggestionsBox';
import JobSuggestionsList from '@/components/JobSuggestionsList';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react'; // For loading indicator

interface JobTitle {
  id: number;
  title: string;
}

export default function ResumeShowcasePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setShowJobSuggestions(false); 
    setJobTitles([]); // Clear previous job titles
    toast({
      title: "Resume Uploaded",
      description: `${file.name} has been successfully uploaded.`,
      variant: "success", 
    });
  };

  const fetchJobTitles = useCallback(async () => {
    if (jobTitles.length > 0 && showJobSuggestions) { // If already shown and populated, just hide
      setShowJobSuggestions(false);
      return;
    }
    if (jobTitles.length > 0 && !showJobSuggestions) { // If populated but hidden, just show
      setShowJobSuggestions(true);
      return;
    }

    setIsLoadingJobs(true);
    try {
      // Simulate network delay for a better UX feel of loading
      await new Promise(resolve => setTimeout(resolve, 750));
      const response = await fetch('/data/jobs.json'); // Fetching from public/data/jobs.json
      if (!response.ok) {
        throw new Error('Failed to fetch job titles');
      }
      const data: JobTitle[] = await response.json();
      setJobTitles(data);
      setShowJobSuggestions(true);
    } catch (error) {
      console.error("Error fetching job titles:", error);
      toast({
        title: "Error",
        description: "Could not load job suggestions. Please try again.",
        variant: "destructive",
      });
      setShowJobSuggestions(false);
    } finally {
      setIsLoadingJobs(false);
    }
  }, [jobTitles, showJobSuggestions, toast]);


  const handleToggleSuggestions = () => {
    fetchJobTitles();
  };

  return (
    <>
      <main className="flex flex-col items-center justify-start min-h-screen py-10 px-4 bg-background text-foreground">
        <div className="w-full max-w-xl space-y-8">
          <header className="text-center">
            <h1 className="text-4xl font-bold text-primary">Resume Showcase</h1>
            <p className="mt-2 text-muted-foreground">
              Upload your resume (PDF, DOC, DOCX) and discover potential job titles.
            </p>
          </header>

          <section aria-labelledby="resume-upload-section" className="flex justify-center">
            <h2 id="resume-upload-section" className="sr-only">Upload Resume</h2>
            <FileUpload onFileUpload={handleFileUpload} />
          </section>

          {uploadedFile && (
            <section aria-labelledby="resume-display-section" className="w-full flex justify-center">
              <h2 id="resume-display-section" className="sr-only">Uploaded Resume Details</h2>
              <ResumeDisplay file={uploadedFile} />
            </section>
          )}

          <Separator className="my-6 bg-border/70" />

          <section aria-labelledby="job-suggestions-section" className="w-full flex flex-col items-center">
             <h2 id="job-suggestions-section" className="sr-only">Job Suggestions</h2>
            <JobSuggestionsBox 
              onToggleSuggestions={handleToggleSuggestions} 
              areSuggestionsVisible={showJobSuggestions}
              isLoading={isLoadingJobs}
            />
            {isLoadingJobs && (
              <div className="flex items-center justify-center mt-4 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
                Loading suggestions...
              </div>
            )}
            {showJobSuggestions && !isLoadingJobs && <JobSuggestionsList jobTitles={jobTitles} />}
          </section>
        </div>
      </main>
      <Toaster />
    </>
  );
}
