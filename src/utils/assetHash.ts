'use client';

import { createHash } from 'crypto';

/**
 * Generates a content hash for a file
 * @param file The file to generate a hash for
 * @returns Promise that resolves to a hash string
 */
export async function generateContentHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        if (!e.target?.result) {
          throw new Error('Failed to read file');
        }

        const content = e.target.result;
        const hash = createHash('sha256');
        hash.update(content.toString());
        resolve(hash.digest('hex').slice(0, 8)); // Use first 8 characters of hash
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Appends a content hash to a URL for cache busting
 * @param url The base URL
 * @param hash The content hash
 * @returns URL with hash parameter
 */
export function appendHashToUrl(url: string, hash: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}h=${hash}`;
}