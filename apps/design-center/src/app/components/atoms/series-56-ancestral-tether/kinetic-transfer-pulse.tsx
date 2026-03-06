import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type Point={x:number;y:number};

export default function KineticTransferPulseAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;last:Point|null}>({active:false,last:null});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),pull:0,completionFired:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(s.pull); cb.onStateChange?.(resolve);
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const dark=lerpColor([10,10,16],s.primaryRgb,0.16), past=lerpColor([214,182,126],s.accentRgb,0.24), pulse=lerpColor([238,244,255],s.primaryRgb,0.44), core=lerpColor([130,164,244],s.primaryRgb,0.18);
      ctx.fillStyle=rgba(dark,0.98*entrance); ctx.fillRect(0,0,w,h);
      ctx.strokeStyle=rgba(past,0.28*entrance); ctx.lineWidth=px(0.01,minDim); ctx.beginPath(); ctx.moveTo(w*0.14,cy); ctx.lineTo(cx,cy); ctx.stroke();
      ctx.beginPath(); ctx.arc(w*0.14,cy,minDim*0.05,0,Math.PI*2); ctx.fillStyle=rgba(past,0.82*entrance); ctx.fill();
      ctx.beginPath(); ctx.arc(cx,cy,minDim*0.06,0,Math.PI*2); ctx.fillStyle=rgba(core,(0.16+resolve*0.7)*entrance); ctx.fill();
      const pulseX=w*(0.14+0.36*resolve); ctx.beginPath(); ctx.arc(pulseX,cy,minDim*(0.025+resolve*0.04),0,Math.PI*2); ctx.fillStyle=rgba(pulse,(0.2+resolve*0.6)*entrance); ctx.fill();
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const getPoint=(e:PointerEvent)=>{const r=canvas.getBoundingClientRect(); return {x:((e.clientX-r.left)/r.width)*viewport.width,y:((e.clientY-r.top)/r.height)*viewport.height};};
    const onDown=(e:PointerEvent)=>{dragRef.current={active:true,last:getPoint(e)}; canvas.setPointerCapture(e.pointerId);};
    const onMove=(e:PointerEvent)=>{if(!dragRef.current.active||!dragRef.current.last) return; const pt=getPoint(e); const dx=pt.x-dragRef.current.last.x; if(dx>0){stateRef.current.pull=clamp(stateRef.current.pull+dx/viewport.width*2.2,0,1); if(stateRef.current.pull>=0.4&&stateRef.current.pull<0.44) callbacksRef.current.onHaptic('step_advance');} dragRef.current.last=pt;};
    const onUp=(e:PointerEvent)=>{dragRef.current={active:false,last:null}; canvas.releasePointerCapture(e.pointerId); if(stateRef.current.pull>0.1) callbacksRef.current.onHaptic('drag_snap');};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
