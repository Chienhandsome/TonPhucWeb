import {NextResponse} from 'next/server';
export async function POST(){const response=NextResponse.json({ok:true});response.cookies.set('cms-recovery','',{httpOnly:true,sameSite:'lax',maxAge:0,path:'/admin'});return response;}
