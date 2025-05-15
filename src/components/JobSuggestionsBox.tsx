"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Briefcase, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface JobSuggestionsBoxProps {
  onToggleSuggestions: () => void;
  areSuggestionsVisible: boolean;
  isLoading: boolean;
}

export default function JobSuggestionsBox({ 
  onToggleSuggestions, 
  areSuggestionsVisible,
  isLoading
}: JobSuggestionsBoxProps) {
  return (
    <Button 
      variant="outline" 
      onClick={onToggleSuggestions} 
      className="w-full max-w-sm py-3 text-base shadow-md hover:shadow-lg transition-shadow border-primary/50 hover:border-primary text-primary hover:bg-primary/5"
      disabled={isLoading}
      aria-expanded={areSuggestionsVisible}
      aria-controls="job-suggestions-list"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Briefcase className="mr-2 h-5 w-5" />
      )}
      {isLoading 
        ? 'Loading Jobs...' 
        : areSuggestionsVisible ? 'Hide Job Suggestions' : 'Show Job Suggestions'}
      {!isLoading && (areSuggestionsVisible ? <ChevronUp className="ml-auto h-5 w-5" /> : <ChevronDown className="ml-auto h-5 w-5" />)}
    </Button>
  );
}
