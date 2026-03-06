import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export default function WeightDisplacementLeverAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),load:0,completionFired:false,steps:[false,false]});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      s.load=clamp(s.load+0.0045,0,1); const resolve=easeOutCubic(s.load); cb.onStateChange?.(resolve);
      if(resolve>=0.35 && !s.steps[0]){s.steps[0]=true; cb.onHaptic('step_advance');}
      if(resolve>=0.72 && !s.steps[1]){s.steps[1]=true; cb.onHaptic('step_advance');}
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const metal=lerpColor([128,132,144],s.primaryRgb,0.12), sand=lerpColor([220,186,132],s.accentRgb,0.22), light=lerpColor([242,236,220],s.primaryRgb,0.28);
      ctx.fillStyle=rgba([16,16,20],0.98*entrance); ctx.fillRect(0,0,w,h);
      ctx.strokeStyle=rgba(metal,0.78*entrance); ctx.lineWidth=px(0.01,minDim); ctx.beginPath(); ctx.moveTo(w*0.28,cy); ctx.lineTo(w*0.72,cy); ctx.stroke();
      const leftY=cy-minDim*0.16*resolve, rightY=cy+minDim*0.14*resolve;
      ctx.beginPath(); ctx.arc(w*0.28,leftY,minDim*0.05,0,Math.PI*2); ctx.fillStyle=rgba(light,(0.22+resolve*0.46)*entrance); ctx.fill();
      roundedRect(ctx,w*0.66,rightY-minDim*0.05,minDim*0.12,minDim*0.1,minDim*0.02); ctx.fillStyle=rgba(sand,(0.4+resolve*0.45)*entrance); ctx.fill();
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    raf=window.requestAnimationFrame(render); return ()=>window.cancelAnimationFrame(raf);
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%'}}/></div>;
}
