import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type Point = { x:number; y:number };

export default function CornerstoneAlignAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;offsetX:number;offsetY:number}>({active:false,offsetX:0,offsetY:0});
  const holdRef=useRef(false);
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),x:0.28,y:0.74,lock:0,completionFired:false});

  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0; let last=performance.now();
    const render=(now:number)=>{
      const dt=Math.min(0.05,(now-last)/1000); last=now;
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const { w,h,cx,cy,minDim }=setupCanvas(canvas,ctx,viewport.width,viewport.height); const { progress, entrance }=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const aligned=Math.abs(s.x-0.5)<0.05&&Math.abs(s.y-0.72)<0.05;
      if(holdRef.current&&aligned){ s.lock=clamp(s.lock+dt*0.26,0,1); } else if(!holdRef.current){ s.lock=clamp(s.lock-dt*0.06,0,1); }
      const resolve=easeOutCubic(s.lock); cb.onStateChange?.(resolve); if(resolve>0.4&&resolve<0.44) cb.onHaptic('hold_threshold'); if(resolve>=1&&!s.completionFired){ s.completionFired=true; cb.onHaptic('seal_stamp'); cb.onResolve?.(); }
      const bg=lerpColor([10,12,16],s.primaryRgb,0.16), stone=lerpColor([192,216,255],s.primaryRgb,0.22), gold=lerpColor([248,214,166],s.accentRgb,0.34);
      ctx.fillStyle=rgba(bg,0.98*entrance); ctx.fillRect(0,0,w,h);
      roundedRect(ctx,w*0.5-minDim*0.08,h*0.72-minDim*0.03,minDim*0.16,minDim*0.06,minDim*0.01); ctx.strokeStyle=rgba(gold,0.18*entrance); ctx.lineWidth=px(0.005,minDim); ctx.stroke();
      roundedRect(ctx,w*s.x-minDim*0.08,h*s.y-minDim*0.03,minDim*0.16,minDim*0.06,minDim*0.01); ctx.fillStyle=rgba(stone,0.9*entrance); ctx.fill();
      if(resolve>0.12){ for(let i=0;i<7;i+=1){ const towerH=minDim*(0.05+resolve*0.22*(1-i*0.09)); ctx.fillStyle=rgba(gold,(0.1+resolve*0.4)*entrance); ctx.fillRect(w*0.24+i*minDim*0.09,h*0.72-towerH,minDim*0.06,towerH); } }
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const point=(e:PointerEvent):Point=>{ const r=canvas.getBoundingClientRect(); return { x:((e.clientX-r.left)/r.width)*viewport.width, y:((e.clientY-r.top)/r.height)*viewport.height }; };
    const onDown=(e:PointerEvent)=>{ const pt=point(e); dragRef.current={active:true,offsetX:pt.x-viewport.width*stateRef.current.x,offsetY:pt.y-viewport.height*stateRef.current.y}; holdRef.current=true; canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('drag_snap'); };
    const onMove=(e:PointerEvent)=>{ if(!dragRef.current.active) return; const pt=point(e); stateRef.current.x=clamp((pt.x-dragRef.current.offsetX)/viewport.width,0.18,0.82); stateRef.current.y=clamp((pt.y-dragRef.current.offsetY)/viewport.height,0.3,0.84); };
    const onUp=(e:PointerEvent)=>{ dragRef.current.active=false; holdRef.current=false; canvas.releasePointerCapture(e.pointerId); };
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{ window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp); };
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
