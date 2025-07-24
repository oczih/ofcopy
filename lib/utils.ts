import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Area } from 'react-easy-crop';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export default async function agetCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image();
  image.src = imageSrc; 
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error("Canvas context not available");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/jpeg');
  });
}
