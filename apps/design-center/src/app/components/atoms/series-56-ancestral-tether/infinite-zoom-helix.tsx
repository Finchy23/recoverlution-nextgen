import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type P={x:number;y:number};

export default function InfiniteZoomHelixAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const pinchRef=useRef<{active:boolean;startDist:number;startZoom:number}>({active:false,startDist:0,startZoom:0});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),zoom:0,completionFired:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const pointers=new Map<number,P>();
    const distance=()=>{const pts=[...pointers.values()]; if(pts.length<2) return 0; return Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y);};
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(s.zoom); cb.onStateChange?.(resolve);
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('seal_stamp'); cb.onResolve?.();}
      const dark=lerpColor([8,8,14],s.primaryRgb,0.18), a=lerpColor([190,222,255],s.primaryRgb,0.28), b=lerpColor([224,186,132],s.accentRgb,0.28);
      ctx.fillStyle=rgba(dark,0.98*entrance); ctx.fillRect(0,0,w,h);
      for(let i=0;i<12;i+=1){
        const t=i/11;
        const x=cx + Math.sin(t*Math.PI*4+resolve*4) * minDim*(0.04+resolve*0.18);
        const y=h*(0.18+t*0.64);
        const x2=cx + Math.sin(t*Math.PI*4+Math.PI+resolve*4) * minDim*(0.04+resolve*0.18);
        ctx.strokeStyle=rgba(a,(0.12+resolve*0.3)*entrance); ctx.lineWidth=px(0.004,minDim); ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x2,y); ctx.stroke();
        ctx.beginPath(); ctx.arc(x,y,minDim*(0.01+resolve*0.01),0,Math.PI*2); ctx.fillStyle=rgba(a,0.8*entrance); ctx.fill();
        ctx.beginPath(); ctx.arc(x2,y,minDim*(0.01+resolve*0.01),0,Math.PI*2); ctx.fillStyle=rgba(b,0.8*entrance); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(cx,cy,minDim*(0.04*(1-resolve)),0,Math.PI*2); ctx.fillStyle=rgba(a,(0.9-resolve*0.5)*entrance); ctx.fill();
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const point=(e:PointerEvent):P=>{const r=canvas.getBoundingClientRect(); return {x:((e.clientX-r.left)/r.width)*viewport.width,y:((e.clientY-r.top)/r.height)*viewport.height};};
    const update=()=>{if(pointers.size===2){const d=distance(); if(!pinchRef.current.active){pinchRef.current={active:true,startDist:d,startZoom:stateRef.current.zoom}; callbacksRef.current.onHaptic('hold_start');} else {stateRef.current.zoom=clamp(pinchRef.current.startZoom+(d-pinchRef.current.startDist)/viewport.width,0,1); if(stateRef.current.zoom>=0.4&&stateRef.current.zoom<0.43) callbacksRef.current.onHaptic('step_advance');}}};
    const onDown=(e:PointerEvent)=>{pointers.set(e.pointerId,point(e)); canvas.setPointerCapture(e.pointerId); update();};
    const onMove=(e:PointerEvent)=>{if(!pointers.has(e.pointerId)) return; pointers.set(e.pointerId,point(e)); update();};
    const onUp=(e:PointerEvent)=>{pointers.delete(e.pointerId); pinchRef.current.active=false; canvas.releasePointerCapture(e.pointerId);};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
