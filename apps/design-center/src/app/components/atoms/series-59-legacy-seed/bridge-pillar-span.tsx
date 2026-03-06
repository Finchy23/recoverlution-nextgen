import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type Point = { x:number; y:number };

export default function BridgePillarSpanAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;offsetY:number}>({active:false,offsetY:0});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),pillar:0.18,blueprint:0,completionFired:false});

  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const { w,h,cx,minDim }=setupCanvas(canvas,ctx,viewport.width,viewport.height); const { progress, entrance }=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,h*0.58,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(Math.min(s.pillar,s.blueprint)); cb.onStateChange?.(resolve); if(resolve>=1&&!s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const bg=lerpColor([8,10,14],s.primaryRgb,0.18), stone=lerpColor([192,220,255],s.primaryRgb,0.22), ghost=lerpColor([248,214,166],s.accentRgb,0.3);
      ctx.fillStyle=rgba(bg,0.98*entrance); ctx.fillRect(0,0,w,h);
      const pillarH=minDim*(0.08+s.pillar*0.34);
      roundedRect(ctx,cx-minDim*0.04,h*0.82-pillarH,minDim*0.08,pillarH,minDim*0.01); ctx.fillStyle=rgba(stone,0.84*entrance); ctx.fill();
      if(s.blueprint>0){ ctx.strokeStyle=rgba(ghost,s.blueprint*0.5*entrance); ctx.lineWidth=px(0.005,minDim); ctx.beginPath(); ctx.moveTo(w*0.14,h*0.42); ctx.quadraticCurveTo(cx,h*0.14,w*0.86,h*0.42); ctx.stroke(); }
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const point=(e:PointerEvent):Point=>{ const r=canvas.getBoundingClientRect(); return { x:((e.clientX-r.left)/r.width)*viewport.width, y:((e.clientY-r.top)/r.height)*viewport.height }; };
    const onDown=(e:PointerEvent)=>{ const pt=point(e); if(Math.abs(pt.x-viewport.width*0.5)<viewport.width*0.12){ dragRef.current={active:true,offsetY:pt.y-viewport.height*(0.82-stateRef.current.pillar*0.34)}; canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('drag_snap'); } else { stateRef.current.blueprint=1; callbacksRef.current.onHaptic('tap'); } };
    const onMove=(e:PointerEvent)=>{ if(!dragRef.current.active) return; const pt=point(e); const top=pt.y-dragRef.current.offsetY; stateRef.current.pillar=clamp((viewport.height*0.82-top)/(viewport.height*0.34),0.18,1); };
    const onUp=(e:PointerEvent)=>{ dragRef.current.active=false; canvas.releasePointerCapture(e.pointerId); };
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{ window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp); };
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
