import {ImageResponse} from 'next/og';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import siteInfo from '@/data/site-info.json';

const size = {width:1200,height:630};

export async function createShareImage() {
  const logo=await readFile(join(process.cwd(),'public/source/b984c2f09e515e.png'));
  return new ImageResponse(<div style={{display:'flex',flexDirection:'column',width:'100%',height:'100%',background:'#122c42',color:'#fff',padding:'60px 72px',fontFamily:'sans-serif'}}>
    <div style={{display:'flex',alignItems:'center',gap:24}}><div style={{display:'flex',background:'#fff',borderRadius:14,padding:'12px 18px'}}><img src={`data:image/png;base64,${logo.toString('base64')}`} width={100} height={61}/></div><span style={{fontSize:44,fontWeight:700,letterSpacing:3}}>TÔN PHÚC</span></div>
    <div style={{display:'flex',flexDirection:'column',marginTop:48,fontSize:62,lineHeight:1.2,fontWeight:700}}><span>Gas lạnh &amp;</span><span style={{color:'#8ad1c7'}}>vật tư điện lạnh</span></div>
    <div style={{display:'flex',marginTop:'auto',paddingTop:24,borderTop:'1px solid #ffffff30',justifyContent:'space-between',fontSize:24,color:'#d5e2e8'}}><span>tonphuc.com</span><span>{siteInfo.contact.phoneDisplay}</span></div>
  </div>,size);
}
