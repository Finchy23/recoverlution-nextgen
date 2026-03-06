import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export default function OrbitLaunchEscapeAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;lastX:number;lastY:number}>({active:false,lastX:0,lastY:0});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),spin:0,release:0,completionFired:false});

  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0; let last=performance.now();
    const render=(now:number)=>{
      const dt=Math.min(0.05,(now-last)/1000); last=now;
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const { w,h,cx,cy,minDim }=setupCanvas(canvas,ctx,viewport.width,viewport.height); const { progress, entrance }=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      if(s.release>0&&s.release<1) s.release=clamp(s.release+dt*0.5,0,1);
      const resolve=easeOutCubic(s.release); cb.onStateChange?.(resolve); if(resolve>=1&&!s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const bg=lerpColor([10,12,16],s.primaryRgb,0.16), orbit=lerpColor([196,220,255],s.primaryRgb,0.24), node=lerpColor([248,214,166],s.accentRgb,0.34);
      ctx.fillStyle=rgba(bg,0.98*entrance); ctx.fillRect(0,0,w,h);
      ctx.beginPath(); ctx.arc(cx,cy,minDim*0.16,0,Math.PI*2); ctx.strokeStyle=rgba(orbit,0.22*entrance); ctx.lineWidth=px(0.004,minDim); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,cy,minDim*0.03,0,Math.PI*2); ctx.fillStyle=rgba(orbit,0.48*entrance); ctx.fill();
      const angle=s.spin*8 + resolve*0.5;
      const radius=minDim*(0.16 + resolve*0.42);
      const x=cx+Math.cos(angle)*radius;
      const y=cy+Math.sin(angle)*radius*(1-resolve*0.4) - resolve*minDim*0.18;
      ctx.beginPath(); ctx.arc(x,y,minDim*0.018,0,Math.PI*2); ctx.fillStyle=rgba(node,0.9*entrance); ctx.fill();
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const onDown=(e:PointerEvent)=>{ dragRef.current={active:true,lastX:e.clientX,lastY:e.clientY}; canvas.setPointerCapture(e.pointerId); };
    const onMove=(e:PointerEvent)=>{ if(!dragRef.current.active||stateRef.current.release>0) return; const dx=e.clientX-dragRef.current.lastX; const dy=e.clientY-dragRef.current.lastY; dragRef.current.lastX=e.clientX; dragRef.current.lastY=e.clientY; stateRef.current.spin=clamp(stateRef.current.spin+(Math.abs(dx)+Math.abs(dy))/viewport.width*0.4,0,1); if(stateRef.current.spin>0.5) callbacksRef.current.onHaptic('step_advance'); };
    const onUp=(e:PointerEvent)=>{ if(stateRef.current.spin>0.55) { stateRef.current.release=0.08; callbacksRef.current.onHaptic('hold_release'); } dragRef.current.active=false; canvas.releasePointerCapture(e.pointerId); };
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{ window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp); };
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
