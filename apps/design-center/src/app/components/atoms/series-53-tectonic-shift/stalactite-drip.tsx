import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v)); const STEP_T=0.42; const COMPLETE_T=0.97;
export default function StalactiteDripAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
 const canvasRef=useRef<HTMLCanvasElement>(null); const callbacksRef=useRef({onHaptic,onStateChange,onResolve}); const propsRef=useRef({color,accentColor,phase,composed}); const holdRef=useRef(false); const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),growth:0,thresholdFired:false,completionFired:false});
 useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]); useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]); useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
 useEffect(()=>{const canvas=canvasRef.current; if(!canvas)return; const ctx=canvas.getContext('2d'); if(!ctx)return; let raf=0;
  const render=()=>{const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,h*0.46,w,h,minDim,s.primaryRgb,entrance); if(holdRef.current||p.phase==='resolve') s.growth+=(1-s.growth)*0.03; const reveal=easeOutCubic(clamp(s.growth,0,1)); cb.onStateChange?.(reveal); if(reveal>=STEP_T&&!s.thresholdFired){s.thresholdFired=true; cb.onHaptic('step_advance');} if(reveal>=COMPLETE_T&&!s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
   const primary=s.primaryRgb,accent=s.accentRgb,deep=lerpColor([4,5,9],primary,0.1), mineral=lerpColor(accent,[230,213,186],0.5), glow=lerpColor(primary,[245,247,255],0.84); ctx.fillStyle=rgba(deep,0.98*entrance); ctx.fillRect(0,0,w,h);
   for(let i=0;i<5;i+=1){ const x=w*(0.18+i*0.16); ctx.beginPath(); ctx.moveTo(x,h*0.1); ctx.lineTo(x-minDim*0.018,h*0.18); ctx.lineTo(x+minDim*0.018,h*0.18); ctx.closePath(); ctx.fillStyle=rgba(mineral,0.22*entrance); ctx.fill(); }
   ctx.beginPath(); ctx.moveTo(cx,h*0.1); ctx.lineTo(cx-minDim*(0.04+reveal*0.08),h*(0.22+reveal*0.34)); ctx.lineTo(cx+minDim*(0.04+reveal*0.08),h*(0.22+reveal*0.34)); ctx.closePath(); ctx.fillStyle=rgba(glow,(0.16+reveal*0.5)*entrance); ctx.fill();
   for(let i=0;i<3;i+=1){ const yy=h*(0.16+i*0.14); ctx.beginPath(); ctx.arc(cx,yy,minDim*0.008,0,Math.PI*2); ctx.fillStyle=rgba(glow,(0.12 + (holdRef.current ? 0.1 : 0)) * entrance); ctx.fill(); }
   ctx.restore(); raf=window.requestAnimationFrame(render);
  };
  const onDown=(e:PointerEvent)=>{holdRef.current=true; canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('hold_start');}; const onUp=(e:PointerEvent)=>{holdRef.current=false; canvas.releasePointerCapture(e.pointerId);};
  raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp); return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
 },[viewport.width,viewport.height]);
 return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
