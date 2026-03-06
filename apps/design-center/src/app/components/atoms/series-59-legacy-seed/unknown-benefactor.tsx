import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export default function UnknownBenefactorAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const callbacksRef=useRef({onHaptic,onStateChange,onResolve});
  const propsRef=useRef({color,accentColor,phase,composed});
  const dragRef=useRef<{active:boolean;mode:'forge'|'erase'|null}>({active:false,mode:null});
  const stateRef=useRef({entranceProgress:0,primaryRgb:parseColor(color),accentRgb:parseColor(accentColor),forge:0,erase:0,completionFired:false});

  useEffect(()=>{callbacksRef.current={onHaptic,onStateChange,onResolve};},[onHaptic,onStateChange,onResolve]);
  useEffect(()=>{propsRef.current={color,accentColor,phase,composed};},[color,accentColor,phase,composed]);
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color); stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return; let raf=0; let last=performance.now();
    const render=(now:number)=>{
      const dt=Math.min(0.05,(now-last)/1000); last=now;
      const s=stateRef.current,p=propsRef.current,cb=callbacksRef.current; const { w,h,cx,cy,minDim }=setupCanvas(canvas,ctx,viewport.width,viewport.height); const { progress, entrance }=advanceEntrance(s.entranceProgress,p.phase); s.entranceProgress=progress; if(!p.composed) drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance);
      const resolve=easeOutCubic(Math.min(s.forge,s.erase)); cb.onStateChange?.(resolve); if(resolve>=1&&!s.completionFired){s.completionFired=true; cb.onHaptic('seal_stamp'); cb.onResolve?.();}
      const bg=lerpColor([10,12,16],s.primaryRgb,0.16), branded=lerpColor([248,214,166],s.accentRgb,0.34), pure=lerpColor([246,248,255],s.primaryRgb,0.44);
      ctx.fillStyle=rgba(bg,0.98*entrance); ctx.fillRect(0,0,w,h);
      ctx.beginPath(); ctx.arc(cx,cy,minDim*(0.05+s.forge*0.08),0,Math.PI*2); ctx.fillStyle=rgba(lerpColor(branded,pure,s.erase), (0.28+s.forge*0.58)*entrance); ctx.fill();
      if(s.erase<1){ ctx.fillStyle=rgba([22,24,32],(1-s.erase)*0.9*entrance); ctx.font=`${px(0.032,minDim)}px Inter, sans-serif`; ctx.textAlign='center'; ctx.fillText('ID',cx,cy+px(0.01,minDim)); }
      ctx.restore(); raf=window.requestAnimationFrame(render);
    };
    const onDown=(e:PointerEvent)=>{ dragRef.current={active:true,mode:stateRef.current.forge<1?'forge':'erase'}; canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('drag_snap'); };
    const onMove=()=>{ if(!dragRef.current.active) return; if(dragRef.current.mode==='forge') stateRef.current.forge=clamp(stateRef.current.forge+0.04,0,1); else stateRef.current.erase=clamp(stateRef.current.erase+0.05,0,1); };
    const onUp=(e:PointerEvent)=>{ dragRef.current.active=false; dragRef.current.mode=null; canvas.releasePointerCapture(e.pointerId); };
    raf=window.requestAnimationFrame(render); canvas.addEventListener('pointerdown',onDown); canvas.addEventListener('pointermove',onMove); canvas.addEventListener('pointerup',onUp); canvas.addEventListener('pointercancel',onUp);
    return ()=>{ window.cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown',onDown); canvas.removeEventListener('pointermove',onMove); canvas.removeEventListener('pointerup',onUp); canvas.removeEventListener('pointercancel',onUp); };
  },[viewport.width,viewport.height]);
  return <div style={{position:'absolute',inset:0}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>;
}
