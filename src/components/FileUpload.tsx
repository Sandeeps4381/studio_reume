"use client";

import type React from 'react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  acceptedFileTypes?: string;
}

export default function FileUpload({ 
  onFileUpload, 
  acceptedFileTypes = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset file input to allow uploading the same file again if needed
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-sm text-center">
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={acceptedFileTypes}
        id="resume-upload-input"
        aria-labelledby="resume-upload-button"
      />
      <Button 
        id="resume-upload-button"
        onClick={handleButtonClick} 
        className="w-full sm:w-auto min-w-[200px] py-3 text-base shadow-md hover:shadow-lg transition-shadow"
        variant="default" // Uses primary color
      >
        <UploadCloud className="mr-2 h-5 w-5" />
        Upload Resume
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">
        Supports: PDF, DOC, DOCX
      </p>
    </div>
  );
}
