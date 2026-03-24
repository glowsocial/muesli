import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        // Securely map the file directly into the logged-in user's folder!
        const cleanName = pathname.replace(/^recordings\//, "");
        const finalPathname = `recordings/${session.user.email}/${cleanName}`;

        return {
          allowedContentTypes: ['audio/webm', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/mpeg'],
          tokenPayload: JSON.stringify({ userId: session.user.id }),
          pathname: finalPathname, 
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('blob upload completed', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}
