import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp = (v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
type Point = { x:number; y:number };

export default function BlindArchitectStackAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ color, accentColor, phase, composed });
  const dragRef = useRef<{ active:boolean; offsetX:number; offsetY:number }>({ active:false, offsetX:0, offsetY:0 });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    blockX: 0.22,
    blockY: 0.82,
    stacks: 0,
    completionFired: false,
  });

  useEffect(()=>{ callbacksRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic,onStateChange,onResolve]);
  useEffect(()=>{ propsRef.current = { color, accentColor, phase, composed }; }, [color,accentColor,phase,composed]);
  useEffect(()=>{ stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor); }, [color,accentColor]);

  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    let raf=0;

    const render=()=>{
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current;
      const { w,h,cx,minDim } = setupCanvas(canvas,ctx,viewport.width,viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress;
      if(!p.composed) drawAtmosphere(ctx,cx,h*0.58,w,h,minDim,s.primaryRgb,entrance);
      const resolve = easeOutCubic(clamp(s.stacks/6,0,1));
      cb.onStateChange?.(resolve);
      if(resolve>=1 && !s.completionFired){ s.completionFired=true; cb.onHaptic('completion'); cb.onResolve?.(); }

      const bg=lerpColor([10,12,16],s.primaryRgb,0.16), block=lerpColor([192,220,255],s.primaryRgb,0.26), monument=lerpColor([248,220,170],s.accentRgb,0.3);
      ctx.fillStyle = rgba(bg,0.98*entrance); ctx.fillRect(0,0,w,h);

      const towerX = cx - minDim*0.06;
      for(let i=0;i<s.stacks;i+=1){
        const y = h*0.84 - i*minDim*0.07;
        roundedRect(ctx,towerX,y,minDim*0.12,minDim*0.05,minDim*0.01);
        ctx.fillStyle = rgba(monument,(0.16+resolve*0.5)*entrance);
        ctx.fill();
      }

      roundedRect(ctx,w*s.blockX-minDim*0.06,h*s.blockY-minDim*0.025,minDim*0.12,minDim*0.05,minDim*0.01);
      ctx.fillStyle = rgba(block,0.9*entrance);
      ctx.fill();

      if(resolve>0.2){
        ctx.strokeStyle = rgba(monument,resolve*0.4*entrance);
        ctx.lineWidth = px(0.004,minDim);
        ctx.beginPath();
        ctx.moveTo(cx, h*0.18);
        ctx.lineTo(cx, h*0.84 - s.stacks*minDim*0.07);
        ctx.stroke();
      }

      ctx.restore(); raf=window.requestAnimationFrame(render);
    };

    const point=(e:PointerEvent):Point=>{ const r=canvas.getBoundingClientRect(); return { x:((e.clientX-r.left)/r.width)*viewport.width, y:((e.clientY-r.top)/r.height)*viewport.height }; };
    const onDown=(e:PointerEvent)=>{ const pt=point(e); dragRef.current={active:true,offsetX:pt.x-viewport.width*stateRef.current.blockX,offsetY:pt.y-viewport.height*stateRef.current.blockY}; canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('drag_snap'); };
    const onMove=(e:PointerEvent)=>{ if(!dragRef.current.active) return; const pt=point(e); stateRef.current.blockX=clamp((pt.x-dragRef.current.offsetX)/viewport.width,0.18,0.82); stateRef.current.blockY=clamp((pt.y-dragRef.current.offsetY)/viewport.height,0.12,0.84); };
    const onUp=(e:PointerEvent)=>{ dragRef.current.active=false; if(Math.abs(stateRef.current.blockX-0.5)<0.09 && stateRef.current.blockY>0.66){ stateRef.current.stacks=Math.min(6,stateRef.current.stacks+1); stateRef.current.blockX=0.22; stateRef.current.blockY=0.82; callbacksRef.current.onHaptic('step_advance'); } canvas.releasePointerCapture(e.pointerId); };

    raf=window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{ window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp); };
  },[viewport.width,viewport.height]);

  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
