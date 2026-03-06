import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type P={x:number;y:number};

export default function StrataCompressAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;last:P|null}>({active:false,last:null});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),compress:0,completionFired:false,steps:[false,false]});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(s.compress); cb.onStateChange?.(resolve);
      if(resolve>=0.35 && !s.steps[0]){s.steps[0]=true; cb.onHaptic('step_advance');}
      if(resolve>=0.7 && !s.steps[1]){s.steps[1]=true; cb.onHaptic('step_advance');}
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const dark=lerpColor([24,24,28],s.primaryRgb,0.14), warm=lerpColor([214,170,110],s.accentRgb,0.22), cool=lerpColor([146,98,88],s.primaryRgb,0.18);
      ctx.fillStyle=rgba(dark,0.98*entrance); ctx.fillRect(0,0,w,h);
      const slabH=minDim*(0.42-resolve*0.18); roundedRect(ctx,w*0.22,h*0.26,w*0.56,slabH,minDim*0.03); ctx.fillStyle=rgba(lerpColor(dark,warm,0.25),0.95*entrance); ctx.fill();
      for(let i=0;i<6;i+=1){ const y=h*0.3+i*(slabH/6); ctx.strokeStyle=rgba(i%2?warm:cool,(0.2+resolve*0.4)*entrance); ctx.lineWidth=px(0.012,minDim); ctx.beginPath(); ctx.moveTo(w*0.24,y); ctx.lineTo(w*0.76,y+Math.sin(i+resolve)*minDim*0.01*(1-resolve)); ctx.stroke(); }
      ctx.strokeStyle=rgba(lerpColor([255,255,255],warm,0.35),(0.18+resolve*0.6)*entrance); ctx.lineWidth=px(0.008,minDim); ctx.strokeRect(w*0.22,h*0.26,w*0.56,slabH);
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const getP=(e:PointerEvent)=>{const r=canvas.getBoundingClientRect(); return {x:((e.clientX-r.left)/r.width)*viewport.width,y:((e.clientY-r.top)/r.height)*viewport.height};};
    const onDown=(e:PointerEvent)=>{dragRef.current={active:true,last:getP(e)}; canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('hold_start');};
    const onMove=(e:PointerEvent)=>{if(!dragRef.current.active||!dragRef.current.last) return; const pt=getP(e); const dx=Math.abs(pt.x-dragRef.current.last.x); stateRef.current.compress=clamp(stateRef.current.compress+dx/viewport.width*0.9,0,1); dragRef.current.last=pt;};
    const onUp=(e:PointerEvent)=>{dragRef.current={active:false,last:null}; canvas.releasePointerCapture(e.pointerId);};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
