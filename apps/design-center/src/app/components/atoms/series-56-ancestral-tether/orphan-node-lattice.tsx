import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type P={x:number;y:number};

export default function OrphanNodeLatticeAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;last:P|null}>({active:false,last:null});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),links:[] as {a:P;b:P}[],completionFired:false});
  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0;
    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const {w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height); const {progress,entrance}=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(clamp(s.links.length/12,0,1)); cb.onStateChange?.(resolve);
      if(resolve>=1 && !s.completionFired){s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.();}
      const dark=lerpColor([12,12,18],s.primaryRgb,0.16), link=lerpColor([180,210,242],s.primaryRgb,0.3), node=lerpColor([216,190,136],s.accentRgb,0.28);
      ctx.fillStyle=rgba(dark,0.98*entrance); ctx.fillRect(0,0,w,h);
      ctx.strokeStyle=rgba(link,(0.12+resolve*0.4)*entrance); ctx.lineWidth=px(0.006,minDim);
      for(const l of s.links){ ctx.beginPath(); ctx.moveTo(l.a.x,l.a.y); ctx.lineTo(l.b.x,l.b.y); ctx.stroke(); }
      const pts=[{x:cx,y:cy}, ...s.links.map(l=>l.b)];
      for(const pt of pts){ ctx.beginPath(); ctx.arc(pt.x,pt.y,minDim*0.018,0,Math.PI*2); ctx.fillStyle=rgba(node,0.88*entrance); ctx.fill(); }
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const getP=(e:PointerEvent)=>{const r=canvas.getBoundingClientRect(); return {x:((e.clientX-r.left)/r.width)*viewport.width,y:((e.clientY-r.top)/r.height)*viewport.height};};
    const onDown=(e:PointerEvent)=>{dragRef.current={active:true,last:getP(e)}; canvas.setPointerCapture(e.pointerId);};
    const onMove=(e:PointerEvent)=>{if(!dragRef.current.active||!dragRef.current.last) return; const pt=getP(e); const dx=pt.x-dragRef.current.last.x; if(Math.abs(dx)>viewport.width*0.04){ stateRef.current.links.push({a:{x:viewport.width*0.5,y:viewport.height*0.5},b:{x:pt.x,y:pt.y}}); if(stateRef.current.links.length>12) stateRef.current.links.shift(); callbacksRef.current.onHaptic('drag_snap'); if(stateRef.current.links.length===4||stateRef.current.links.length===8) callbacksRef.current.onHaptic('step_advance'); dragRef.current.last=pt; }};
    const onUp=(e:PointerEvent)=>{dragRef.current={active:false,last:null}; canvas.releasePointerCapture(e.pointerId);};
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
