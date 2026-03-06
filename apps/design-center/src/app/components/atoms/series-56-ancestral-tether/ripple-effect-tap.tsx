import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export default function RippleEffectTapAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),ripple:0,started:false,completionFired:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      if(s.started) s.ripple=clamp(s.ripple+0.02,0,1);
      const resolve=easeOutCubic(s.ripple); cb.onStateChange?.(resolve);
      if(resolve>=0.42&&resolve<0.45) cb.onHaptic('step_advance');
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const dark=lerpColor([10,10,14],s.primaryRgb,0.16), node=lerpColor([242,248,255],s.primaryRgb,0.46), wave=lerpColor([218,188,128],s.accentRgb,0.28);
      ctx.fillStyle=rgba(dark,0.98*entrance); ctx.fillRect(0,0,w,h);
      ctx.strokeStyle=rgba(wave,0.18*entrance); ctx.lineWidth=px(0.008,minDim); ctx.beginPath(); ctx.moveTo(w*0.16,cy); ctx.lineTo(w*0.84,cy); ctx.stroke();
      for(let i=0;i<6;i+=1){ const x=w*(0.24+i*0.1); ctx.beginPath(); ctx.arc(x,cy,minDim*0.014*(1+Math.max(0,resolve-i*0.12)*3),0,Math.PI*2); ctx.fillStyle=rgba(wave,(0.08+Math.max(0,resolve-i*0.12)*0.5)*entrance); ctx.fill(); }
      ctx.beginPath(); ctx.arc(cx,cy,minDim*0.04,0,Math.PI*2); ctx.fillStyle=rgba(node,0.92*entrance); ctx.fill();
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const onDown=()=>{if(stateRef.current.started) return; stateRef.current.started=true; callbacksRef.current.onHaptic('tap');};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'manipulation'}}/></div>;
}
