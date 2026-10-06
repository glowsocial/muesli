import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isOwnUploadPath } from '@/lib/upload-path';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        const session = await auth();
        if (!session?.user?.email || !session?.user?.id) {
          throw new Error('Unauthorized');
        }

        // The browser chooses the path, so only accept the signed-in person's own folder.
        if (!isOwnUploadPath(pathname, session.user.email)) {
          throw new Error('That upload path is not in your own recordings folder');
        }

        return {
          allowedContentTypes: [
            'audio/webm', 
            'audio/webm;codecs=opus', 
            'audio/webm; codecs=opus', 
            'video/webm', 
            'audio/wav', 
            'audio/mp4', 
            'audio/ogg', 
            'audio/mpeg'
          ],
          tokenPayload: JSON.stringify({ userId: session.user.id }),
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
