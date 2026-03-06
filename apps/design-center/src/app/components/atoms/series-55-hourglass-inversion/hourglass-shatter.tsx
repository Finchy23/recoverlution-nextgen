import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export default function HourglassShatterAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),shatter:0,lastTap:0,completionFired:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      if(s.shatter>0) s.shatter=clamp(s.shatter+0.035,0,1);
      const resolve=easeOutCubic(s.shatter); cb.onStateChange?.(resolve);
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const glass=lerpColor([190,208,228],s.primaryRgb,0.16), sand=lerpColor([224,190,136],s.accentRgb,0.22), ground=lerpColor([90,76,58],s.primaryRgb,0.1);
      ctx.fillStyle=rgba([16,16,20],0.98*entrance); ctx.fillRect(0,0,w,h);
      if(resolve<0.2){ ctx.strokeStyle=rgba(glass,0.82*entrance); ctx.lineWidth=px(0.012,minDim); ctx.beginPath(); ctx.moveTo(cx-minDim*0.16,h*0.14); ctx.lineTo(cx-minDim*0.03,cy); ctx.lineTo(cx-minDim*0.16,h*0.86); ctx.moveTo(cx+minDim*0.16,h*0.14); ctx.lineTo(cx+minDim*0.03,cy); ctx.lineTo(cx+minDim*0.16,h*0.86); ctx.stroke(); }
      const slump=resolve; roundedRect(ctx,w*(0.2-0.1*slump),h*(0.72-0.06*slump),w*(0.6+0.2*slump),h*(0.1+0.12*slump),minDim*0.03); ctx.fillStyle=rgba(lerpColor(sand,ground,0.3),(0.78+resolve*0.12)*entrance); ctx.fill();
      if(resolve>0.05){ ctx.strokeStyle=rgba(glass,(0.25+resolve*0.45)*entrance); ctx.lineWidth=px(0.006,minDim); ctx.beginPath(); ctx.moveTo(cx,h*0.2); ctx.lineTo(cx-minDim*0.16*resolve,h*0.48); ctx.lineTo(cx+minDim*0.22*resolve,h*0.66); ctx.stroke(); }
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const onDown=()=>{const now=performance.now(); if(now-stateRef.current.lastTap<320){stateRef.current.shatter=0.08; callbacksRef.current.onHaptic('completion');} else {callbacksRef.current.onHaptic('tap');} stateRef.current.lastTap=now;};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'manipulation'}}/></div>;
}
