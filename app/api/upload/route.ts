import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ALLOWED_UPLOAD_TYPES } from '@/lib/audio';

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

        // Securely map the file directly into the logged-in user's folder!
        const cleanName = pathname.replace(/^recordings\//, "");
        const finalPathname = `recordings/${session.user.email}/${cleanName}`;

        return {
          allowedContentTypes: ALLOWED_UPLOAD_TYPES,
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
