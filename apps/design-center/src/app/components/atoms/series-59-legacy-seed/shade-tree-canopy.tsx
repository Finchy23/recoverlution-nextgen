import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type Point = { x:number; y:number };

export default function ShadeTreeCanopyAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({ onHaptic, onStateChange, onResolve });
  const propsRef=useRef({ color, accentColor, phase, composed });
  const dragRef=useRef<{ active:boolean; x:number; y:number }>({ active:false, x:0.16, y:0.82 });
  const stateRef=useRef({ entranceProgress:0, primaryRgb:parseColor(color), accentRgb:parseColor(accentColor), canopy:0, completionFired:false });

  useEffect(()=>{ callbacksRef.current={ onHaptic,onStateChange,onResolve }; },[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{ propsRef.current={ color,accentColor,phase,composed }; },[color,accentColor,phase,composed]);
  useEffect(()=>{ stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor); },[color,accentColor]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d'); if(!ctx) return;
    let raf=0;

    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current;
      const { w,h,cx,minDim }=setupCanvas(canvas,ctx,viewport.width,viewport.height);
      const { progress, entrance }=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress;
      if(!p.composed) drawAtmosphere(ctx,cx,h*0.58,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(s.canopy);
      cb.onStateChange?.(resolve);
      if(resolve>=1 && !s.completionFired){ s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.(); }

      const bg=lerpColor([10,12,16],s.primaryRgb,0.16), trunk=lerpColor([94,70,52],s.accentRgb,0.12), leaf=lerpColor([136,216,170],s.primaryRgb,0.26), tiny=lerpColor([248,220,170],s.accentRgb,0.28);
      ctx.fillStyle=rgba(bg,0.98*entrance); ctx.fillRect(0,0,w,h);

      ctx.strokeStyle=rgba(trunk,0.82*entrance); ctx.lineWidth=px(0.02,minDim);
      ctx.beginPath(); ctx.moveTo(cx,h*0.84); ctx.lineTo(cx,h*0.44); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx,h*0.38,minDim*(0.08+resolve*0.2),minDim*(0.05+resolve*0.12),0,0,Math.PI*2);
      ctx.fillStyle=rgba(leaf,(0.22+resolve*0.5)*entrance); ctx.fill();

      for(let i=0;i<10;i+=1){
        const tx = cx + ((i-4.5)*minDim*0.038);
        const ty = h*(0.7 - resolve*0.12 - (i%2)*0.02);
        ctx.beginPath(); ctx.arc(tx,ty,minDim*0.012,0,Math.PI*2);
        ctx.fillStyle=rgba(tiny,resolve*0.7*entrance); ctx.fill();
      }

      ctx.beginPath(); ctx.arc(w*dragRef.current.x,h*dragRef.current.y,minDim*0.02,0,Math.PI*2);
      ctx.fillStyle=rgba(tiny,0.9*entrance); ctx.fill();
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };

    const point=(e:PointerEvent):Point=>{ const r=canvas.getBoundingClientRect(); return { x:((e.clientX-r.left)/r.width)*viewport.width, y:((e.clientY-r.top)/r.height)*viewport.height }; };
    const onDown=(e:PointerEvent)=>{ const pt=point(e); dragRef.current={ active:true, x:pt.x/viewport.width, y:pt.y/viewport.height }; canvas.setPointerCapture(e.pointerId); };
    const onMove=(e:PointerEvent)=>{ if(!dragRef.current.active) return; const pt=point(e); dragRef.current.x=clamp(pt.x/viewport.width,0.08,0.92); dragRef.current.y=clamp(pt.y/viewport.height,0.12,0.9); if(Math.hypot(pt.x-viewport.width*0.5, pt.y-viewport.height*0.5)<viewport.height*0.16){ stateRef.current.canopy=clamp(stateRef.current.canopy+0.03,0,1); callbacksRef.current.onHaptic('drag_snap'); } };
    const onUp=(e:PointerEvent)=>{ dragRef.current.active=false; canvas.releasePointerCapture(e.pointerId); };

    raf=window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{ window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp); };
  },[viewport.width,viewport.height]);

  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
