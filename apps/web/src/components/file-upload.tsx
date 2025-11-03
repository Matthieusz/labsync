import { api } from "@labsync/backend/convex/_generated/api";
import type { Id } from "@labsync/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
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
    <li className="flex items-center justify-between rounded-md border bg-muted/30 p-3">
      <div className="flex-1">
        <div className="font-medium text-sm">{file.fileName}</div>
        <div className="text-muted-foreground text-xs">
          {formatFileSize(file.fileSize)} • {file.fileType || "Unknown type"}
        </div>
      </div>
      <Button
        aria-label={`Download ${file.fileName}`}
        disabled={!fileUrl?.data}
        onClick={() => {
          if (fileUrl?.data) {
            window.open(fileUrl.data, "_blank");
          }
        }}
        size="sm"
        type="button"
        variant="outline"
      >
        Download
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
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-base">File Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          aria-label="Upload a file"
          className="flex flex-col gap-4"
          onSubmit={handleFileUpload}
        >
          <div className="flex gap-2">
            <Input
              accept="*/*"
              aria-label="Select file to upload"
              className="flex-1"
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
            <Button
              aria-label="Upload file"
              disabled={!selectedFile || isUploading}
              type="submit"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
          {selectedFile ? (
            <div className="text-muted-foreground text-sm">
              Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)}
              )
            </div>
          ) : null}
        </form>

        <div className="mt-6">
          <h3 className="mb-3 font-medium text-sm">Uploaded Files</h3>
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
            <div className="text-muted-foreground text-sm">
              No files uploaded yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
