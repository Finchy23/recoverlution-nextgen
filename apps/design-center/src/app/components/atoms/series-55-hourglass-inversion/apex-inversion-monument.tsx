import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export default function ApexInversionMonumentAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),reveal:0,flash:0,completionFired:false,seal:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      s.reveal=clamp(s.reveal+0.0045,0,1); if(s.reveal>0.82) s.flash=clamp((s.reveal-0.82)/0.18,0,1); const resolve=easeOutCubic(s.reveal); cb.onStateChange?.(resolve);
      if(resolve>=0.82 && !s.seal){s.seal=true; cb.onHaptic('step_advance');}
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('seal_stamp'); cb.onResolve?.();}
      const dark=lerpColor([10,10,14],s.primaryRgb,0.18), gold=lerpColor([230,186,112],s.accentRgb,0.26), light=lerpColor([255,244,222],s.primaryRgb,0.44);
      ctx.fillStyle=rgba(dark,(0.98-s.flash*0.7)*entrance); ctx.fillRect(0,0,w,h);
      roundedRect(ctx,w*0.42,h*0.14,w*0.16,h*0.24,minDim*0.025); ctx.fillStyle=rgba(gold,(0.16+(1-resolve)*0.18)*entrance); ctx.fill();
      if(s.flash>0.02){ ctx.fillStyle=rgba(light,s.flash*0.82*entrance); ctx.fillRect(0,0,w,h); }
      if(resolve>0.4){ ctx.beginPath(); ctx.moveTo(cx-minDim*0.11,h*0.82); ctx.lineTo(cx-minDim*0.08,h*(0.48-resolve*0.08)); ctx.lineTo(cx,h*(0.34-resolve*0.08)); ctx.lineTo(cx+minDim*0.08,h*(0.48-resolve*0.08)); ctx.lineTo(cx+minDim*0.11,h*0.82); ctx.closePath(); ctx.fillStyle=rgba(gold,(0.12+(resolve-0.4))*entrance); ctx.fill(); }
      ctx.fillStyle=rgba(light,0.18*entrance); ctx.font=`${px(0.022,minDim)}px Inter, sans-serif`; ctx.textAlign='center'; ctx.fillText(resolve<0.82?'final grain':'the monument',cx,h*0.94);
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    raf=window.requestAnimationFrame(render); return ()=>window.cancelAnimationFrame(raf);
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%'}}/></div>;
}
