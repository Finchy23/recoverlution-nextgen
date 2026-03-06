import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type P={x:number;y:number};

export default function StructuralIntegrityChainAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const pinchRef=useRef<{active:boolean;startDist:number;startThickness:number}>({active:false,startDist:0,startThickness:0});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),thickness:0.1,completionFired:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const pointers=new Map<number,P>();
    const dist=()=>{const pts=[...pointers.values()]; if(pts.length<2) return 0; return Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y);};
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(clamp((s.thickness-0.1)/0.28,0,1)); cb.onStateChange?.(resolve);
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const dark=lerpColor([12,12,18],s.primaryRgb,0.18), chain=lerpColor([180,210,242],s.primaryRgb,0.28), weight=lerpColor([255,108,86],s.accentRgb,0.18), core=lerpColor([244,248,255],s.primaryRgb,0.48);
      ctx.fillStyle=rgba(dark,0.98*entrance); ctx.fillRect(0,0,w,h);
      ctx.strokeStyle=rgba(chain,(0.16+resolve*0.44)*entrance); ctx.lineWidth=px(s.thickness,minDim); ctx.beginPath(); ctx.moveTo(w*0.18,cy); ctx.lineTo(w*0.82,cy); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,cy,minDim*(0.045+resolve*0.05),0,Math.PI*2); ctx.fillStyle=rgba(core,(0.2+resolve*0.55)*entrance); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx,cy-minDim*0.18); ctx.lineTo(cx,cy-minDim*0.04); ctx.strokeStyle=rgba(weight,0.5*entrance); ctx.lineWidth=px(0.008,minDim); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,cy-minDim*0.22,minDim*(0.03+0.02*(1-resolve)),0,Math.PI*2); ctx.fillStyle=rgba(weight,(0.18+(1-resolve)*0.42)*entrance); ctx.fill();
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const point=(e:PointerEvent):P=>{const r=canvas.getBoundingClientRect(); return {x:((e.clientX-r.left)/r.width)*viewport.width,y:((e.clientY-r.top)/r.height)*viewport.height};};
    const update=()=>{if(pointers.size===2){const d=dist(); if(!pinchRef.current.active){pinchRef.current={active:true,startDist:d,startThickness:stateRef.current.thickness}; callbacksRef.current.onHaptic('hold_start');} else {stateRef.current.thickness=clamp(pinchRef.current.startThickness+(d-pinchRef.current.startDist)/viewport.width,0.1,0.38); if(stateRef.current.thickness>=0.2&&stateRef.current.thickness<0.22) callbacksRef.current.onHaptic('step_advance'); if(stateRef.current.thickness>=0.3&&stateRef.current.thickness<0.32) callbacksRef.current.onHaptic('step_advance');}}};
    const onDown=(e:PointerEvent)=>{pointers.set(e.pointerId,point(e)); canvas.setPointerCapture(e.pointerId); update();};
    const onMove=(e:PointerEvent)=>{if(!pointers.has(e.pointerId)) return; pointers.set(e.pointerId,point(e)); update();};
    const onUp=(e:PointerEvent)=>{pointers.delete(e.pointerId); pinchRef.current.active=false; canvas.releasePointerCapture(e.pointerId);};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
