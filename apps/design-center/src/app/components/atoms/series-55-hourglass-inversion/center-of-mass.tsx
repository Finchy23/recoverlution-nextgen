import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export default function CenterOfMassAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),settle:0,completionFired:false,steps:[false,false]});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      s.settle=clamp(s.settle+0.0045,0,1); const resolve=easeOutCubic(s.settle); cb.onStateChange?.(resolve);
      if(resolve>=0.34 && !s.steps[0]){s.steps[0]=true; cb.onHaptic('step_advance');}
      if(resolve>=0.72 && !s.steps[1]){s.steps[1]=true; cb.onHaptic('step_advance');}
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const base=lerpColor([28,28,32],s.primaryRgb,0.16), shape=lerpColor([162,152,142],s.accentRgb,0.18), glow=lerpColor([245,236,214],s.primaryRgb,0.34);
      ctx.fillStyle=rgba(base,0.98*entrance); ctx.fillRect(0,0,w,h);
      const wobble=Math.sin(performance.now()*0.004)*(1-resolve)*0.3;
      ctx.translate(cx,cy+minDim*0.1); ctx.rotate(wobble);
      ctx.beginPath(); ctx.moveTo(0,-minDim*(0.2+0.1*(1-resolve))); ctx.lineTo(minDim*(0.1+0.05*resolve),minDim*0.14); ctx.lineTo(-minDim*(0.1+0.05*resolve),minDim*0.14); ctx.closePath(); ctx.fillStyle=rgba(shape,0.92*entrance); ctx.fill();
      ctx.beginPath(); ctx.arc(0,minDim*(0.07+resolve*0.05),minDim*(0.035+resolve*0.07),0,Math.PI*2); ctx.fillStyle=rgba(glow,(0.16+resolve*0.34)*entrance); ctx.fill();
      ctx.restore();
      ctx.strokeStyle=rgba(glow,(0.12+resolve*0.35)*entrance); ctx.lineWidth=px(0.012,minDim); ctx.beginPath(); ctx.moveTo(cx-minDim*0.18,cy+minDim*0.24); ctx.lineTo(cx+minDim*0.18,cy+minDim*0.24); ctx.stroke();
      raf=window.requestAnimationFrame(render);
    };
    raf=window.requestAnimationFrame(render); return ()=>window.cancelAnimationFrame(raf);
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%'}}/></div>;
}
