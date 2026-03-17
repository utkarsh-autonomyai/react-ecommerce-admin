import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ImageUpload } from './image-upload';

const createFile = (name: string, type: string, sizeKB: number): File => {
  const content = new ArrayBuffer(sizeKB * 1024);
  return new File([content], name, { type });
};

describe('ImageUpload', () => {
  it('should render upload area when no value', () => {
    render(<ImageUpload value={null} onChange={vi.fn()} />);
    expect(screen.getByText('Click or drag to upload')).toBeInTheDocument();
  });

  it('should render preview when value is a URL string', () => {
    render(
      <ImageUpload value='https://example.com/image.jpg' onChange={vi.fn()} />,
    );
    const img = screen.getByAltText('Upload preview');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('should call onChange with file on valid file selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ImageUpload value={null} onChange={onChange} />);

    const file = createFile('photo.png', 'image/png', 100);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, file);

    expect(onChange).toHaveBeenCalledWith(file);
  });

  it('should show error for invalid file type', () => {
    const onChange = vi.fn();
    render(<ImageUpload value={null} onChange={onChange} accept='image/png' />);

    const file = createFile('photo.jpeg', 'image/jpeg', 100);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    // Use fireEvent to bypass userEvent's native accept filtering
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/File type must be one of/)).toBeInTheDocument();
  });

  it('should show error for file exceeding max size', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ImageUpload value={null} onChange={onChange} maxSizeMB={1} />);

    const file = createFile('large.png', 'image/png', 2048);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, file);

    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getByText('File size must be less than 1MB'),
    ).toBeInTheDocument();
  });

  it('should call onChange(null) and onRemove when remove button clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onRemove = vi.fn();
    render(
      <ImageUpload
        value='https://example.com/image.jpg'
        onChange={onChange}
        onRemove={onRemove}
      />,
    );

    const removeButton = screen.getByRole('button');
    await user.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(null);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('should not show remove button when disabled', () => {
    render(
      <ImageUpload
        value='https://example.com/image.jpg'
        onChange={vi.fn()}
        disabled
      />,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});
