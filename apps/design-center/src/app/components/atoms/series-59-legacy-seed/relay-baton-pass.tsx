import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export default function RelayBatonPassAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;startX:number;charged:boolean}>({active:false,startX:0,charged:false});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),runnerX:0.18,energy:1,pass:0,completionFired:false});

  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0; let last=performance.now();
    const render=(now:number)=>{
      const dt=Math.min(0.05,(now-last)/1000); last=now;
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const { w,h,minDim }=setupCanvas(canvas,ctx,viewport.width,viewport.height); const { progress, entrance }=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,w*0.5,h*0.58,w,h,minDim,s.primaryRgb,entrance);
      if(s.pass===0){ s.runnerX=clamp(s.runnerX+dt*0.18,0.18,0.54); s.energy=clamp(s.energy-dt*0.1,0,1); }
      else { s.pass=clamp(s.pass+dt*0.44,0,1); }
      const resolve=easeOutCubic(s.pass); cb.onStateChange?.(resolve);
      if(resolve>=1&&!s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const bg=lerpColor([10,12,16],s.primaryRgb,0.16), fire=lerpColor([248,196,142],s.accentRgb,0.34), runner=lerpColor([198,220,255],s.primaryRgb,0.28);
      ctx.fillStyle=rgba(bg,0.98*entrance); ctx.fillRect(0,0,w,h);
      ctx.strokeStyle=rgba(runner,0.24*entrance); ctx.lineWidth=px(0.006,minDim); ctx.beginPath(); ctx.moveTo(w*0.12,h*0.72); ctx.lineTo(w*0.88,h*0.72); ctx.stroke();
      const oldX = w*(s.pass>0 ? 0.54 : s.runnerX);
      ctx.beginPath(); ctx.arc(oldX,h*0.68,minDim*0.03,0,Math.PI*2); ctx.fillStyle=rgba(runner,(0.2+(1-s.pass)*0.5)*entrance); ctx.fill();
      const batonX = s.pass>0 ? oldX + (w*0.78-oldX)*resolve : oldX;
      ctx.beginPath(); ctx.arc(batonX,h*0.64,minDim*(0.016 + (1-s.energy)*0.008),0,Math.PI*2); ctx.fillStyle=rgba(fire,(0.3+s.energy*0.6)*entrance); ctx.fill();
      ctx.beginPath(); ctx.arc(w*0.78,h*0.68,minDim*0.03,0,Math.PI*2); ctx.fillStyle=rgba(runner,(0.16+resolve*0.6)*entrance); ctx.fill();
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const onDown=(e:PointerEvent)=>{ dragRef.current={active:true,startX:e.clientX,charged:stateRef.current.energy<0.45}; canvas.setPointerCapture(e.pointerId); };
    const onMove=(e:PointerEvent)=>{ if(!dragRef.current.active||!dragRef.current.charged||stateRef.current.pass>0) return; if(e.clientX-dragRef.current.startX>viewport.width*0.14){ stateRef.current.pass=0.04; callbacksRef.current.onHaptic('swipe_commit'); } };
    const onUp=(e:PointerEvent)=>{ dragRef.current.active=false; canvas.releasePointerCapture(e.pointerId); };
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{ window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp); };
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
