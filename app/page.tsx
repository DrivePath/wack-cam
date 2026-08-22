"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const FX = [
  ["melt","FACE MELT","〰","#ff4ecb"],["toxic","TOXIC","☢","#caff00"],
  ["vhs","VHS GOBLIN","▰","#8f72ff"],["xray","X-RAY","☠","#77e8ff"],
  ["heat","HEAT VISION","◉","#ff6b2c"],["fish","FISHEYE","◎","#ffd42a"],
  ["ghost","GHOST TRAIL","♨","#88ffbe"],["pixel","PIXEL PANIC","▦","#ff7899"]
] as const;

export default function Home() {
  const video = useRef<HTMLVideoElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream|null>(null), frame = useRef(0);
  const [fx,setFx]=useState("melt"), [power,setPower]=useState(72), [facing,setFacing]=useState<"user"|"environment">("user");
  const [mode,setMode]=useState<"loading"|"live"|"demo">("loading"), [shot,setShot]=useState<string|null>(null), [flash,setFlash]=useState(false);

  const start=useCallback(async()=>{
    stream.current?.getTracks().forEach(t=>t.stop()); setMode("loading");
    try { const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing,width:{ideal:1280},height:{ideal:960}},audio:false});
      stream.current=s; if(video.current){video.current.srcObject=s;await video.current.play()} setMode("live");
    } catch { setMode("demo") }
  },[facing]);
  useEffect(()=>{start();return()=>stream.current?.getTracks().forEach(t=>t.stop())},[start]);

  useEffect(()=>{
    const c=canvas.current,v=video.current;if(!c||!v)return;const x=c.getContext("2d",{willReadFrequently:true});if(!x)return;
    const draw=(t:number)=>{
      const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=Math.max(480,Math.floor(r.width*d)),h=Math.max(480,Math.floor(r.height*d));
      if(c.width!==w||c.height!==h){c.width=w;c.height=h} x.save();x.clearRect(0,0,w,h);
      if(mode==="live"&&v.readyState>=2){const z=Math.max(w/v.videoWidth,h/v.videoHeight),dw=v.videoWidth*z,dh=v.videoHeight*z;if(facing==="user"){x.translate(w,0);x.scale(-1,1)}x.drawImage(v,(w-dw)/2,(h-dh)/2,dw,dh)}
      else {const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,`hsl(${t/35%360} 75% 20%)`);g.addColorStop(1,`hsl(${(t/35+100)%360} 85% 55%)`);x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle="white";x.textAlign="center";x.font=`900 ${Math.max(24,w/14)}px Arial`;x.fillText("CAMERA OFFLINE",w/2,h*.45);x.font=`700 ${Math.max(14,w/30)}px Arial`;x.fillText("ALLOW CAMERA ACCESS TO GET WEIRD",w/2,h*.52)}x.restore();
      const k=power/100;
      const filters:Record<string,string>={toxic:`contrast(${1.1+k}) saturate(${2+k*4}) hue-rotate(${60+k*90}deg)`,xray:`invert(${.6+k*.4}) grayscale(${k}) contrast(${1.2+k}) hue-rotate(170deg)`,heat:`contrast(${1.2+k}) saturate(${2+k*5}) hue-rotate(${300+k*45}deg)`,vhs:`contrast(${1.1+k*.5}) saturate(${1.2+k*1.8}) hue-rotate(${Math.sin(t/90)*k*20}deg)`,ghost:`grayscale(${k*.8}) contrast(${1.1+k}) hue-rotate(90deg)`};
      c.style.filter=filters[fx]||`contrast(${1+k*.45}) saturate(${1+k*2})`;
      if(fx==="vhs"){x.globalCompositeOperation="screen";x.globalAlpha=.16*k;x.drawImage(c,Math.sin(t/25)*14*k,0);x.globalAlpha=.28;x.fillStyle="#ff006e";for(let y=0;y<h;y+=9)x.fillRect(0,y,w,2)}
      if(fx==="pixel"){const b=Math.max(4,Math.round(7+k*34)),q=document.createElement("canvas");q.width=Math.ceil(w/b);q.height=Math.ceil(h/b);q.getContext("2d")?.drawImage(c,0,0,q.width,q.height);x.imageSmoothingEnabled=false;x.clearRect(0,0,w,h);x.drawImage(q,0,0,w,h);x.imageSmoothingEnabled=true}
      if(fx==="melt")for(let i=0;i<18;i++){const px=i*w/18,sw=w/18+1,dy=Math.sin(t/300+i*.8)*k*h*.05;x.drawImage(c,px,0,sw,h,px,Math.max(0,dy),sw,h)}
      if(fx==="fish"){const rr=Math.min(w,h)*(.22+k*.18);x.save();x.beginPath();x.arc(w/2,h/2,rr,0,Math.PI*2);x.clip();x.drawImage(c,w/2-rr*1.35,h/2-rr*1.35,rr*2.7,rr*2.7);x.restore();x.strokeStyle=`rgba(255,255,255,${.25+k*.5})`;x.lineWidth=5;x.stroke()}
      if(fx==="ghost"){x.globalAlpha=.22+k*.2;x.globalCompositeOperation="screen";x.drawImage(c,Math.sin(t/260)*30*k,-10*k)}
      x.globalAlpha=1;x.globalCompositeOperation="source-over";frame.current=requestAnimationFrame(draw)
    };frame.current=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame.current)
  },[mode,facing,fx,power]);

  const capture=()=>{if(canvas.current){setFlash(true);setTimeout(()=>setFlash(false),180);setShot(canvas.current.toDataURL("image/jpeg",.94))}};
  const chaos=()=>{const f=FX[Math.floor(Math.random()*FX.length)];setFx(f[0]);setPower(35+Math.floor(Math.random()*66))};
  return <main className="app-shell">
    <header><div className="brand"><span>WACK</span> CAM<i>!</i></div><button className="chaos" onClick={chaos}>⚡ CHAOS ME</button></header>
    <section className="studio"><div className="camera-card"><video ref={video} muted playsInline/><canvas ref={canvas} aria-label="Live filtered camera preview"/>{flash&&<div className="flash"/>}<div className="status"><b>{mode==="live"?"● LIVE":"● DEMO"}</b><span>{FX.find(f=>f[0]===fx)?.[1]}</span></div><button className="flip" onClick={()=>setFacing(f=>f==="user"?"environment":"user")} aria-label="Flip camera">↻</button><div className="capture-wrap"><button className="capture" onClick={capture} aria-label="Take photo"><span/></button></div></div>
    <aside className="control-panel"><div className="panel-title"><span>PICK YOUR</span><strong>POISON</strong></div><div className="filters">{FX.map(f=><button key={f[0]} className={fx===f[0]?"active":""} style={{"--accent":f[3]} as React.CSSProperties} onClick={()=>setFx(f[0])}><span className="filter-icon">{f[2]}</span><span>{f[1]}</span></button>)}</div><div className="intensity-row"><label htmlFor="power">WACK LEVEL</label><output>{power}%</output></div><input id="power" type="range" min="0" max="100" value={power} onChange={e=>setPower(+e.target.value)} style={{"--value":`${power}%`} as React.CSSProperties}/><p className="tip">TIP: cranking it to 100% may alter your molecular structure.</p></aside></section>
    <footer><span>NO BEAUTY MODE.</span><span>NO APOLOGIES.</span><b>100% UNHINGED.</b></footer>
    {shot&&<div className="modal" role="dialog" aria-modal="true"><div className="shot-card"><button className="close" onClick={()=>setShot(null)}>×</button><img src={shot} alt="Your filtered capture"/><div><a href={shot} download={`wack-cam-${Date.now()}.jpg`}>↓ SAVE THIS MASTERPIECE</a><button onClick={()=>setShot(null)}>RETAKE</button></div></div></div>}
  </main>
}
