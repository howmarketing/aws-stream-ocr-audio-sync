/**
 * Image Preprocessing Module
 * Uses Sharp for image optimization before OCR
 */

import sharp from 'sharp';
import { PreprocessingOptions } from './types';

/**
 * Preprocess image for optimal OCR accuracy
 * Pipeline: grayscale → threshold → denoise → resize
 */
export async function preprocessImage(
  inputPath: string,
  outputPath: string,
  options: PreprocessingOptions = {}
): Promise<{ width: number; height: number }> {
  const {
    grayscale = true,
    threshold = 128,
    denoise = true,
    resize = true,
    targetWidth = 1920,
  } = options;

  let pipeline = sharp(inputPath);

  // Step 1: Convert to grayscale (reduces complexity)
  if (grayscale) {
    pipeline = pipeline.grayscale();
  }

  // Step 2: Apply threshold for binarization (black & white)
  // This improves Tesseract accuracy on text
  if (threshold) {
    pipeline = pipeline.threshold(threshold);
  }

  // Step 3: Denoise with median filter
  if (denoise) {
    pipeline = pipeline.median(3);
  }

  // Step 4: Resize to optimal resolution
  // Too small = blurry text, too large = slow processing
  if (resize) {
    pipeline = pipeline.resize({
      width: targetWidth,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Save preprocessed image
  await pipeline.toFile(outputPath);

  // Get final image metadata
  const metadata = await sharp(outputPath).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

/**
 * Validate image file
 */
export async function validateImage(filePath: string): Promise<boolean> {
  try {
    const metadata = await sharp(filePath).metadata();

    // Check if valid image format
    if (!metadata.format || !['jpeg', 'png', 'jpg'].includes(metadata.format)) {
      return false;
    }

    // Check reasonable dimensions (not too small, not too large)
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (width < 100 || height < 100) {
      return false; // Too small
    }

    if (width > 10000 || height > 10000) {
      return false; // Too large
    }

    return true;
  } catch (error) {
    return false;
  }
}
