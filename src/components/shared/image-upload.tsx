import { useEffect, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ImageUploadProps = {
  value: File | string | null;
  onChange: (file: File | null) => void;
  onRemove?: () => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
};

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp';
const DEFAULT_MAX_SIZE_MB = 5;

const ImageUpload = ({
  value,
  onChange,
  onRemove,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  disabled = false,
}: ImageUploadProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!(value instanceof File)) {
      return;
    }

    let cancelled = false;
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!cancelled) {
        setFilePreview(e.target?.result as string);
      }
    };

    reader.readAsDataURL(value);

    return () => {
      cancelled = true;
      reader.abort();
    };
  }, [value]);

  const preview =
    value instanceof File
      ? filePreview
      : typeof value === 'string'
        ? value
        : null;

  const validateAndSet = (file: File) => {
    setError(null);

    const allowedTypes = accept.split(',').map((t) => t.trim());
    if (!allowedTypes.includes(file.type)) {
      setError(`File type must be one of: ${allowedTypes.join(', ')}`);
      return;
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    onChange(file);
  };

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSet(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSet(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
    onRemove?.();
  };

  return (
    <div className='flex flex-col gap-2'>
      {preview ? (
        <div className='relative w-fit'>
          <img
            src={preview}
            alt='Upload preview'
            className='h-32 w-32 rounded-md border object-cover sm:h-40 sm:w-40'
          />
          {!disabled && (
            <Button
              type='button'
              variant='destructive'
              size='icon'
              className='absolute -top-2 -right-2 size-6'
              onClick={handleRemove}
            >
              <X className='size-4' />
            </Button>
          )}
        </div>
      ) : (
        <div
          role='button'
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleClick();
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed transition-colors sm:h-40 sm:w-40',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <Upload className='text-muted-foreground size-8' />
          <p className='text-muted-foreground text-xs'>
            Click or drag to upload
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type='file'
        accept={accept}
        onChange={handleFileChange}
        className='hidden'
      />

      {error && <p className='text-destructive text-sm'>{error}</p>}
    </div>
  );
};

export { ImageUpload };
