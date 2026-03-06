import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v)); const STEP_T=0.44; const COMPLETE_T=0.97;
export default function MagmaChamberAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
 const canvasRef=useRef<HTMLCanvasElement>(null); const callbacksRef=useRef({onHaptic,onStateChange,onResolve}); const propsRef=useRef({color,accentColor,phase,composed}); const holdRef=useRef(false); const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),pressure:0,thresholdFired:false,completionFired:false});
 useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]); useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]); useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
 useEffect(()=>{const canvas=canvasRef.current; if(!canvas)return; const ctx=canvas.getContext('2d'); if(!ctx)return; let raf=0;
  const render=()=>{const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance); if(holdRef.current||p.phase==='resolve') s.pressure+=(1-s.pressure)*0.04; const reveal=easeOutCubic(clamp(s.pressure,0,1)); cb.onStateChange?.(reveal); if(reveal>=STEP_T&&!s.thresholdFired){s.thresholdFired=true; cb.onHaptic('hold_threshold');} if(reveal>=COMPLETE_T&&!s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
   const primary=s.primaryRgb,accent=s.accentRgb,deep=lerpColor([4,5,10],primary,0.1), crust=lerpColor(accent,[118,112,104],0.2), lava=lerpColor([255,104,66],accent,0.12), gold=lerpColor(accent,[255,214,146],0.62); ctx.fillStyle=rgba(deep,0.98*entrance); ctx.fillRect(0,0,w,h);
   ctx.beginPath(); ctx.moveTo(w*0.12,h*0.54); ctx.lineTo(w*0.88,h*0.54); ctx.lineTo(w*0.88,h*0.76); ctx.lineTo(w*0.12,h*0.76); ctx.closePath(); ctx.fillStyle=rgba(lava,(0.14+reveal*0.5)*entrance); ctx.fill();
   ctx.beginPath(); ctx.moveTo(w*0.08, h*0.4); ctx.quadraticCurveTo(cx, h*(0.24-reveal*0.06), w*0.92, h*0.4); ctx.lineTo(w*0.92,h*0.54); ctx.lineTo(w*0.08,h*0.54); ctx.closePath(); ctx.fillStyle=rgba(crust,0.58*entrance); ctx.fill();
   if(reveal>0.7){ ctx.beginPath(); ctx.moveTo(cx,h*0.44); ctx.lineTo(cx-minDim*0.08,h*(0.2-reveal*0.06)); ctx.lineTo(cx+minDim*0.02,h*(0.12-reveal*0.04)); ctx.lineTo(cx+minDim*0.1,h*(0.18-reveal*0.05)); ctx.strokeStyle=rgba(gold,(reveal-0.68)*2.2*entrance); ctx.lineWidth=px(0.014,minDim); ctx.stroke(); }
   ctx.beginPath(); ctx.arc(cx,cy,minDim*(0.04+reveal*0.06),0,Math.PI*2); ctx.fillStyle=rgba(gold,(0.16+reveal*0.5)*entrance); ctx.fill();
   ctx.restore(); raf=window.requestAnimationFrame(render);
  };
  const onDown=(e:PointerEvent)=>{holdRef.current=true; canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('hold_start');}; const onUp=(e:PointerEvent)=>{holdRef.current=false; canvas.releasePointerCapture(e.pointerId);};
  raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp); return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
 },[viewport.width,viewport.height]);
 return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
