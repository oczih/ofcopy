import axios from "axios";
import { Post } from "../types";
import imageCompression from 'browser-image-compression';

interface SignedUrlResponse {
  uploadUrl: string;
  key: string;
}

const POST_API = '/api/media';  // Assuming your post creation is via this API

interface CreatePostParams {
  creatorId: string;
  file: File;
  type: string;
  caption: string;
  viewableFor?: 'followers' | 'subscribers';
}

export async function getDownloadUrl(s3Key: string): Promise<string> {
  const response = await axios.post<{ downloadUrl: string }>("/api/media/download-url", { s3Key });
  return response.data.downloadUrl;
}

async function getSignedUrl(fileName: string, contentType: string): Promise<SignedUrlResponse> {
  const response = await axios.post<SignedUrlResponse>("/api/media/upload-url", {
    s3Key: `uploads/${fileName}`,
    contentType,
  });
  return response.data;
}

async function uploadFileToS3(file: File, signedUrl: string): Promise<void> {
  try {
    await axios.put(signedUrl, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${progress}%`);
        }
      },
    });
  } catch (error) {
    console.error("Upload failed", error);
    throw error;
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/\s+/g, "-").toLowerCase();
}

async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,         // Target maximum size in MB
    maxWidthOrHeight: 1920, // Resize image if larger than this
    useWebWorker: true,
  };
  return await imageCompression(file, options);
}

export async function uploadContent(file: File): Promise<string> {
  let fileToUpload = file;

  // Only compress if it's an image
  if (file.type.startsWith("image/")) {
    fileToUpload = await compressImage(file);
    console.log(`Compressed image from ${file.size / 1024}KB to ${fileToUpload.size / 1024}KB`);
  }

  const sanitizedFileName = sanitizeFileName(fileToUpload.name);
  const { uploadUrl, key } = await getSignedUrl(sanitizedFileName, fileToUpload.type);
  await uploadFileToS3(fileToUpload, uploadUrl);
  return key;
}

export async function createPostWithUpload({
  creatorId,
  file,
  type,
  caption,
  viewableFor = 'followers',
}: CreatePostParams) {
  const s3Key = await uploadContent(file);
  console.log('Uploaded S3 key:', s3Key);
  const response = await axios.post(`${POST_API}`, {
    s3Key,
    caption,
    creatorId,
    type,
    viewable: viewableFor,
    width: 1024,  // Replace with actual if needed
    height: 1536,
  });

  return response.data.post;
}

const updatePost = async (id: string, newData: Partial<Post>): Promise<Post> => {
  try {
    const response = await axios.put(`${POST_API}/${id}`, newData);
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};
const uploadmediaservice = {
  createPostWithUpload,
  uploadContent,
  updatePost,
  getDownloadUrl,
};

export default uploadmediaservice;
