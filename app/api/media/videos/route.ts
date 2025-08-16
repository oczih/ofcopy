import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath!);

export const POST = async (req: NextRequest) => {
  const form = new formidable.IncomingForm();
  
  const parseForm = () =>
    new Promise<{ filePath: string; fileName: string }>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) return reject(err);
        const file = (files.file as any)[0] || files.file;
        resolve({ filePath: file.filepath, fileName: file.originalFilename });
      });
    });

  try {
    const { filePath, fileName } = await parseForm();
    const outputFile = `/tmp/compressed-${fileName}`;

    await new Promise<void>((resolve, reject) => {
      ffmpeg(filePath)
        .outputOptions([
          "-vf scale='if(gt(iw/ih,1920/1080),1920,-2)':'if(gt(iw/ih,1920/1080),-2,1080)'",
          "-b:v 1000k",
          "-preset fast",
          "-c:a aac",
          "-b:a 128k",
        ])
        .save(outputFile)
        .on("end", resolve)
        .on("error", reject);
    });

    // Now you can read outputFile and upload to S3
    const videoBuffer = fs.readFileSync(outputFile);

    // TODO: upload videoBuffer to S3 here

    return NextResponse.json({ message: "Video processed successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Video processing failed" }, { status: 500 });
  }
};
