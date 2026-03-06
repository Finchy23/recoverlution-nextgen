import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp = (v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const STEP_T=0.42; const COMPLETE_T=0.97;
type Point={x:number;y:number;t:number};

export default function FaultLineSnapAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;last:Point|null}>({active:false,last:null});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),compression:0,heat:0,thresholdFired:false,completionFired:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance); if(p.phase==='resolve') s.compression+=(1-s.compression)*0.08;
      s.heat=Math.max(s.heat*0.96,s.compression);
      const reveal=easeOutCubic(clamp(s.compression,0,1)); cb.onStateChange?.(reveal);
      if(reveal>=STEP_T && !s.thresholdFired){s.thresholdFired=true; cb.onHaptic('step_advance');}
      if(reveal>=COMPLETE_T && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const primary=s.primaryRgb, accent=s.accentRgb, deep=lerpColor([4,5,9],primary,0.1), rock=lerpColor(accent,[143,132,120],0.22), magma=lerpColor([255,94,72],accent,0.18), line=lerpColor(primary,[245,247,255],0.86);
      ctx.fillStyle=rgba(deep,0.98*entrance); ctx.fillRect(0,0,w,h);
      const push=w*0.16*reveal;
      roundedRect(ctx,w*0.08-push, h*0.24, w*0.36, h*0.52, minDim*0.02); ctx.fillStyle=rgba(rock,0.5*entrance); ctx.fill();
      roundedRect(ctx,w*0.56+push, h*0.24, w*0.36, h*0.52, minDim*0.02); ctx.fillStyle=rgba(rock,0.5*entrance); ctx.fill();
      ctx.fillStyle=rgba(magma,(0.08+s.heat*0.6)*entrance);
      ctx.fillRect(cx-minDim*0.01, h*0.26, minDim*0.02 + minDim*0.12*reveal, h*0.48);
      if(reveal>0.85){ ctx.beginPath(); ctx.moveTo(cx, h*0.24); ctx.lineTo(cx-minDim*0.08, cy-minDim*0.04); ctx.lineTo(cx+minDim*0.04, cy+minDim*0.05); ctx.lineTo(cx-minDim*0.06, h*0.76); ctx.strokeStyle=rgba(line,reveal*entrance); ctx.lineWidth=px(0.01,minDim); ctx.stroke(); }
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const getPoint=(e:PointerEvent):Point=>{const rect=canvas.getBoundingClientRect(); return {x:((e.clientX-rect.left)/rect.width)*viewport.width,y:((e.clientY-rect.top)/rect.height)*viewport.height,t:performance.now()};};
    const onDown=(e:PointerEvent)=>{dragRef.current={active:true,last:getPoint(e)}; canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('hold_start');};
    const onMove=(e:PointerEvent)=>{if(!dragRef.current.active || !dragRef.current.last) return; const next=getPoint(e); const dx=next.x-dragRef.current.last.x; if(Math.abs(dx)>0){ stateRef.current.compression=clamp(stateRef.current.compression+Math.abs(dx/viewport.width)*2.2,0,1);} dragRef.current.last=next;};
    const onUp=(e:PointerEvent)=>{dragRef.current={active:false,last:null}; canvas.releasePointerCapture(e.pointerId);};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
