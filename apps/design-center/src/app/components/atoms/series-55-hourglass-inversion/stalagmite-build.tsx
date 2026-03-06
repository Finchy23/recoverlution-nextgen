import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type P={x:number;y:number};

export default function StalagmiteBuildAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;startY:number;startReveal:number}>({active:false,startY:0,startReveal:0});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),reveal:0,completionFired:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(s.reveal); cb.onStateChange?.(resolve);
      if(resolve>=0.4 && resolve<0.43) cb.onHaptic('step_advance');
      if(resolve>=0.8 && resolve<0.83) cb.onHaptic('step_advance');
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const dark=lerpColor([16,16,20],s.primaryRgb,0.14), drop=lerpColor([210,220,255],s.primaryRgb,0.22), spire=lerpColor([212,178,118],s.accentRgb,0.28);
      ctx.fillStyle=rgba(dark,0.98*entrance); ctx.fillRect(0,0,w,h);
      for(let i=0;i<7;i+=1){ const y=h*(0.14+i*0.08); ctx.beginPath(); ctx.arc(cx,y,minDim*0.012,0,Math.PI*2); ctx.fillStyle=rgba(drop,(0.12+(1-resolve)*0.08)*entrance); ctx.fill(); }
      const baseY=h*(0.88-resolve*0.24); ctx.beginPath(); ctx.moveTo(cx-minDim*0.08,h*0.9); ctx.lineTo(cx+minDim*0.08,h*0.9); ctx.lineTo(cx,baseY); ctx.closePath(); ctx.fillStyle=rgba(spire,(0.2+resolve*0.7)*entrance); ctx.fill();
      ctx.strokeStyle=rgba(lerpColor(drop,spire,0.6),(0.18+resolve*0.3)*entrance); ctx.lineWidth=px(0.008,minDim); ctx.beginPath(); ctx.moveTo(cx,h*0.12); ctx.lineTo(cx,h*0.9); ctx.stroke();
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const onDown=(e:PointerEvent)=>{dragRef.current={active:true,startY:e.clientY,startReveal:stateRef.current.reveal}; canvas.setPointerCapture(e.pointerId);};
    const onMove=(e:PointerEvent)=>{if(!dragRef.current.active) return; const dy=dragRef.current.startY-e.clientY; stateRef.current.reveal=clamp(dragRef.current.startReveal+dy/viewport.height,0,1); if(Math.abs(dy)>1) callbacksRef.current.onHaptic('drag_snap');};
    const onUp=(e:PointerEvent)=>{dragRef.current.active=false; canvas.releasePointerCapture(e.pointerId);};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
