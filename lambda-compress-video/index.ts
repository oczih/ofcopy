import { spawnSync } from "child_process";
import fs from "fs";
import ffmpegPath from "ffmpeg-static";

export const handler = async (event: Buffer) => {
  const inputPath = "/tmp/input.mp4";
  const outputPath = "/tmp/output.mp4";

  fs.writeFileSync(inputPath, event);

  spawnSync(ffmpegPath!, [
    "-i", inputPath,
    "-vf", "scale='if(gt(iw/ih,1920/1080),1920,-2)':'if(gt(iw/ih,1920/1080),-2,1080)'",
    "-b:v", "1000k",
    "-preset", "fast",
    "-c:a", "aac",
    "-b:a", "128k",
    outputPath,
  ]);

  const compressedBuffer = fs.readFileSync(outputPath);
  return compressedBuffer;
};
