import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Area } from 'react-easy-crop';
import { Bundle, Promotion } from "@/app/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export default async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
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

export const createPromotionAPI = async (creatorId: string, promotion: Omit<Promotion, "_id">) => {
  const res = await fetch(`/api/creators/${creatorId}/promotion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(promotion),
  });
  return res.json();
};
export const updatePromotionAPI = async (
  creatorId: string,
  promoId: string,
  updates: Partial<Promotion>
) => {
  const res = await fetch(`/api/creators/${creatorId}/promotion?promoId=${promoId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error(`Failed to update promotion: ${res.status}`);
  }

  return res.json();
};
export const createBundleAPI = async (creatorId: string, bundle: Bundle) => {
  const res = await fetch(`/api/creators/${creatorId}/bundles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bundle),
  });
  return res.json();
};