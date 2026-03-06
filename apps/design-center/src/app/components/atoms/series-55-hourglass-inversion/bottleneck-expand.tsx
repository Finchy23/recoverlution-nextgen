import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type P={x:number;y:number};

export default function BottleneckExpandAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;last:P|null}>({active:false,last:null});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),width:0.12,completionFired:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(clamp((s.width-0.12)/0.28,0,1)); cb.onStateChange?.(resolve);
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const glass=lerpColor([180,198,214],s.primaryRgb,0.18), sand=lerpColor([220,184,120],s.accentRgb,0.25), dark=lerpColor([18,18,24],s.primaryRgb,0.18);
      ctx.fillStyle=rgba(dark,0.98*entrance); ctx.fillRect(0,0,w,h);
      ctx.strokeStyle=rgba(glass,0.74*entrance); ctx.lineWidth=px(0.012,minDim); ctx.beginPath(); ctx.moveTo(cx-minDim*0.16,h*0.14); ctx.lineTo(cx-minDim*(s.width/2),cy); ctx.lineTo(cx-minDim*0.16,h*0.86); ctx.moveTo(cx+minDim*0.16,h*0.14); ctx.lineTo(cx+minDim*(s.width/2),cy); ctx.lineTo(cx+minDim*0.16,h*0.86); ctx.stroke();
      const jam=Math.max(0,1-resolve);
      ctx.fillStyle=rgba(sand,(0.78+jam*0.12)*entrance); roundedRect(ctx,cx-minDim*0.11,h*0.18,minDim*0.22,minDim*0.12,minDim*0.02); ctx.fill();
      ctx.fillStyle=rgba(sand,(0.6+resolve*0.25)*entrance); ctx.fillRect(cx-minDim*s.width*0.45,cy,minDim*s.width*0.9,h*0.24);
      ctx.fillStyle=rgba(lerpColor([255,98,76],sand,0.3),0.14*jam*entrance); ctx.fillRect(cx-minDim*0.06,cy-minDim*0.03,minDim*0.12,minDim*0.06);
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const getP=(e:PointerEvent)=>{const r=canvas.getBoundingClientRect(); return {x:((e.clientX-r.left)/r.width)*viewport.width,y:((e.clientY-r.top)/r.height)*viewport.height};};
    const onDown=(e:PointerEvent)=>{dragRef.current={active:true,last:getP(e)}; canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('hold_start');};
    const onMove=(e:PointerEvent)=>{if(!dragRef.current.active||!dragRef.current.last) return; const pt=getP(e); const dx=Math.abs(pt.x-dragRef.current.last.x); stateRef.current.width=clamp(stateRef.current.width+dx/viewport.width*0.35,0.12,0.4); if(dx>1) callbacksRef.current.onHaptic('drag_snap'); dragRef.current.last=pt;};
    const onUp=(e:PointerEvent)=>{dragRef.current={active:false,last:null}; canvas.releasePointerCapture(e.pointerId);};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
