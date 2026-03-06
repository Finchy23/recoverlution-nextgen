import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp = (v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export default function HourglassGravityFlipAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;startY:number;startTilt:number}>({active:false,startY:0,startTilt:0});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),tilt:0,completionFired:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(clamp(s.tilt,0,1)); cb.onStateChange?.(resolve);
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const frame=lerpColor([92,86,78],s.primaryRgb,0.14), sand=lerpColor([228,188,108],s.accentRgb,0.28), glow=lerpColor([255,236,188],s.primaryRgb,0.4), dark=lerpColor([18,18,22],s.primaryRgb,0.16);
      ctx.translate(cx,cy); ctx.rotate(Math.PI*resolve);
      ctx.strokeStyle=rgba(frame,0.92*entrance); ctx.lineWidth=px(0.012,minDim);
      ctx.beginPath(); ctx.moveTo(-minDim*0.18,-minDim*0.28); ctx.lineTo(minDim*0.18,-minDim*0.28); ctx.lineTo(minDim*0.06,-minDim*0.02); ctx.lineTo(minDim*0.18,minDim*0.28); ctx.lineTo(-minDim*0.18,minDim*0.28); ctx.lineTo(-minDim*0.06,-minDim*0.02); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-minDim*0.12,-minDim*0.22); ctx.lineTo(minDim*0.12,-minDim*0.22); ctx.lineTo(minDim*0.02,-minDim*0.02); ctx.lineTo(minDim*0.12,minDim*0.22); ctx.lineTo(-minDim*0.12,minDim*0.22); ctx.lineTo(-minDim*0.02,-minDim*0.02); ctx.closePath(); ctx.clip();
      ctx.fillStyle=rgba(dark,0.72*entrance); ctx.fillRect(-minDim*0.2,-minDim*0.3,minDim*0.4,minDim*0.6);
      const upper=1-resolve, lower=resolve;
      ctx.beginPath(); ctx.moveTo(-minDim*0.11,-minDim*0.22); ctx.lineTo(minDim*0.11,-minDim*0.22); ctx.lineTo(minDim*0.03,-minDim*(0.22-upper*0.18)); ctx.lineTo(-minDim*0.03,-minDim*(0.22-upper*0.18)); ctx.closePath(); ctx.fillStyle=rgba(sand,0.88*entrance); ctx.fill();
      const moundH=minDim*(0.06+lower*0.18); ctx.beginPath(); ctx.moveTo(-minDim*0.1,minDim*0.22); ctx.lineTo(minDim*0.1,minDim*0.22); ctx.lineTo(0,minDim*0.22-moundH); ctx.closePath(); ctx.fillStyle=rgba(glow,(0.45+lower*0.45)*entrance); ctx.fill();
      ctx.restore();
      raf=window.requestAnimationFrame(render);
    };
    const onDown=(e:PointerEvent)=>{dragRef.current={active:true,startY:e.clientY,startTilt:stateRef.current.tilt}; canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('hold_start');};
    const onMove=(e:PointerEvent)=>{if(!dragRef.current.active) return; const dy=dragRef.current.startY-e.clientY; stateRef.current.tilt=clamp(dragRef.current.startTilt+dy/viewport.height,0,1);};
    const onUp=(e:PointerEvent)=>{dragRef.current.active=false; canvas.releasePointerCapture(e.pointerId);};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
