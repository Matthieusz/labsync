import { api } from "@labsync/backend/convex/_generated/api";
import type { Id } from "@labsync/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileArchive,
  FileAudio,
  FileCode,
  FileIcon,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Filter,
  FolderOpen,
  Image as ImageIcon,
  Search,
  SortAsc,
  SortDesc,
  Upload,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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

type FileCategory =
  | "all"
  | "images"
  | "documents"
  | "media"
  | "archives"
  | "code";
type SortField = "name" | "date" | "size";
type SortDirection = "asc" | "desc";

// File type categorization
const FILE_CATEGORIES: Record<FileCategory, string[]> = {
  all: [],
  images: ["image/"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats",
    "text/",
  ],
  media: ["video/", "audio/"],
  archives: [
    "application/zip",
    "application/x-rar",
    "application/x-7z",
    "application/gzip",
    "application/x-tar",
  ],
  code: [
    "application/json",
    "application/javascript",
    "application/xml",
    "text/javascript",
    "text/css",
    "text/html",
  ],
};

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) {
    return <ImageIcon className="h-4 w-4" />;
  }
  if (fileType.startsWith("video/")) {
    return <FileVideo className="h-4 w-4" />;
  }
  if (fileType.startsWith("audio/")) {
    return <FileAudio className="h-4 w-4" />;
  }
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
    return <FileSpreadsheet className="h-4 w-4" />;
  }
  const isArchive =
    fileType.includes("zip") ||
    fileType.includes("rar") ||
    fileType.includes("tar") ||
    fileType.includes("gzip");
  if (isArchive) {
    return <FileArchive className="h-4 w-4" />;
  }
  if (
    fileType.includes("javascript") ||
    fileType.includes("json") ||
    fileType.includes("xml") ||
    fileType.includes("css") ||
    fileType.includes("html")
  ) {
    return <FileCode className="h-4 w-4" />;
  }
  if (
    fileType.startsWith("text/") ||
    fileType.includes("pdf") ||
    fileType.includes("document")
  ) {
    return <FileText className="h-4 w-4" />;
  }
  return <FileIcon className="h-4 w-4" />;
}

function getFileIconColor(fileType: string): string {
  if (fileType.startsWith("image/")) {
    return "text-pink-500 bg-pink-500/10";
  }
  if (fileType.startsWith("video/")) {
    return "text-purple-500 bg-purple-500/10";
  }
  if (fileType.startsWith("audio/")) {
    return "text-orange-500 bg-orange-500/10";
  }
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
    return "text-green-500 bg-green-500/10";
  }
  const isArchive =
    fileType.includes("zip") ||
    fileType.includes("rar") ||
    fileType.includes("tar");
  if (isArchive) {
    return "text-yellow-500 bg-yellow-500/10";
  }
  const isCode =
    fileType.includes("javascript") ||
    fileType.includes("json") ||
    fileType.includes("css");
  if (isCode) {
    return "text-blue-500 bg-blue-500/10";
  }
  if (fileType.includes("pdf")) {
    return "text-red-500 bg-red-500/10";
  }
  return "text-primary bg-primary/10";
}

function matchesCategory(fileType: string, category: FileCategory): boolean {
  if (category === "all") {
    return true;
  }
  const patterns = FILE_CATEGORIES[category];
  return patterns.some(
    (pattern) => fileType.includes(pattern) || fileType.startsWith(pattern)
  );
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Empty state component for the file list
function FileListEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full min-h-32 flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground text-sm">
      <Icon className="h-10 w-10 opacity-20" />
      <p className="font-medium">{title}</p>
      <p className="text-xs">{description}</p>
    </div>
  );
}

