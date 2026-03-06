/**
 * ATOM 225: THE WU WEI ENGINE · S23 · Position 5
 * Effort is interference. Let go to let the system work.
 * Touching = grinding resistance. Lifting = effortless speed.
 * INTERACTION: Observable (release to flow) → auto-navigation
 * RENDER: Canvas 2D · REDUCED MOTION: Static flowing path
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const TARGET_X=0.85;const TARGET_Y=0.2;const FREE_SPEED=0.004;const HELD_SPEED=0.0003;
const RESPAWN_DELAY=100;

interface WuState{entranceProgress:number;frameCount:number;primaryRgb:RGB;accentRgb:RGB;
  nodeX:number;nodeY:number;holding:boolean;progress2:number;
  completed:boolean;respawnTimer:number;}

function freshState(c:string,a:string):WuState{
  return{entranceProgress:0,frameCount:0,primaryRgb:parseColor(c),accentRgb:parseColor(a),
    nodeX:0.15,nodeY:0.8,holding:false,progress2:0,completed:false,respawnTimer:0};}

export default function WuWeiAtom({breathAmplitude,reducedMotion,color,accentColor,viewport,phase,composed,onHaptic,onStateChange}:AtomProps){
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

      if(!p.reducedMotion&&!s.completed){
        const speed=s.holding?HELD_SPEED:FREE_SPEED;
        const dx=TARGET_X-s.nodeX;const dy=TARGET_Y-s.nodeY;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist>0.01){s.nodeX+=dx/dist*speed;s.nodeY+=dy/dist*speed;}
        s.progress2=1-dist/Math.sqrt((TARGET_X-0.15)**2+(TARGET_Y-0.8)**2);
        cb.onStateChange?.(Math.max(0,s.progress2));
        if(s.holding&&s.frameCount%10===0)cb.onHaptic('error_boundary');
        if(dist<0.03){s.completed=true;cb.onHaptic('completion');cb.onStateChange?.(1);s.respawnTimer=RESPAWN_DELAY;}
      }

      const nodeR=px(0.02,minDim);const nx=s.nodeX*w;const ny=s.nodeY*h;

      // Flow field lines
      for(let i=0;i<8;i++){
        const fy=h*(0.1+i*0.1);const fx0=w*0.1;
        ctx.beginPath();ctx.moveTo(fx0,fy);
        for(let x=fx0;x<w*0.9;x+=5){
          const angle=Math.atan2(TARGET_Y*h-fy,TARGET_X*w-x);
          ctx.lineTo(x,fy+Math.sin(angle+x*0.005)*px(0.01,minDim));
        }
        ctx.strokeStyle=rgba(s.primaryRgb,ALPHA.atmosphere.min*0.15*entrance*ms);
        ctx.lineWidth=px(STROKE.hairline,minDim);ctx.stroke();
      }

      // Target
      ctx.beginPath();ctx.arc(TARGET_X*w,TARGET_Y*h,px(0.015,minDim),0,Math.PI*2);
      ctx.strokeStyle=rgba(s.primaryRgb,ALPHA.content.max*0.3*entrance);
      ctx.lineWidth=px(STROKE.thin,minDim);ctx.stroke();

      // Friction marks when holding
      if(s.holding){
        for(let i=0;i<3;i++){
          const fx=nx+(Math.random()-0.5)*px(0.02,minDim);
          const fy2=ny+(Math.random()-0.5)*px(0.02,minDim);
          ctx.beginPath();ctx.arc(fx,fy2,px(0.002,minDim),0,Math.PI*2);
          ctx.fillStyle=rgba(s.accentRgb,ALPHA.atmosphere.min*0.4*entrance*ms);ctx.fill();
        }
      }

      // Speed trail
      if(!s.holding){
        const trailLen=px(0.05,minDim);const angle=Math.atan2(TARGET_Y-s.nodeY,TARGET_X-s.nodeX);
        ctx.beginPath();ctx.moveTo(nx,ny);
        ctx.lineTo(nx-Math.cos(angle)*trailLen,ny-Math.sin(angle)*trailLen);
        ctx.strokeStyle=rgba(s.primaryRgb,ALPHA.atmosphere.max*0.3*entrance*ms);
        ctx.lineWidth=px(STROKE.thin,minDim);ctx.stroke();
      }

      // Node
      const gr=px(0.06,minDim);const g=ctx.createRadialGradient(nx,ny,0,nx,ny,gr);
      g.addColorStop(0,rgba(s.primaryRgb,ALPHA.glow.max*0.3*entrance));g.addColorStop(1,rgba(s.primaryRgb,0));
      ctx.fillStyle=g;ctx.fillRect(nx-gr,ny-gr,gr*2,gr*2);
      ctx.beginPath();ctx.arc(nx,ny,nodeR,0,Math.PI*2);
      ctx.fillStyle=rgba(s.holding?s.accentRgb:s.primaryRgb,ALPHA.content.max*entrance);ctx.fill();

      // Speed indicator
      const fontSize=Math.max(8,px(FONT_SIZE.sm,minDim));ctx.font=`${fontSize}px monospace`;ctx.textAlign='center';
      const speedLabel=s.holding?'GRINDING':'EFFORTLESS';
      ctx.fillStyle=rgba(s.holding?s.accentRgb:s.primaryRgb,ALPHA.text.max*0.35*entrance);
      ctx.fillText(speedLabel,cx,h-px(0.035,minDim));

      if(s.completed&&p.phase!=='resolve'){s.respawnTimer--;if(s.respawnTimer<=0){Object.assign(s,freshState(color,accentColor));s.entranceProgress=1;}}
      ctx.restore();animId=requestAnimationFrame(render);
    };
    animId=requestAnimationFrame(render);

    const onDown=(e:PointerEvent)=>{stateRef.current.holding=true;canvas.setPointerCapture(e.pointerId);};
    const onUp=(e:PointerEvent)=>{stateRef.current.holding=false;cbRef.current.onHaptic('hold_release');canvas.releasePointerCapture(e.pointerId);};
    canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);
    return()=>{cancelAnimationFrame(animId);canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);

  return(<div style={{position:'absolute',inset:0,overflow:'hidden'}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none',cursor:'default'}}/></div>);
}
