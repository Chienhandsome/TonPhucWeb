import {createShareImage} from '@/lib/share-image';

export const runtime = 'nodejs';

export async function GET() {return createShareImage();}
