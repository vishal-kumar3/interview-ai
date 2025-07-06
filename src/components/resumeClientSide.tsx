"use client"

import { deleteResume, previewResumeByKey } from "@/actions/resume.action";
import { Button, buttonVariants } from "@/components/ui/button";
import { Resume } from "@prisma/client";
import { VariantProps } from "class-variance-authority";
import { Download, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ResumePreviewModal } from "@/components/resume/resumePreviewModal";
import { useRouter } from "next/navigation";

interface CLinkProps extends VariantProps<typeof buttonVariants> {
  resumeKey: string; // Changed from 'key' to avoid React key prop conflict
  className?: string;
  children: React.ReactNode;
}

const ResumePreviewButton = (props: CLinkProps) => {
  const { variant, size, className, resumeKey, children } = props;

  const handleClick = async () => {
    try {
      const { signedUrl, error } = await previewResumeByKey(resumeKey);
      if (error || !signedUrl) {
        return toast.error("Failed to preview resume");
      }
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      return toast.error('Error opening resume preview:');
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDownloadClick = async () => {
    try {
      const { signedUrl, error } = await previewResumeByKey(resume.fileName);
      if (error || !signedUrl) {
        return toast.error('Error fetching download URL');
      }

      const link = document.createElement('a');
      link.href = signedUrl;
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
      setIsDeleting(true);
      const { success, error } = await deleteResume(resume.id, resume.fileName);
      if (error || !success) {
        toast.error("Failed to delete resume");
      }
      toast.success("Resume deleted successfully");
    } catch (error) {
      toast.error("Failed to delete resume");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsPreviewOpen(true);
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleEdit}
          variant="outline"
          size="sm"
          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Details
        </Button>
        <Button
          onClick={handleDownloadClick}
          variant="outline"
          size="sm"
          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        <Button
          variant="destructive"
          onClick={async (e) => {
            e.preventDefault();
            await handleDeleteClick();
          }}
          className="bg-red-600 hover:bg-red-700"
        >
          {
            isDeleting ?
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              :
              <Trash2 className="h-4 w-4" />
          }
        </Button>
      </div>

      <ResumePreviewModal
        resume={resume}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  )
}


export default ResumePreviewButton;
