import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type Point = { x:number; y:number };

export default function CatalystDropGridAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;offsetX:number;offsetY:number}>({active:false,offsetX:0,offsetY:0});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),dropX:0.18,dropY:0.78,wave:0,completionFired:false});

  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const { w,h,cx,cy,minDim }=setupCanvas(canvas,ctx,viewport.width,viewport.height); const { progress, entrance }=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(s.wave); cb.onStateChange?.(resolve); if(resolve>=1&&!s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const bg=lerpColor([10,12,16],s.primaryRgb,0.16), dormant=lerpColor([86,104,132],s.primaryRgb,0.12), wake=lerpColor([248,214,166],s.accentRgb,0.32);
      ctx.fillStyle=rgba(bg,0.98*entrance); ctx.fillRect(0,0,w,h);
      for(let yi=0; yi<8; yi+=1){ for(let xi=0; xi<10; xi+=1){ const x=w*(0.16+xi*0.07); const y=h*(0.18+yi*0.08); const dist=Math.hypot(x-cx,y-cy)/(minDim*0.4); ctx.beginPath(); ctx.arc(x,y,minDim*0.008,0,Math.PI*2); ctx.fillStyle=rgba(resolve>dist?wake:dormant,(0.14+(resolve>dist?0.5:0.08))*entrance); ctx.fill(); } }
      if(s.wave===0){ ctx.beginPath(); ctx.arc(w*s.dropX,h*s.dropY,minDim*0.02,0,Math.PI*2); ctx.fillStyle=rgba(wake,0.9*entrance); ctx.fill(); }
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const point=(e:PointerEvent):Point=>{ const r=canvas.getBoundingClientRect(); return { x:((e.clientX-r.left)/r.width)*viewport.width, y:((e.clientY-r.top)/r.height)*viewport.height }; };
    const onDown=(e:PointerEvent)=>{ const pt=point(e); dragRef.current={active:true,offsetX:pt.x-viewport.width*stateRef.current.dropX,offsetY:pt.y-viewport.height*stateRef.current.dropY}; canvas.setPointerCapture(e.pointerId); };
    const onMove=(e:PointerEvent)=>{ if(!dragRef.current.active||stateRef.current.wave>0) return; const pt=point(e); stateRef.current.dropX=clamp((pt.x-dragRef.current.offsetX)/viewport.width,0.1,0.9); stateRef.current.dropY=clamp((pt.y-dragRef.current.offsetY)/viewport.height,0.1,0.9); };
    const onUp=(e:PointerEvent)=>{ if(Math.hypot(viewport.width*stateRef.current.dropX-viewport.width*0.5,viewport.height*stateRef.current.dropY-viewport.height*0.5)<viewport.height*0.08){ stateRef.current.wave=1; callbacksRef.current.onHaptic('step_advance'); } dragRef.current.active=false; canvas.releasePointerCapture(e.pointerId); };
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{ window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp); };
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
