import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g., 'doctor-notes/userId/noteId/')
 * @returns {Promise<{url: string, name: string, type: string}>}
 */
export async function uploadFile(file, path) {
  try {
    // Validate file type and size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Allow any image type (more flexible for profile photos and different browsers)
    const isImage = file.type.startsWith('image/');
    const allowedNonImageTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!isImage && !allowedNonImageTypes.includes(file.type)) {
      throw new Error('File type not allowed. Allowed: PDF, Images, Word docs, TXT');
    }

    // Determine file type category
    let fileTypeCategory = 'document';
    if (file.type === 'application/pdf') {
      fileTypeCategory = 'pdf';
    } else if (file.type.startsWith('image/')) {
      fileTypeCategory = 'image';
    }

    // Create storage reference
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${path}${fileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      name: file.name,
      type: fileTypeCategory,
      size: file.size,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Upload multiple files
 * @param {File[]} files - Array of files to upload
 * @param {string} path - Storage path
 * @returns {Promise<Array>}
 */
export async function uploadFiles(files, path) {
  const uploadPromises = files.map((file) => uploadFile(file, path));
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Firebase Storage
 * @param {string} url - The file URL to delete
 */
export async function deleteFile(url) {
  try {
    // Extract path from URL
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Get file extension from file name
 * @param {string} fileName
 * @returns {string}
 */
export function getFileExtension(fileName) {
  return fileName.split('.').pop().toLowerCase();
}

/**
 * Format file size for display
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

