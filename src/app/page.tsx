
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
import { Loader2 } from 'lucide-react'; 

interface JobTitle {
  id: number;
  title: string;
}

export default function ResumeShowcasePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const { toast } = useToast();

  const fetchJobTitles = useCallback(async (textForMatching: string | null) => {
    if (!textForMatching) {
      if (uploadedFile) {
        toast({
          title: "Resume Processing",
          description: "Resume content is being processed or is not available yet. Please wait.",
          variant: "info",
        });
      } else {
        toast({
          title: "Upload Resume First",
          description: "Please upload a resume to get job suggestions.",
          variant: "info",
        });
      }
      setIsLoadingJobs(false);
      return;
    }

    // This condition handles re-showing suggestions if they were fetched then hidden
    if (jobTitles.length > 0 && !showJobSuggestions && !isLoadingJobs) {
        setShowJobSuggestions(true);
        return;
    }
    
    // Prevent re-fetch if already loading, or if suggestions are shown (unless explicitly toggled)
    // The toggle button itself will hide suggestions first if they are visible.
    if (isLoadingJobs || (jobTitles.length > 0 && showJobSuggestions)) {
        return;
    }

    setIsLoadingJobs(true);
    setShowJobSuggestions(true); 
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: textForMatching }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to fetch job suggestions (Status: ${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (jsonError) {
           // Non-JSON error response
           const textError = await response.text().catch(() => "Could not read error response text.");
           console.error("API error response was not JSON:", textError);
           errorMessage = `Server error: ${response.statusText || textError}`;
        }
        throw new Error(errorMessage);
      }
      const data: JobTitle[] = await response.json();
      setJobTitles(data);
    } catch (error: any) {
      console.error("Error fetching job titles:", error);
      toast({
        title: "Error",
        description: `Could not load job suggestions: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
      setShowJobSuggestions(false); 
      setJobTitles([]); 
    } finally {
      setIsLoadingJobs(false);
    }
  }, [toast, uploadedFile, jobTitles.length, showJobSuggestions, isLoadingJobs, setIsLoadingJobs, setJobTitles, setShowJobSuggestions]);


  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setResumeText(null); // Clear previous resume text, new one is coming
    setShowJobSuggestions(false); 
    setJobTitles([]); 
    setIsLoadingJobs(true); // Show loader while file is read

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setResumeText(text); // This will trigger the useEffect
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast({
        title: "Error Reading File",
        description: "Could not read the resume content. Please try a different file or format (e.g., .txt, .docx).",
        variant: "destructive",
      });
      setIsLoadingJobs(false); 
      setResumeText(null);
    };
    reader.readAsText(file); // Reads as plain text. For PDF/DOC, this might not be ideal.
  };
  
  useEffect(() => {
    if (resumeText && uploadedFile) {
      toast({
        title: "Resume Uploaded & Parsed",
        description: `${uploadedFile.name} processed. Fetching matched jobs...`,
        variant: "success", 
      });
      fetchJobTitles(resumeText);
    }
  }, [resumeText, uploadedFile, fetchJobTitles]);

  const handleToggleSuggestions = () => {
    if (showJobSuggestions) {
      setShowJobSuggestions(false);
    } else {
      // If resumeText is available, fetch. Otherwise, fetchJobTitles will show an appropriate toast.
      fetchJobTitles(resumeText); 
    }
  };

  return (
    <>
      <main className="flex flex-col items-center justify-start min-h-screen py-10 px-4 bg-background text-foreground">
        <div className="w-full max-w-xl space-y-8">
          <header className="text-center">
            <h1 className="text-4xl font-bold text-primary">Resume Showcase</h1>
            <p className="mt-2 text-muted-foreground">
              Upload your resume (TXT, DOCX recommended for best matching) and discover AI-matched job titles.
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
            {uploadedFile && ( 
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
