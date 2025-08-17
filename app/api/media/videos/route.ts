
export const config = { api: { bodyParser: false } };


/*
export const POST = async (req: NextRequest) => {
  try {
    const form = formidable({ multiples: false });
    const incoming = req.body; // raw stream

    const { file } = await new Promise<{ file: formidable.File }>((resolve, reject) => {
      form.parse(incoming as any, (err, fields, files) => {
        if (err) return reject(err);
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!file) return reject(new Error("No file uploaded"));
        resolve({ file });
      });
    });

    // Read file as buffer
    const fileBuffer = fs.readFileSync(file.filepath);

    // Invoke AWS Lambda for compression
    const lambdaResponse = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: "compress-video-lambda",
        Payload: fileBuffer,
      })
    );

    if (!lambdaResponse.Payload) throw new Error("Lambda did not return data");
    const compressedBuffer = Buffer.from(lambdaResponse.Payload);

    return new NextResponse(compressedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="compressed-${file.originalFilename}"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Video compression failed" }, { status: 500 });
  }
};
 */