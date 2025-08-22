import { forwardRef } from 'react';

import { IconFile, IconUpload, IconX } from '@tabler/icons-react';

import { type UseDropzoneOptions, useDropzone } from '@/hooks';
import { cn } from '@/utils';

export interface DropzoneProps extends UseDropzoneOptions {
  className?: string;
  children?: React.ReactNode;
  showAcceptedFiles?: boolean;
  showRejectedFiles?: boolean;
  onRemove?: (file: File) => void;
  files?: File[];
}

export const Dropzone = forwardRef<HTMLDivElement, DropzoneProps>(
  (
    {
      className,
      children,
      showAcceptedFiles = true,
      showRejectedFiles = true,
      onRemove,
      files = [],
      ...dropzoneOptions
    },
    ref,
  ) => {
    const {
      getRootProps,
      getInputProps,
      isDragActive,
      isDragAccept,
      isDragReject,
      rejectedFiles,
    } = useDropzone(dropzoneOptions);

    // Use external files prop or fallback to hook's acceptedFiles
    const displayedFiles = files.length > 0 ? files : [];
    const displayedRejectedFiles = rejectedFiles;

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const removeFile = (fileToRemove: File) => {
      if (onRemove) {
        onRemove(fileToRemove);
      }
    };

    return (
      <div className="w-full">
        <div
          {...getRootProps()}
          ref={ref}
          className={cn(
            'relative border-2 border-dashed border-neutral-300 rounded-lg p-6 transition-all duration-200 cursor-pointer',
            'hover:border-neutral-400 hover:bg-neutral-50',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            isDragActive && 'border-blue-400 bg-blue-50',
            isDragAccept && 'border-blue-400 bg-blue-50',
            isDragReject && 'border-red-400 bg-red-50',
            dropzoneOptions.disabled && 'opacity-50 cursor-not-allowed',
            className,
          )}
        >
          <input {...getInputProps()} />

          {children || (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                <IconUpload
                  className={cn(
                    'h-6 w-6',
                    isDragAccept && 'text-blue-600',
                    isDragReject && 'text-red-600',
                    !isDragActive && 'text-neutral-600',
                  )}
                />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-neutral-900">
                  {isDragActive
                    ? 'Drop here'
                    : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {dropzoneOptions.accept
                    ? `Accepted formats: ${dropzoneOptions.accept}`
                    : 'Any file format'}
                  {dropzoneOptions.maxSize &&
                    dropzoneOptions.maxSize !== Infinity &&
                    ` (Max size: ${formatFileSize(dropzoneOptions.maxSize)})`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Accepted Files */}
        {showAcceptedFiles && displayedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Files to Upload ({displayedFiles.length})
            </h4>
            <div className="space-y-2">
              {displayedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-md"
                >
                  <div className="flex items-center space-x-2">
                    <IconFile className="h-4 w-4 text-blue-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-blue-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-blue-600">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file);
                    }}
                    title="Remove file"
                    aria-label="Remove file"
                    className="ml-2 p-1 hover:bg-blue-100 rounded-full transition-colors"
                  >
                    <IconX className="h-4 w-4 text-blue-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Files */}
        {showRejectedFiles && displayedRejectedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">
              Rejected File ({displayedRejectedFiles.length})
            </h4>
            <div className="space-y-2">
              {displayedRejectedFiles.map((file, index) => (
                <div
                  key={`rejected-${file.name}-${index}`}
                  className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-md"
                >
                  <div className="flex items-center space-x-2">
                    <IconFile className="h-4 w-4 text-red-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-red-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-red-600">
                        {formatFileSize(file.size)} - File not supported or too
                        large
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);

Dropzone.displayName = 'Dropzone';
