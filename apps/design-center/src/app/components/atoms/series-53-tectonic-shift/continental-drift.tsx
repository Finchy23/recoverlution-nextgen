import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v)); const STEP_T=0.44; const COMPLETE_T=0.97;
export default function ContinentalDriftAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
 const canvasRef=useRef<HTMLCanvasElement>(null); const callbacksRef=useRef({onHaptic,onStateChange,onResolve}); const propsRef=useRef({color,accentColor,phase,composed}); const runningRef=useRef(false); const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),merge:0,thresholdFired:false,completionFired:false});
 useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]); useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]); useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
 useEffect(()=>{const canvas=canvasRef.current; if(!canvas)return; const ctx=canvas.getContext('2d'); if(!ctx)return; let raf=0;
  const render=()=>{const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance); if(runningRef.current||p.phase==='resolve') s.merge+=(1-s.merge)*0.025; const reveal=easeOutCubic(clamp(s.merge,0,1)); cb.onStateChange?.(reveal); if(reveal>=STEP_T&&!s.thresholdFired){s.thresholdFired=true; cb.onHaptic('step_advance');} if(reveal>=COMPLETE_T&&!s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
   const primary=s.primaryRgb,accent=s.accentRgb,deep=lerpColor([4,6,10],primary,0.1), land=lerpColor(accent,[138,146,126],0.28), seam=lerpColor(primary,[245,247,255],0.86); ctx.fillStyle=rgba(deep,0.98*entrance); ctx.fillRect(0,0,w,h);
   roundedRect(ctx,w*(0.1+reveal*0.18),h*0.3,w*0.24,h*0.24,minDim*0.03); ctx.fillStyle=rgba(land,0.52*entrance); ctx.fill();
   roundedRect(ctx,w*(0.66-reveal*0.18),h*0.42,w*0.24,h*0.22,minDim*0.03); ctx.fillStyle=rgba(land,0.52*entrance); ctx.fill();
   if(reveal>0.82){ctx.beginPath(); ctx.moveTo(w*0.42,h*0.46); ctx.lineTo(w*0.58,h*0.46); ctx.strokeStyle=rgba(seam,reveal*entrance); ctx.lineWidth=px(0.012,minDim); ctx.stroke();}
   ctx.beginPath(); ctx.arc(cx,h*0.82,minDim*0.024,0,Math.PI*2); ctx.fillStyle=rgba(seam,(0.16+reveal*0.4)*entrance); ctx.fill();
   ctx.restore(); raf=window.requestAnimationFrame(render);
  };
  const onDown=(e:PointerEvent)=>{runningRef.current=true; canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('tap');}; const onUp=(e:PointerEvent)=>{runningRef.current=false; canvas.releasePointerCapture(e.pointerId);};
  raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp); return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
 },[viewport.width,viewport.height]);
 return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
