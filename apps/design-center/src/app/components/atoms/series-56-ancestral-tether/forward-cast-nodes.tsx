import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type P={x:number;y:number};

export default function ForwardCastNodesAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;last:P|null}>({active:false,last:null});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),rise:0,nodes:[] as {x:number;y:number}[],completionFired:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(s.rise); cb.onStateChange?.(resolve);
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const dark=lerpColor([12,12,18],s.primaryRgb,0.16), core=lerpColor([214,236,255],s.primaryRgb,0.44), trail=lerpColor([208,180,132],s.accentRgb,0.24);
      ctx.fillStyle=rgba(dark,0.98*entrance); ctx.fillRect(0,0,w,h);
      for(const n of s.nodes){ ctx.beginPath(); ctx.arc(n.x,n.y,minDim*0.02,0,Math.PI*2); ctx.fillStyle=rgba(trail,0.66*entrance); ctx.fill(); }
      const y=h*(0.78-s.rise*0.48); ctx.beginPath(); ctx.arc(cx,y,minDim*0.05,0,Math.PI*2); ctx.fillStyle=rgba(core,(0.2+resolve*0.6)*entrance); ctx.fill();
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const getP=(e:PointerEvent)=>{const r=canvas.getBoundingClientRect(); return {x:((e.clientX-r.left)/r.width)*viewport.width,y:((e.clientY-r.top)/r.height)*viewport.height};};
    const onDown=(e:PointerEvent)=>{dragRef.current={active:true,last:getP(e)}; canvas.setPointerCapture(e.pointerId);};
    const onMove=(e:PointerEvent)=>{if(!dragRef.current.active||!dragRef.current.last) return; const pt=getP(e); const dy=dragRef.current.last.y-pt.y; if(dy>0){ stateRef.current.rise=clamp(stateRef.current.rise+dy/viewport.height*1.4,0,1); stateRef.current.nodes.push({x:viewport.width*0.5,y:viewport.height*(0.78-stateRef.current.rise*0.48)+Math.random()*4-2}); if(stateRef.current.nodes.length>24) stateRef.current.nodes.shift(); callbacksRef.current.onHaptic('drag_snap'); if(stateRef.current.rise>=0.35&&stateRef.current.rise<0.38) callbacksRef.current.onHaptic('step_advance'); if(stateRef.current.rise>=0.72&&stateRef.current.rise<0.75) callbacksRef.current.onHaptic('step_advance'); } dragRef.current.last=pt;};
    const onUp=(e:PointerEvent)=>{dragRef.current={active:false,last:null}; canvas.releasePointerCapture(e.pointerId);};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
