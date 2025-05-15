"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface ResumeDisplayProps {
  file: File;
}

export default function ResumeDisplay({ file }: ResumeDisplayProps) {
  return (
    <Card className="w-full max-w-md mt-6 shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-secondary/50">
        <CardTitle className="flex items-center text-xl">
          <FileText className="mr-3 h-6 w-6 text-primary" />
          Uploaded Resume
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Your resume details are shown below.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        <div>
          <strong className="text-foreground font-medium">File Name:</strong>
          <span className="ml-2 text-muted-foreground break-all">{file.name}</span>
        </div>
        <div>
          <strong className="text-foreground font-medium">File Type:</strong>
          <span className="ml-2 text-muted-foreground">{file.type || 'N/A'}</span>
        </div>
        <div>
          <strong className="text-foreground font-medium">File Size:</strong>
          <span className="ml-2 text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</span>
        </div>
        <div className="mt-4 p-4 border border-dashed border-border rounded-md bg-muted/20 text-sm text-muted-foreground">
          <p className="italic">
            Content preview is not available in this demonstration. In a full application, the parsed text or a dedicated viewer for PDF/DOCX files would be integrated here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
