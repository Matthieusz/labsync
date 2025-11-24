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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
              {file.fileType || t("files.unknownType")}
            </span>
          </div>
        </div>
      </div>
      <Button
        aria-label={`${t("files.download")} ${file.fileName}`}
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
  const { t } = useTranslation();
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

  const files = filesResult?.data || [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = (e: React.MouseEvent) => {
    handleFileUpload(e as unknown as React.FormEvent);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          {t("files.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              className="cursor-pointer pr-10 file:cursor-pointer file:text-foreground"
              disabled={isUploading}
              onChange={handleFileSelect}
              type="file"
            />
            {selectedFile && (
              <Button
                className="-translate-y-1/2 absolute top-1/2 right-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={clearSelection}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{t("common.cancel")}</span>
              </Button>
            )}
          </div>
          <Button
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
            size="sm"
          >
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-bounce" />
                {t("files.uploading")}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {t("files.upload")}
              </>
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-hidden rounded-md border bg-muted/30">
          {files.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground text-sm">
              <FileText className="h-8 w-8 opacity-20" />
              <p>{t("files.noFiles")}</p>
            </div>
          ) : (
            <ul className="h-full space-y-2 overflow-y-auto p-2">
              {files.map((file) => (
                <FileListItem
                  file={file}
                  formatFileSize={formatFileSize}
                  key={file._id}
                />
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
