  import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
  import { NextRequest, NextResponse } from "next/server";

  export async function POST(req: NextRequest) {
    console.log("POST /api/media/download-url called");
    try {
      // Parse the request body
      const body = await req.json();
      const { s3Key } = body;

      console.log("Received s3Key:", s3Key);

      // Validate required parameters
      if (!s3Key) {
        return NextResponse.json({ error: "Missing s3Key" }, { status: 400 });
      }

      // Validate environment variables
      if (!process.env.CF_DOMAIN) {
        console.error("Missing CF_DOMAIN environment variable");
        return NextResponse.json({ error: "CloudFront domain not configured" }, { status: 500 });
      }

      if (!process.env.CF_KEY_PAIR_ID) {
        console.error("Missing CF_KEY_PAIR_ID environment variable");
        return NextResponse.json({ error: "CloudFront key pair ID not configured" }, { status: 500 });
      }

      if (!process.env.CF_PRIVATE_KEY) {
        console.error("Missing CF_PRIVATE_KEY environment variable");
        return NextResponse.json({ error: "CloudFront private key not configured" }, { status: 500 });
      }

      // Clean the s3Key - remove leading slashes and ensure it's a string
      const cleanedKey = s3Key.toString().replace(/^\/+/, "");

      // Construct the full URL
      const cfDomain = process.env.CF_DOMAIN.replace(/\/$/, ""); // Remove trailing slash
      const fullUrl = `${cfDomain}/${cleanedKey}`;

      // Validate that we have a proper URL structure
      try {
        new URL(fullUrl);
      } catch (urlError) {
        console.error("Invalid URL constructed:", fullUrl, urlError);
        return NextResponse.json({ error: "Invalid URL structure" }, { status: 400 });
      }

      // Process the private key - handle newlines properly
      const privateKey = process.env.CF_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      // Generate expiration time (1 hour from now)
      const expirationTime = new Date(Date.now() + 3600 * 1000);

      // Generate the signed URL
      const signedUrl = getSignedUrl({
        url: fullUrl,
        keyPairId: process.env.CF_KEY_PAIR_ID,
        privateKey: privateKey,
        dateLessThan: expirationTime 
      });

      // Validate the generated signed URL
      try {
        new URL(signedUrl);
      } catch (signedUrlError) {
        console.error("Invalid signed URL generated:", signedUrl, signedUrlError);
        return NextResponse.json({ error: "Failed to generate valid signed URL" }, { status: 500 });
      }

      return NextResponse.json({ 
        downloadUrl: signedUrl,
        expiresAt: expirationTime.toISOString()
      });

    } catch (error) {
      console.error("Error in download-url API:", error);
      
      // More specific error messages
      if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
      }
      
      if (error instanceof TypeError) {
        return NextResponse.json({ error: "Invalid parameters provided" }, { status: 400 });
      }

      // Generic error for CloudFront signing issues
      console.log("POST /api/media/download-url completed");
      return NextResponse.json({ 
        error: "Failed to generate download URL", 
        details: process.env.NODE_ENV === 'development' ? error : undefined 
      }, { status: 500 });
    }
  }

  // Optional: Add GET method for health check
  export async function GET() {
    return NextResponse.json({ 
      status: "ok", 
      service: "download-url",
      configured: {
        cfDomain: !!process.env.CF_DOMAIN,
        cfKeyPairId: !!process.env.CF_KEY_PAIR_ID,
        cfPrivateKey: !!process.env.CF_PRIVATE_KEY
      }
    });
  }