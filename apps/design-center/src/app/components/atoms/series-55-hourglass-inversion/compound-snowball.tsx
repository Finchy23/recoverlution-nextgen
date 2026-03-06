import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type P={x:number;y:number};

export default function CompoundSnowballAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;last:P|null}>({active:false,last:null});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),tilt:0,roll:0,size:0.04,completionFired:false,steps:[false,false]});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      s.roll=clamp(s.roll+s.tilt*0.01,0,1); s.size=clamp(0.04+s.roll*0.18,0.04,0.22); const resolve=easeOutCubic(s.roll); cb.onStateChange?.(resolve);
      if(resolve>=0.35 && !s.steps[0]){s.steps[0]=true; cb.onHaptic('step_advance');}
      if(resolve>=0.72 && !s.steps[1]){s.steps[1]=true; cb.onHaptic('step_advance');}
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const snow=lerpColor([238,245,255],s.primaryRgb,0.18), sky=lerpColor([70,92,132],s.accentRgb,0.18), trail=lerpColor([180,210,244],s.primaryRgb,0.22);
      ctx.fillStyle=rgba(sky,0.98*entrance); ctx.fillRect(0,0,w,h);
      ctx.beginPath(); ctx.moveTo(0,h*0.78); ctx.lineTo(w,h*(0.64-s.tilt*0.12)); ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath(); ctx.fillStyle=rgba(snow,0.95*entrance); ctx.fill();
      ctx.strokeStyle=rgba(trail,(0.18+resolve*0.3)*entrance); ctx.lineWidth=px(0.014,minDim); ctx.beginPath(); ctx.moveTo(w*0.18,h*0.7); ctx.lineTo(w*(0.18+resolve*0.62),h*(0.7-s.tilt*0.08)); ctx.stroke();
      ctx.beginPath(); ctx.arc(w*(0.18+resolve*0.62),h*(0.68-s.tilt*0.07),minDim*s.size,0,Math.PI*2); ctx.fillStyle=rgba(snow,0.98*entrance); ctx.fill();
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const getP=(e:PointerEvent)=>{const r=canvas.getBoundingClientRect(); return {x:((e.clientX-r.left)/r.width)*viewport.width,y:((e.clientY-r.top)/r.height)*viewport.height};};
    const onDown=(e:PointerEvent)=>{dragRef.current={active:true,last:getP(e)}; canvas.setPointerCapture(e.pointerId);};
    const onMove=(e:PointerEvent)=>{if(!dragRef.current.active||!dragRef.current.last) return; const pt=getP(e); const dx=pt.x-dragRef.current.last.x; stateRef.current.tilt=clamp(stateRef.current.tilt+dx/viewport.width*1.2,0,1); if(Math.abs(dx)>1) callbacksRef.current.onHaptic('step_advance'); dragRef.current.last=pt;};
    const onUp=(e:PointerEvent)=>{dragRef.current={active:false,last:null}; canvas.releasePointerCapture(e.pointerId);};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
