
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

  const fetchJobTitles = useCallback(async () => {
    // If already shown and populated, and we are trying to toggle, then hide.
    // This specific condition might be adjusted if the "toggle" button's role changes.
    if (jobTitles.length > 0 && showJobSuggestions && !isLoadingJobs) { 
      // If the button is clicked to hide existing suggestions
      // For now, let's assume the button can still be used to hide/reshow
    }

    // If job titles are already loaded and we just need to show them (e.g. button click)
    if (jobTitles.length > 0 && !showJobSuggestions) {
      setShowJobSuggestions(true);
      return;
    }
    
    // If jobs are already loading, or already shown, don't re-fetch unless explicitly toggled off then on.
    if (isLoadingJobs || (jobTitles.length > 0 && showJobSuggestions)) {
        return;
    }

    setIsLoadingJobs(true);
    setShowJobSuggestions(true); // Show loading state immediately
    try {
      const response = await fetch('/api/jobs'); 
      if (!response.ok) {
        let errorMessage = 'Failed to fetch job titles';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (jsonError) {
          console.error("API response was not JSON:", await response.text().catch(() => "Could not read response text."));
          errorMessage = `Server error: ${response.statusText} (Status: ${response.status})`;
        }
        throw new Error(errorMessage);
      }
      const data: JobTitle[] = await response.json();
      setJobTitles(data);
      // setShowJobSuggestions(true); // Already set to true at the start of fetch
    } catch (error: any) {
      console.error("Error fetching job titles:", error);
      toast({
        title: "Error",
        description: `Could not load job suggestions: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
      setShowJobSuggestions(false); // Hide on error
      setJobTitles([]); // Clear any potentially stale data
    } finally {
      setIsLoadingJobs(false);
    }
  }, [jobTitles, showJobSuggestions, isLoadingJobs, toast]);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setShowJobSuggestions(false); // Reset suggestion visibility
    setJobTitles([]); // Clear previous job titles
    toast({
      title: "Resume Uploaded",
      description: `${file.name} has been successfully uploaded.`,
      variant: "success", 
    });
    fetchJobTitles(); // Automatically fetch job titles
  };

  const handleToggleSuggestions = () => {
    // If suggestions are visible, hide them. Otherwise, fetch (or re-show if already fetched).
    if (showJobSuggestions) {
      setShowJobSuggestions(false);
    } else {
      fetchJobTitles();
    }
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
             <h2 id="job-suggestions-section" className="sr-only">Job Suggestions Control</h2>
            {uploadedFile && ( // Only show the toggle button if a resume has been uploaded
                <JobSuggestionsBox 
                onToggleSuggestions={handleToggleSuggestions} 
                areSuggestionsVisible={showJobSuggestions}
                isLoading={isLoadingJobs}
                />
            )}
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
