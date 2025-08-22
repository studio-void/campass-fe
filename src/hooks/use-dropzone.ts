import { useCallback, useRef, useState } from 'react';

export interface UseDropzoneOptions {
  onDrop?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  disabled?: boolean;
}

export interface DropzoneState {
  isDragActive: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
  isFileDialogActive: boolean;
}

export interface UseDropzoneReturn extends DropzoneState {
  getRootProps: () => {
    onClick: () => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
  };
  getInputProps: () => {
    type: 'file';
    accept?: string;
    multiple?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    style: { display: 'none' };
    ref: React.RefObject<HTMLInputElement | null>;
  };
  open: () => void;
  acceptedFiles: File[];
  rejectedFiles: File[];
}

export function useDropzone(
  options: UseDropzoneOptions = {},
): UseDropzoneReturn {
  const {
    onDrop,
    accept,
    multiple = false,
    maxSize = Infinity,
    disabled = false,
  } = options;

  const [state, setState] = useState<DropzoneState>({
    isDragActive: false,
    isDragAccept: false,
    isDragReject: false,
    isFileDialogActive: false,
  });

  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<File[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const isFileAccepted = useCallback(
    (file: File): boolean => {
      if (maxSize && file.size > maxSize) return false;

      if (accept) {
        const acceptedTypes = accept.split(',').map((type) => type.trim());
        return acceptedTypes.some((acceptedType) => {
          if (acceptedType.startsWith('.')) {
            return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
          }
          return file.type.match(acceptedType.replace('*', '.*'));
        });
      }

      return true;
    },
    [accept, maxSize],
  );

  const processFiles = useCallback(
    (files: File[]) => {
      const accepted: File[] = [];
      const rejected: File[] = [];

      files.forEach((file) => {
        if (isFileAccepted(file)) {
          accepted.push(file);
        } else {
          rejected.push(file);
        }
      });

      setAcceptedFiles(accepted);
      setRejectedFiles(rejected);

      if (onDrop) {
        onDrop(accepted);
      }
    },
    [isFileAccepted, onDrop],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      processFiles(files);
      setState((prev) => ({ ...prev, isFileDialogActive: false }));
    },
    [processFiles],
  );

  const onDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      dragCounter.current++;

      if (e.dataTransfer?.items) {
        const files = Array.from(e.dataTransfer.items)
          .filter((item) => item.kind === 'file')
          .map((item) => item.getAsFile())
          .filter((file): file is File => file !== null);

        const hasAcceptedFiles = files.some(isFileAccepted);
        const hasRejectedFiles = files.some((file) => !isFileAccepted(file));

        setState((prev) => ({
          ...prev,
          isDragActive: true,
          isDragAccept: hasAcceptedFiles && !hasRejectedFiles,
          isDragReject: hasRejectedFiles,
        }));
      }
    },
    [disabled, isFileAccepted],
  );

  const onDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      dragCounter.current--;

      if (dragCounter.current === 0) {
        setState((prev) => ({
          ...prev,
          isDragActive: false,
          isDragAccept: false,
          isDragReject: false,
        }));
      }
    },
    [disabled],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDropHandler = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      dragCounter.current = 0;
      setState((prev) => ({
        ...prev,
        isDragActive: false,
        isDragAccept: false,
        isDragReject: false,
      }));

      const files = Array.from(e.dataTransfer?.files || []);
      processFiles(files);
    },
    [disabled, processFiles],
  );

  const open = useCallback(() => {
    if (disabled) return;

    setState((prev) => ({ ...prev, isFileDialogActive: true }));
    inputRef.current?.click();
  }, [disabled]);

  const getRootProps = useCallback(
    () => ({
      onClick: open,
      onDrop: onDropHandler,
      onDragEnter,
      onDragLeave,
      onDragOver,
    }),
    [open, onDropHandler, onDragEnter, onDragLeave, onDragOver],
  );

  const getInputProps = useCallback(
    () => ({
      type: 'file' as const,
      ...(accept && { accept }),
      ...(multiple && { multiple }),
      onChange: onInputChange,
      style: { display: 'none' as const },
      ref: inputRef,
    }),
    [accept, multiple, onInputChange],
  );

  return {
    ...state,
    getRootProps,
    getInputProps,
    open,
    acceptedFiles,
    rejectedFiles,
  };
}
