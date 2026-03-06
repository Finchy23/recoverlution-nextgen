import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type P={x:number;y:number};

export default function CompressionArchLoadAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;last:P|null}>({active:false,last:null});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),arch:0,completionFired:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(s.arch); cb.onStateChange?.(resolve);
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const dark=lerpColor([10,10,16],s.primaryRgb,0.18), arch=lerpColor([186,212,244],s.primaryRgb,0.28), weight=lerpColor([255,92,76],s.accentRgb,0.18);
      ctx.fillStyle=rgba(dark,0.98*entrance); ctx.fillRect(0,0,w,h);
      ctx.beginPath(); ctx.moveTo(w*0.3,cy+minDim*0.16); ctx.quadraticCurveTo(cx,cy-minDim*(0.04+resolve*0.24),w*0.7,cy+minDim*0.16); ctx.strokeStyle=rgba(arch,(0.14+resolve*0.5)*entrance); ctx.lineWidth=px(0.012,minDim); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,cy-minDim*0.24,minDim*0.04,0,Math.PI*2); ctx.fillStyle=rgba(weight,(0.42-(resolve*0.24))*entrance); ctx.fill();
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const getP=(e:PointerEvent)=>{const r=canvas.getBoundingClientRect(); return {x:((e.clientX-r.left)/r.width)*viewport.width,y:((e.clientY-r.top)/r.height)*viewport.height};};
    const onDown=(e:PointerEvent)=>{dragRef.current={active:true,last:getP(e)}; canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('error_boundary');};
    const onMove=(e:PointerEvent)=>{if(!dragRef.current.active||!dragRef.current.last) return; const pt=getP(e); const dx=Math.abs(pt.x-dragRef.current.last.x); stateRef.current.arch=clamp(stateRef.current.arch+dx/viewport.width*1.2,0,1); if(dx>1) callbacksRef.current.onHaptic('swipe_commit'); dragRef.current.last=pt;};
    const onUp=(e:PointerEvent)=>{dragRef.current={active:false,last:null}; canvas.releasePointerCapture(e.pointerId);};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
