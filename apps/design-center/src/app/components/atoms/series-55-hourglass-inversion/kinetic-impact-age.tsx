import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export default function KineticImpactAgeAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),age:0,impact:0,broken:false,completionFired:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      if(!s.broken) s.age=clamp(s.age+0.0038,0,1); else s.impact=clamp(s.impact+0.04,0,1);
      const resolve=s.broken?easeOutCubic(s.impact):s.age*0.6; cb.onStateChange?.(resolve);
      if(s.age>=0.72 && s.age<0.724) cb.onHaptic('step_advance');
      if(s.broken && resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const wall=lerpColor([94,96,108],s.primaryRgb,0.12), youth=lerpColor([168,194,255],s.primaryRgb,0.22), elder=lerpColor([178,132,94],s.accentRgb,0.22), flash=lerpColor([255,238,210],s.primaryRgb,0.5);
      ctx.fillStyle=rgba([18,18,22],0.98*entrance); ctx.fillRect(0,0,w,h);
      if(!s.broken){ roundedRect(ctx,w*0.66,h*0.24,w*0.12,h*0.52,minDim*0.02); ctx.fillStyle=rgba(wall,0.96*entrance); ctx.fill(); }
      const nodeX=s.broken? lerpColor([0,0,0],[0,0,0],0)[0] : 0; // no-op to keep lint quiet
      void nodeX;
      const dropX=w*(0.22+s.impact*0.42); const radius=minDim*(0.035+s.age*0.06); ctx.beginPath(); ctx.arc(dropX,cy,radius,0,Math.PI*2); ctx.fillStyle=rgba(lerpColor(youth,elder,s.age),(0.8+s.age*0.15)*entrance); ctx.fill();
      if(s.broken){ ctx.strokeStyle=rgba(flash,(0.25+s.impact*0.55)*entrance); ctx.lineWidth=px(0.012,minDim); ctx.beginPath(); ctx.moveTo(w*0.68,h*0.24); ctx.lineTo(w*0.8,h*0.5); ctx.lineTo(w*0.66,h*0.76); ctx.stroke(); }
      ctx.fillStyle=rgba(flash,0.18*entrance); ctx.font=`${px(0.022,minDim)}px Inter, sans-serif`; ctx.textAlign='center'; ctx.fillText(s.broken?'impact':'let the mass build',cx,h*0.92);
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const onDown=()=>{const s=stateRef.current; if(s.age<0.88){callbacksRef.current.onHaptic('error_boundary'); return;} s.broken=true; callbacksRef.current.onHaptic('completion');};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'manipulation'}}/></div>;
}
