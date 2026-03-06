import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type Point = { x:number; y:number };

export default function TimeCapsuleVaultAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{mode:'draw'|'door'|null; offsetX:number}>({mode:null,offsetX:0});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),draw:0,door:0,completionFired:false});

  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const { w,h,cx,cy,minDim }=setupCanvas(canvas,ctx,viewport.width,viewport.height); const { progress, entrance }=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(s.door); cb.onStateChange?.(resolve); if(resolve>=1&&!s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const bg=lerpColor([10,12,16],s.primaryRgb,0.16), pattern=lerpColor([248,214,166],s.accentRgb,0.34), door=lerpColor([196,220,255],s.primaryRgb,0.24);
      ctx.fillStyle=rgba(bg,0.98*entrance); ctx.fillRect(0,0,w,h);
      for(let i=0;i<8;i+=1){ const a=(i/8)*Math.PI*2; ctx.beginPath(); ctx.arc(cx+Math.cos(a)*minDim*0.08,cy+Math.sin(a)*minDim*0.08,minDim*(0.004+s.draw*0.01),0,Math.PI*2); ctx.fillStyle=rgba(pattern,s.draw*0.7*entrance); ctx.fill(); }
      ctx.beginPath(); ctx.arc(cx,cy,minDim*(0.012+s.draw*0.02),0,Math.PI*2); ctx.fillStyle=rgba(pattern,s.draw*0.8*entrance); ctx.fill();
      roundedRect(ctx,w*(0.72-s.door*0.28),h*0.28,w*0.2,h*0.44,minDim*0.02); ctx.fillStyle=rgba(door,0.88*entrance); ctx.fill();
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const point=(e:PointerEvent):Point=>{ const r=canvas.getBoundingClientRect(); return { x:((e.clientX-r.left)/r.width)*viewport.width, y:((e.clientY-r.top)/r.height)*viewport.height }; };
    const onDown=(e:PointerEvent)=>{ const pt=point(e); if(sqrtDist(pt.x,pt.y,viewport.width*0.82,viewport.height*0.5)<viewport.height*0.18 && stateRef.current.draw>0.5){ dragRef.current={mode:'door',offsetX:pt.x-viewport.width*stateRef.current.door}; } else { dragRef.current={mode:'draw',offsetX:0}; } canvas.setPointerCapture(e.pointerId); };
    const onMove=(e:PointerEvent)=>{ const pt=point(e); if(dragRef.current.mode==='draw'){ stateRef.current.draw=clamp(stateRef.current.draw+0.03,0,1); callbacksRef.current.onHaptic('drag_snap'); } else if(dragRef.current.mode==='door'){ stateRef.current.door=clamp((viewport.width*0.82-pt.x)/(viewport.width*0.28),0,1); } };
    const onUp=(e:PointerEvent)=>{ dragRef.current.mode=null; canvas.releasePointerCapture(e.pointerId); };
    const sqrtDist=(x1:number,y1:number,x2:number,y2:number)=>Math.hypot(x1-x2,y1-y2);
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{ window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp); };
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
