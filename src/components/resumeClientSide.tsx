"use client"

import { deleteResume, previewResumeByKey } from "@/actions/resume.action";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Resume } from "@prisma/client";
import { VariantProps } from "class-variance-authority";
import { Download, Eye, Trash2 } from "lucide-react";
import { useState } from "react";

interface CLinkProps extends VariantProps<typeof buttonVariants> {
  resumeKey: string; // Changed from 'key' to avoid React key prop conflict
  className?: string;
  children: React.ReactNode;
}

const ResumePreviewButton = (props: CLinkProps) => {
  const { variant, size, className, resumeKey, children } = props;

  const handleClick = async () => {
    try {
      const resumeUrl = await previewResumeByKey(resumeKey);
      window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening resume preview:', error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size || "sm"}
      className={className || "hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}

export const ResumeActionDropdown = ({ resume }: { resume: Resume }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handlePreviewClick = async () => {
    try {
      const resumeUrl = await previewResumeByKey(resume.fileName);
      window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening resume preview:', error);
    }
  };

  const handleDownloadClick = async () => {
    try {
      const downloadUrl = await previewResumeByKey(resume.fileName);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = resume.fileName;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  const handleDeleteClick = async () => {
    try {
      const deleted = await deleteResume(resume.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  };

  return (
    <>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handlePreviewClick}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadClick}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={(e) => {
            e.preventDefault();
            setIsDeleteDialogOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete `&quot;`{resume.fileName}`&quot;`? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClick}
              className="bg-red-600 hover:bg-red-700"
            >
              {/* Loading state here */}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


export default ResumePreviewButton;
