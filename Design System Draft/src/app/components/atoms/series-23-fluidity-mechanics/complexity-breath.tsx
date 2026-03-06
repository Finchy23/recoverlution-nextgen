/**
 * ATOM 229: THE COMPLEXITY BREATH ENGINE · S23 · Position 9
 * Breathe in: circle warps into intricate spirograph. Breathe out:
 * collapses back. Hold the complexity. Breath-coupled geometry.
 * INTERACTION: Breath-coupled (breathAmplitude drives complexity)
 * RENDER: Canvas 2D · REDUCED MOTION: Static spirograph
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const BASE_RADIUS=0.15;const COMPLEXITY_LAYERS=5;const RESPAWN_DELAY=100;

interface BreathState{entranceProgress:number;frameCount:number;primaryRgb:RGB;accentRgb:RGB;
  maxComplexity:number;peakHolds:number;completed:boolean;respawnTimer:number;}

function freshState(c:string,a:string):BreathState{
  return{entranceProgress:0,frameCount:0,primaryRgb:parseColor(c),accentRgb:parseColor(a),
    maxComplexity:0,peakHolds:0,completed:false,respawnTimer:0};}

export default function ComplexityBreathAtom({breathAmplitude,reducedMotion,color,accentColor,viewport,phase,composed,onHaptic,onStateChange}:AtomProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const cbRef=useRef({onHaptic,onStateChange});
  const propsRef=useRef({breathAmplitude,reducedMotion,phase,color,accentColor,composed});
  useEffect(()=>{cbRef.current={onHaptic,onStateChange};},[onHaptic,onStateChange]);
  useEffect(()=>{propsRef.current={breathAmplitude,reducedMotion,phase,color,accentColor,composed};},[breathAmplitude,reducedMotion,phase,color,accentColor,composed]);
  const stateRef=useRef(freshState(color,accentColor));
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color);stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
    let animId:number;

    const render=()=>{
      const s=stateRef.current;const p=propsRef.current;const cb=cbRef.current;
      const{w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height);
      s.frameCount++;const{progress,entrance}=advanceEntrance(s.entranceProgress,p.phase);
      s.entranceProgress=progress;const ms=motionScale(p.reducedMotion);

      if(!p.composed)drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance,GLOW.md);

      const breath=p.breathAmplitude;
      const complexity=Math.max(0,Math.min(1,breath));

      if(!p.reducedMotion&&!s.completed){
        if(complexity>s.maxComplexity+0.01){s.maxComplexity=complexity;}
        if(complexity>0.8){s.peakHolds++;if(s.peakHolds%30===0)cb.onHaptic('breath_peak');}
        cb.onStateChange?.(complexity);
      }

      const baseR=px(BASE_RADIUS,minDim);

      // Draw spirograph layers (more complex with breath)
      for(let layer=0;layer<COMPLEXITY_LAYERS;layer++){
        const layerComplexity=Math.max(0,complexity-(layer*0.15));
        if(layerComplexity<=0)continue;

        const layerR=baseR*(0.5+layer*0.15)*(1+layerComplexity*0.5);
        const freq=3+layer*2;const innerRatio=0.3+layer*0.1;
        const points=Math.floor(60+layerComplexity*100);

        ctx.beginPath();
        for(let i=0;i<=points;i++){
          const t=(i/points)*Math.PI*2*freq;
          const x=cx+Math.cos(t)*layerR-Math.cos(t*innerRatio)*layerR*innerRatio*layerComplexity;
          const y=cy+Math.sin(t)*layerR-Math.sin(t*innerRatio)*layerR*innerRatio*layerComplexity;
          if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        const layerColor=lerpColor(s.primaryRgb,s.accentRgb,layer/COMPLEXITY_LAYERS);
        ctx.strokeStyle=rgba(layerColor,ALPHA.content.max*(0.15+layerComplexity*0.2)*entrance*ms);
        ctx.lineWidth=px(STROKE.thin,minDim);ctx.stroke();
      }

      // Core circle (always visible)
      ctx.beginPath();ctx.arc(cx,cy,baseR*(0.3+complexity*0.2),0,Math.PI*2);
      ctx.strokeStyle=rgba(s.primaryRgb,ALPHA.content.max*0.4*entrance);
      ctx.lineWidth=px(STROKE.medium,minDim);ctx.stroke();

      // Center glow
      const gr=baseR*(0.5+complexity);const g=ctx.createRadialGradient(cx,cy,0,cx,cy,gr);
      g.addColorStop(0,rgba(s.primaryRgb,ALPHA.glow.max*0.2*entrance));g.addColorStop(1,rgba(s.primaryRgb,0));
      ctx.fillStyle=g;ctx.fillRect(cx-gr,cy-gr,gr*2,gr*2);

      // Complexity meter
      const fontSize=Math.max(8,px(FONT_SIZE.sm,minDim));ctx.font=`${fontSize}px monospace`;ctx.textAlign='center';
      ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.35*entrance);
      ctx.fillText(`${Math.round(complexity*100)}%`,cx,h-px(0.035,minDim));

      const hFont=Math.max(7,px(FONT_SIZE.xs,minDim));ctx.font=`${hFont}px monospace`;
      ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.2*entrance);
      ctx.fillText('BREATHE TO EXPAND',cx,h-px(0.06,minDim));

      if(p.reducedMotion){
        for(let i=0;i<3;i++){const r=baseR*(0.5+i*0.3);ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
          ctx.strokeStyle=rgba(s.primaryRgb,ALPHA.content.max*0.2*entrance);ctx.lineWidth=px(STROKE.thin,minDim);ctx.stroke();}
      }

      if(s.completed&&p.phase!=='resolve'){s.respawnTimer--;if(s.respawnTimer<=0){Object.assign(s,freshState(color,accentColor));s.entranceProgress=1;}}
      ctx.restore();animId=requestAnimationFrame(render);
    };
    animId=requestAnimationFrame(render);
    return()=>{cancelAnimationFrame(animId);};
  },[viewport.width,viewport.height]);

  return(<div style={{position:'absolute',inset:0,overflow:'hidden'}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none'}}/></div>);
}
