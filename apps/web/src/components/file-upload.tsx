import { api } from "@labsync/backend/convex/_generated/api";
import type { Id } from "@labsync/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  Download,
  FileIcon,
  FileText,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

type FileUploadProps = {
  organizationId: string;
  userId: string;
};

type FileItem = {
  _id: Id<"files">;
  _creationTime: number;
  storageId: Id<"_storage">;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  organizationId: string;
  teamId?: string;
};

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) {
    return <ImageIcon className="h-4 w-4" />;
  }
  if (fileType.startsWith("text/")) {
    return <FileText className="h-4 w-4" />;
  }
  return <FileIcon className="h-4 w-4" />;
}

function FileListItem({
  file,
  formatFileSize,
}: {
  file: FileItem;
  formatFileSize: (bytes: number) => string;
}) {
  const fileUrl = useQuery(api.files.getFileUrl, {
    storageId: file.storageId,
  });

  return (
    <li className="group flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {getFileIcon(file.fileType)}
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="truncate font-medium text-sm" title={file.fileName}>
            {file.fileName}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <span>{formatFileSize(file.fileSize)}</span>
            <span>•</span>
            <span className="max-w-[100px] truncate">
              {file.fileType || "Unknown type"}
            </span>
          </div>
        </div>
      </div>
      <Button
        aria-label={`Download ${file.fileName}`}
        className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
        disabled={!fileUrl?.data}
        onClick={() => {
          if (fileUrl?.data) {
            window.open(fileUrl.data, "_blank");
          }
        }}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Download className="h-4 w-4" />
      </Button>
    </li>
  );
}

export function FileUpload({ organizationId, userId }: FileUploadProps) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFile = useMutation(api.files.saveFile);
  const filesResult = useQuery(api.files.getFilesByOrganization, {
    organizationId,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!selectedFile) {
        return;
      }
      if (!userId) {
        return;
      }

      setIsUploading(true);
      try {
        // Step 1: Get a short-lived upload URL
        const postUrl = await generateUploadUrl();

        // Step 2: POST the file to the URL
        const uploadResponse = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        const { storageId } = await uploadResponse.json();

        // Step 3: Save the storage ID to the database
        await saveFile({
          storageId,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          uploadedBy: userId,
          organizationId,
        });

        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch {
        // Handle upload errors silently
      } finally {
        setIsUploading(false);
      }
    },
    [selectedFile, userId, generateUploadUrl, saveFile, organizationId]
  );

  const formatFileSize = useCallback((bytes: number) => {
    const KB = 1024;
    const BYTES_PER_KB = 1024;
    const MB = KB * BYTES_PER_KB;
    if (bytes < KB) {
      return `${bytes} B`;
    }
    if (bytes < MB) {
      return `${(bytes / KB).toFixed(1)} KB`;
    }
    return `${(bytes / MB).toFixed(1)} MB`;
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileIcon className="h-4 w-4" />
          Files
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <form
          aria-label="Upload a file"
          className="flex flex-col gap-4"
          onSubmit={handleFileUpload}
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                accept="*/*"
                aria-label="Select file to upload"
                className="cursor-pointer pr-8 file:cursor-pointer file:text-foreground"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                  }
                }}
                ref={fileInputRef}
                type="file"
              />
              {selectedFile && (
                <button
                  className="-translate-y-1/2 absolute top-1/2 right-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  type="button"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear selected file</span>
                </button>
              )}
            </div>
            <Button
              aria-label="Upload file"
              disabled={!selectedFile || isUploading}
              size="icon"
              type="submit"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-muted-foreground text-xs">
              <FileIcon className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">
                {selectedFile.name}
              </span>
              <span>({formatFileSize(selectedFile.size)})</span>
            </div>
          )}
        </form>

        <div className="space-y-3">
          <h3 className="font-medium text-muted-foreground text-sm">
            Uploaded Files
          </h3>
          {filesResult?.data && filesResult.data.length > 0 ? (
            <ul className="space-y-2">
              {filesResult.data.map((file) => (
                <FileListItem
                  file={file}
                  formatFileSize={formatFileSize}
                  key={file._id}
                />
              ))}
            </ul>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
              <FileIcon className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">
                No files uploaded yet.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