// File list content component
function FileListContent({
  files,
  filteredAndSortedFiles,
  formatFileSize,
  t,
}: {
  files: FileItem[];
  filteredAndSortedFiles: FileItem[];
  formatFileSize: (bytes: number) => string;
  t: (key: string) => string;
}) {
  if (files.length === 0) {
    return (
      <FileListEmptyState
        description={t("files.uploadFirst")}
        icon={FolderOpen}
        title={t("files.noFiles")}
      />
    );
  }

  if (filteredAndSortedFiles.length === 0) {
    return (
      <FileListEmptyState
        description={t("files.tryDifferentFilter")}
        icon={Search}
        title={t("files.noResults")}
      />
    );
  }

  return (
    <ul className="h-full max-h-80 space-y-2 overflow-y-auto p-2">
      {filteredAndSortedFiles.map((file) => (
        <FileListItem
          file={file}
          formatFileSize={formatFileSize}
          key={file._id}
        />
      ))}
    </ul>
  );
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

  const iconColorClass = getFileIconColor(file.fileType);

  return (
    <li className="group flex items-center justify-between rounded-lg border bg-card p-3 transition-all hover:bg-accent/50 hover:shadow-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconColorClass}`}
        >
          {getFileIcon(file.fileType)}
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="truncate font-medium text-sm" title={file.fileName}>
            {file.fileName}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <span>{formatFileSize(file.fileSize)}</span>
            <span className="hidden sm:inline">•</span>
            <span
              className="hidden max-w-20 truncate sm:inline"
              title={file.fileType}
            >
              {file.fileType?.split("/")[1]?.toUpperCase() ||
                t("files.unknownType")}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              {formatDate(file._creationTime)}
            </span>
          </div>
        </div>
      </div>
      <Button
        aria-label={`${t("files.download")} ${file.fileName}`}
        className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
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

// Upload area component with drag and drop
function UploadArea({
  isDragOver,
  isUploading,
  selectedFile,
  fileInputRef,
  formatFileSize,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onClearSelection,
  onUpload,
  t,
}: {
  isDragOver: boolean;
  isUploading: boolean;
  selectedFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  formatFileSize: (bytes: number) => string;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSelection: () => void;
  onUpload: () => void;
  t: (key: string) => string;
}) {
  // Handle drag events at the form level to avoid a11y issues
  const handleDragEvents = {
    onDragOver,
    onDragLeave,
    onDrop,
  };

  return (
    <form
      className={`relative rounded-lg border-2 border-dashed p-4 transition-colors ${
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      }`}
      onSubmit={(e) => {
        e.preventDefault();
        onUpload();
      }}
      {...handleDragEvents}
    >
      <label className="flex cursor-pointer flex-col items-center gap-2 text-center">
        <input
          className="hidden"
          disabled={isUploading}
          onChange={onFileSelect}
          ref={fileInputRef}
          type="file"
        />
        <Upload
          className={`h-8 w-8 ${isDragOver ? "text-primary" : "text-muted-foreground/50"}`}
        />
        <div className="text-muted-foreground text-sm">
          <span className="font-medium text-foreground">
            {t("files.dragAndDrop")}
          </span>{" "}
          {t("files.or")}{" "}
          <span className="font-medium text-primary hover:underline">
            {t("files.browse")}
          </span>
        </div>
      </label>

      {selectedFile && (
        <div className="mt-3 flex flex-col gap-2 rounded-md bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${getFileIconColor(selectedFile.type)}`}
            >
              {getFileIcon(selectedFile.type)}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div
                className="truncate font-medium text-sm"
                title={selectedFile.name}
              >
                {selectedFile.name}
              </div>
              <div className="text-muted-foreground text-xs">
                {formatFileSize(selectedFile.size)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={() => {
                onClearSelection();
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              <X className="mr-1 h-4 w-4" />
              {t("common.cancel")}
            </Button>
            <Button
              disabled={isUploading}
              onClick={() => {
                onUpload();
              }}
              size="sm"
              type="button"
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
        </div>
      )}
    </form>
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<FileCategory>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleFileUpload = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      if (!selectedFile) {
        return;
      }
      if (!userId) {
        return;
      }

      setIsUploading(true);
      try {
        const postUrl = await generateUploadUrl();
        // Use a fallback content type if the file type is empty
        const contentType = selectedFile.type || "application/octet-stream";
        const uploadResponse = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": contentType },
          body: selectedFile,
        });

        if (!uploadResponse.ok) {
          return;
        }

        const { storageId } = await uploadResponse.json();

        if (!storageId) {
          return;
        }

        await saveFile({
          storageId,
          fileName: selectedFile.name,
          fileType: contentType,
          fileSize: selectedFile.size,
          uploadedBy: userId,
          organizationId,
        });

        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } finally {
        setIsUploading(false);
      }
      setIsUploading(false);
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

  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
    let result = [...files];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((file) =>
        file.fileName.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filterCategory !== "all") {
      result = result.filter((file) =>
        matchesCategory(file.fileType, filterCategory)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.fileName.localeCompare(b.fileName);
          break;
        case "date":
          comparison = a._creationTime - b._creationTime;
          break;
        case "size":
          comparison = a.fileSize - b.fileSize;
          break;
        default:
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [files, searchQuery, filterCategory, sortField, sortDirection]);

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

  const handleUpload = () => {
    handleFileUpload();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const categoryLabels: Record<FileCategory, string> = {
    all: t("files.allFiles"),
    images: t("files.images"),
    documents: t("files.documents"),
    media: t("files.media"),
    archives: t("files.archives"),
    code: t("files.code"),
  };

  const sortLabels: Record<SortField, string> = {
    name: t("files.sortByName"),
    date: t("files.sortByDate"),
    size: t("files.sortBySize"),
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <FolderOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{t("files.title")}</CardTitle>
              {files.length > 0 && (
                <CardDescription className="text-xs">
                  {files.length}{" "}
                  {files.length === 1 ? t("files.file") : t("files.filesCount")}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              size="sm"
              type="button"
              variant="ghost"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded ? (
        <CardContent className="flex flex-1 flex-col gap-4">
          {/* Upload Area */}
          <UploadArea
            fileInputRef={fileInputRef}
            formatFileSize={formatFileSize}
            isDragOver={isDragOver}
            isUploading={isUploading}
            onClearSelection={clearSelection}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            onUpload={handleUpload}
            selectedFile={selectedFile}
            t={t}
          />

          {/* Search and Filter Bar */}
          {files.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("files.searchPlaceholder")}
                  value={searchQuery}
                />
                {searchQuery && (
                  <Button
                    className="-translate-y-1/2 absolute top-1/2 right-1 h-6 w-6"
                    onClick={() => setSearchQuery("")}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="shrink-0" size="sm" variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    {categoryLabels[filterCategory]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {t("files.filterByType")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    onValueChange={(value) =>
                      setFilterCategory(value as FileCategory)
                    }
                    value={filterCategory}
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <DropdownMenuRadioItem key={key} value={key}>
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="shrink-0" size="sm" variant="outline">
                    {sortDirection === "asc" ? (
                      <SortAsc className="mr-2 h-4 w-4" />
                    ) : (
                      <SortDesc className="mr-2 h-4 w-4" />
                    )}
                    {sortLabels[sortField]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("files.sortBy")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    onValueChange={(value) => setSortField(value as SortField)}
                    value={sortField}
                  >
                    {Object.entries(sortLabels).map(([key, label]) => (
                      <DropdownMenuRadioItem key={key} value={key}>
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    onValueChange={(value) =>
                      setSortDirection(value as SortDirection)
                    }
                    value={sortDirection}
                  >
                    <DropdownMenuRadioItem value="asc">
                      {t("files.ascending")}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="desc">
                      {t("files.descending")}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* File List */}
          <div className="max-h-80 flex-1 overflow-hidden rounded-lg border bg-muted/20">
            <FileListContent
              files={files}
              filteredAndSortedFiles={filteredAndSortedFiles}
              formatFileSize={formatFileSize}
              t={t}
            />
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
