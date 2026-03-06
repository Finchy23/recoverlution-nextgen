import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export default function EndowmentPurgeAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;startX:number;startY:number}>({active:false,startX:0,startY:0});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),purge:0,completionFired:false});

  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const { w,h,cx,cy,minDim }=setupCanvas(canvas,ctx,viewport.width,viewport.height); const { progress, entrance }=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(s.purge); cb.onStateChange?.(resolve); if(resolve>=1&&!s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const bg=lerpColor([10,12,16],s.primaryRgb,0.16), core=lerpColor([248,214,166],s.accentRgb,0.34), field=lerpColor([196,220,255],s.primaryRgb,0.2);
      ctx.fillStyle=rgba(bg,0.98*entrance); ctx.fillRect(0,0,w,h);
      for(let i=0;i<28;i+=1){ const a=(i/28)*Math.PI*2; const r=minDim*(0.06+resolve*0.34); const x=cx+Math.cos(a)*r; const y=cy+Math.sin(a)*r; ctx.beginPath(); ctx.arc(x,y,minDim*0.006,0,Math.PI*2); ctx.fillStyle=rgba(field,resolve*0.7*entrance); ctx.fill(); }
      ctx.beginPath(); ctx.arc(cx,cy,minDim*(0.08-resolve*0.05),0,Math.PI*2); ctx.fillStyle=rgba(core,(0.45+(1-resolve)*0.4)*entrance); ctx.fill();
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const onDown=(e:PointerEvent)=>{ dragRef.current={active:true,startX:e.clientX,startY:e.clientY}; canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('hold_start'); };
    const onMove=(e:PointerEvent)=>{ if(!dragRef.current.active) return; const d=Math.hypot(e.clientX-dragRef.current.startX,e.clientY-dragRef.current.startY); stateRef.current.purge=clamp(d/viewport.height,0,1); if(stateRef.current.purge>0.3) callbacksRef.current.onHaptic('swipe_commit'); };
    const onUp=(e:PointerEvent)=>{ dragRef.current.active=false; canvas.releasePointerCapture(e.pointerId); };
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{ window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp); };
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
