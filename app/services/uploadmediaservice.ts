import axios from "axios";
import { Post } from "../types";
import imageCompression from 'browser-image-compression';
import mime from "mime-types";

function getContentType(file: File): string {
  return file.type || mime.lookup(file.name) || "application/octet-stream";
}
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


async function createBlurredImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);

  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d")!;
  ctx.filter = "blur(20px)";
  ctx.drawImage(img, 0, 0, img.width, img.height);

  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error("Failed to create blurred image");
      resolve(new File([blob], `blurred-${file.name}`, { type: file.type }));
    });
  });
}
export async function uploadContent(
  file: File
): Promise<{ key: string; blurred_key: string } | { prohibited: true }> {

  // ✅ Compress on client
  let fileToScan = file;
  if (file.type.startsWith("image/")) {
    fileToScan = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    });
  }

  // ---- 1. Scan with PhotoDNA ----
  const formData = new FormData();
  formData.append("file", fileToScan);

  const scanResp = await fetch("/api/media/scan-photodna", {
    method: "POST",
    body: formData
  });

  if (!scanResp.ok) {
    const err = await scanResp.json();
    if (err?.error === "Image flagged by PhotoDNA") return { prohibited: true };
    throw new Error(err?.error || "PhotoDNA scan failed");
  }

  // ---- 2. Continue S3 upload (your existing code) ----
  const sanitizedFileName = sanitizeFileName(fileToScan.name);
  const contentType = getContentType(fileToScan);
  const { uploadUrl, key } = await getSignedUrl(sanitizedFileName, contentType);
  await uploadFileToS3(fileToScan, uploadUrl);

  const blurredFile = await createBlurredImage(fileToScan);
  const blurredSanitizedName = sanitizeFileName(blurredFile.name);
  const blurredContentType = getContentType(blurredFile);
  const { uploadUrl: blurredUploadUrl, key: blurred_key } =
    await getSignedUrl(blurredSanitizedName, blurredContentType);
  await uploadFileToS3(blurredFile, blurredUploadUrl);

  return { key, blurred_key };
}



export async function createPostWithUpload({
  creatorId,
  file,
  type,
  caption,
  viewableFor = 'followers',
}: CreatePostParams) {
  // Lataa sekä normaali että blurattu versio yhdellä uploadContent-kutsulla
  const s3KeyObj = await uploadContent(file);



  const response = await axios.post(`${POST_API}`, {
    s3Key: s3KeyObj,
    caption,
    creatorId,
    type,
    viewable: viewableFor,
    width: 1024,
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
