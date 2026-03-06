import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export default function ShockAbsorberChainAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const holdRef=useRef(false);
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),pulse:0,absorbed:0,completionFired:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      s.pulse=clamp(s.pulse+0.01,0,1);
      if(holdRef.current && s.pulse>0.55){ s.absorbed=clamp(s.absorbed+0.022,0,1); }
      const resolve=easeOutCubic(s.absorbed); cb.onStateChange?.(resolve);
      if(resolve>=0.42&&resolve<0.46) cb.onHaptic('hold_threshold');
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const dark=lerpColor([10,10,16],s.primaryRgb,0.18), threat=lerpColor([255,90,72],s.accentRgb,0.16), chain=lerpColor([176,206,240],s.primaryRgb,0.22), safe=lerpColor([206,230,255],s.primaryRgb,0.4);
      ctx.fillStyle=rgba(dark,0.98*entrance); ctx.fillRect(0,0,w,h);
      ctx.strokeStyle=rgba(chain,0.26*entrance); ctx.lineWidth=px(0.008,minDim); ctx.beginPath(); ctx.moveTo(w*0.12,cy); ctx.lineTo(w*0.88,cy); ctx.stroke();
      const pulseX=w*(0.12+0.4*Math.min(1,s.pulse/0.55)); ctx.beginPath(); ctx.arc(pulseX,cy,minDim*0.038,0,Math.PI*2); ctx.fillStyle=rgba(threat,(0.18+Math.min(s.pulse,0.55))*entrance); ctx.fill();
      ctx.beginPath(); ctx.arc(cx,cy,minDim*(0.06+resolve*0.03),0,Math.PI*2); ctx.fillStyle=rgba(safe,(0.2+resolve*0.55)*entrance); ctx.fill();
      if(resolve>0.1){ ctx.strokeStyle=rgba(safe,(0.12+resolve*0.3)*entrance); ctx.lineWidth=px(0.006,minDim); ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(w*0.88,cy); ctx.stroke(); }
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const onDown=()=>{holdRef.current=true; callbacksRef.current.onHaptic('hold_start');};
    const onUp=()=>{holdRef.current=false;};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp); canvas.addEventListener('pointerleave',onUp);
    return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp); canvas.removeEventListener('pointerleave',onUp);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
