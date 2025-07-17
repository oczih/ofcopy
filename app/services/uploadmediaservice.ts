import axios from "axios";
import Post from "../models/postmodel";
import Creator from "../models/creatormodel";
interface SignedUrlResponse {
  url: string;
  key: string;
}

interface CreatePostParams {
  creatorId: string;
  file: File;
  type: string;
  caption: string;
  viewableFor?: 'followers' | 'subscribers';
}

export async function getDownloadUrl(key: string): Promise<string> {
  const response = await axios.get<SignedUrlResponse>("/api/media/get-media", {
    params: { key },
  });
  return response.data.url;
}

async function getSignedUrl(fileName: string, fileType: string): Promise<SignedUrlResponse> {
  const response = await axios.post<SignedUrlResponse>("/api/media/upload-url", {
    fileName,
    fileType,
  });
  return response.data;
}
export async function createPostWithUpload({
  creatorId,
  file,
  type,
  caption,
  viewableFor = 'followers',
}: CreatePostParams) {
  // Step 1: Upload the file to S3
  const s3Key = await uploadContent(file);  // <== your existing function

  // Step 2: Create the Post
  const newPost = await Post.create({
    creator: creatorId,
    s3Key,
    type,
    caption,
    viewableFor,
  });
  console.log("NewPost: ", newPost)
  // Step 3: Add the post to the creator
  await Creator.findByIdAndUpdate(creatorId, {
    $push: { posts: newPost._id },
  });

  return newPost;
}

async function uploadFileToS3(file: File, signedUrl: string): Promise<void> {
  await axios.put(signedUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
    onUploadProgress: (progressEvent) => {
      const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(`Upload progress: ${progress}%`);
    },
  });
}

/**
 * Uploads file to S3 via signed URL flow.
 * @param file File to upload
 * @returns The S3 key (path) of the uploaded file
 */
export async function uploadContent(file: File): Promise<string> {
  const { url, key } = await getSignedUrl(file.name, file.type);
  await uploadFileToS3(file, url);
  return key;
}
