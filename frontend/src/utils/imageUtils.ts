/**
 * Image optimization utilities for recipe step media
 */

export interface ImageResizeOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

/**
 * Resizes and compresses an image file
 */
export const resizeImage = (
  file: File, 
  options: ImageResizeOptions = { maxWidth: 1200, maxHeight: 800, quality: 0.8 }
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      const aspectRatio = width / height;

      if (width > options.maxWidth) {
        width = options.maxWidth;
        height = width / aspectRatio;
      }

      if (height > options.maxHeight) {
        height = options.maxHeight;
        width = height * aspectRatio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and resize image
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with optimized image
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          } else {
            reject(new Error('Failed to optimize image'));
          }
        },
        'image/jpeg',
        options.quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validates if file is an image and within size limits
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Файл має бути зображенням' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Розмір файлу не може перевищувати 10MB' };
  }

  // Check image dimensions (will be done async)
  return { isValid: true };
};

/**
 * Gets image dimensions from file
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Creates a thumbnail from an image file
 */
export const createThumbnail = (
  file: File,
  size: number = 150
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set square canvas
      canvas.width = size;
      canvas.height = size;

      // Calculate crop dimensions (center crop)
      const { naturalWidth, naturalHeight } = img;
      const minDim = Math.min(naturalWidth, naturalHeight);
      const startX = (naturalWidth - minDim) / 2;
      const startY = (naturalHeight - minDim) / 2;

      // Draw cropped and resized image
      ctx?.drawImage(
        img, 
        startX, startY, minDim, minDim, // Source
        0, 0, size, size // Destination
      );

      // Convert to data URL
      const dataURL = canvas.toDataURL('image/jpeg', 0.7);
      resolve(dataURL);
    };

    img.onerror = () => reject(new Error('Failed to create thumbnail'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Batch process multiple image files
 */
export const processImageFiles = async (
  files: File[],
  options?: ImageResizeOptions
): Promise<File[]> => {
  const processedFiles: File[] = [];

  for (const file of files) {
    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        console.warn(`Skipping ${file.name}: ${validation.error}`);
        continue;
      }

      // Process image file
      const processedFile = await resizeImage(file, options);
      processedFiles.push(processedFile);
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
      // Include original file if processing fails
      processedFiles.push(file);
    }
  }

  return processedFiles;
};