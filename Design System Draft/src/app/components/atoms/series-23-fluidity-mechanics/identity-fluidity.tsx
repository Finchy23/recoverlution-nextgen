/**
 * ATOM 223: THE IDENTITY FLUIDITY ENGINE · S23 · Position 3
 * You are water, not the cup. When cup breaks, take new shape.
 * INTERACTION: Drag (water to new container) → reshape
 * RENDER: Canvas 2D · REDUCED MOTION: Static filled container
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const CONTAINERS = [{x:0.2,y:0.5,w:0.12,h:0.2,shape:'rect'},{x:0.5,y:0.5,w:0.1,h:0.15,shape:'circle'},{x:0.8,y:0.5,w:0.08,h:0.25,shape:'tri'}] as const;
const FILL_RATE = 0.008; const RESPAWN_DELAY = 100;

interface FluidState { entranceProgress:number; frameCount:number; primaryRgb:RGB; accentRgb:RGB;
  currentContainer:number; fill:number[]; breaking:boolean; breakProgress:number; fillPhase:number;
  completed:boolean; respawnTimer:number; }

function freshState(c:string,a:string):FluidState {
  return { entranceProgress:0,frameCount:0,primaryRgb:parseColor(c),accentRgb:parseColor(a),
    currentContainer:0,fill:[1,0,0],breaking:false,breakProgress:0,fillPhase:0,
    completed:false,respawnTimer:0 }; }

export default function IdentityFluidityAtom({breathAmplitude,reducedMotion,color,accentColor,viewport,phase,composed,onHaptic,onStateChange}:AtomProps) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const cbRef=useRef({onHaptic,onStateChange});
  const propsRef=useRef({breathAmplitude,reducedMotion,phase,color,accentColor,composed});
  useEffect(()=>{cbRef.current={onHaptic,onStateChange};},[onHaptic,onStateChange]);
  useEffect(()=>{propsRef.current={breathAmplitude,reducedMotion,phase,color,accentColor,composed};},[breathAmplitude,reducedMotion,phase,color,accentColor,composed]);
  const stateRef=useRef(freshState(color,accentColor));
  useEffect(()=>{stateRef.current.primaryRgb=parseColor(color);stateRef.current.accentRgb=parseColor(accentColor);},[color,accentColor]);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    let animId:number;

    const render=()=>{
      const s=stateRef.current;const p=propsRef.current;const cb=cbRef.current;
      const{w,h,cx,cy,minDim}=setupCanvas(canvas,ctx,viewport.width,viewport.height);
      s.frameCount++;const{progress,entrance}=advanceEntrance(s.entranceProgress,p.phase);
      s.entranceProgress=progress;const ms=motionScale(p.reducedMotion);

      if(!p.composed)drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance,GLOW.md);

      if(!p.reducedMotion&&!s.completed){
        if(s.breaking){
          s.breakProgress=Math.min(1,s.breakProgress+0.02);
          s.fill[s.currentContainer]=Math.max(0,1-s.breakProgress);
          if(s.breakProgress>=1){
            s.breaking=false;s.currentContainer=Math.min(CONTAINERS.length-1,s.currentContainer+1);
            s.breakProgress=0;s.fillPhase=1;cb.onHaptic('drag_snap');
          }
        }
        if(s.fillPhase>0){
          s.fill[s.currentContainer]=Math.min(1,s.fill[s.currentContainer]+FILL_RATE);
          if(s.fill[s.currentContainer]>=1){
            s.fillPhase=0;cb.onHaptic('step_advance');
            cb.onStateChange?.((s.currentContainer+1)/CONTAINERS.length);
            if(s.currentContainer>=CONTAINERS.length-1){s.completed=true;cb.onHaptic('completion');cb.onStateChange?.(1);s.respawnTimer=RESPAWN_DELAY;}
          }
        }
      }

      // Draw containers
      for(let i=0;i<CONTAINERS.length;i++){
        const c2=CONTAINERS[i];const cx2=c2.x*w;const cy2=c2.y*h;
        const cw=px(c2.w,minDim);const ch=px(c2.h,minDim);
        const isCurrent=i===s.currentContainer;
        const alpha=ALPHA.content.max*(isCurrent?0.4:0.2)*entrance;

        // Container shape
        ctx.beginPath();
        if(c2.shape==='rect'){ctx.rect(cx2-cw/2,cy2-ch/2,cw,ch);}
        else if(c2.shape==='circle'){ctx.arc(cx2,cy2,cw/2,0,Math.PI*2);}
        else{ctx.moveTo(cx2,cy2-ch/2);ctx.lineTo(cx2+cw/2,cy2+ch/2);ctx.lineTo(cx2-cw/2,cy2+ch/2);ctx.closePath();}
        ctx.strokeStyle=rgba(i<=s.currentContainer?s.primaryRgb:s.accentRgb,alpha);
        ctx.lineWidth=px(STROKE.medium,minDim);ctx.stroke();

        // Fill level
        if(s.fill[i]>0){
          const fillH=ch*s.fill[i];
          ctx.save();ctx.beginPath();
          if(c2.shape==='rect'){ctx.rect(cx2-cw/2,cy2+ch/2-fillH,cw,fillH);}
          else if(c2.shape==='circle'){ctx.rect(cx2-cw/2,cy2+cw/2-fillH*1.0,cw,fillH*1.0);}
          else{ctx.rect(cx2-cw/2,cy2+ch/2-fillH,cw,fillH);}
          ctx.clip();
          // Redraw shape filled
          ctx.beginPath();
          if(c2.shape==='rect'){ctx.rect(cx2-cw/2,cy2-ch/2,cw,ch);}
          else if(c2.shape==='circle'){ctx.arc(cx2,cy2,cw/2,0,Math.PI*2);}
          else{ctx.moveTo(cx2,cy2-ch/2);ctx.lineTo(cx2+cw/2,cy2+ch/2);ctx.lineTo(cx2-cw/2,cy2+ch/2);ctx.closePath();}
          ctx.fillStyle=rgba(s.primaryRgb,ALPHA.content.max*0.25*s.fill[i]*entrance);ctx.fill();
          ctx.restore();
        }

        // Crack lines on breaking container
        if(s.breaking&&i===s.currentContainer){
          for(let j=0;j<4;j++){
            const ca=Math.random()*Math.PI*2;const cl=cw*s.breakProgress;
            ctx.beginPath();ctx.moveTo(cx2,cy2);
            ctx.lineTo(cx2+Math.cos(ca)*cl,cy2+Math.sin(ca)*cl);
            ctx.strokeStyle=rgba(s.accentRgb,s.breakProgress*ALPHA.content.max*0.3*entrance);
            ctx.lineWidth=px(STROKE.hairline,minDim);ctx.stroke();
          }
        }
      }

      // HUD
      const fontSize=Math.max(8,px(FONT_SIZE.sm,minDim));ctx.font=`${fontSize}px monospace`;ctx.textAlign='center';
      if(s.completed){ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.5*entrance);ctx.fillText('RESHAPED',cx,h-px(0.035,minDim));}
      else if(!s.breaking&&s.fillPhase===0){ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.2*entrance);ctx.fillText('TAP TO BREAK CUP',cx,h-px(0.035,minDim));}

      if(s.completed&&p.phase!=='resolve'){s.respawnTimer--;if(s.respawnTimer<=0){Object.assign(s,freshState(color,accentColor));s.entranceProgress=1;}}
      ctx.restore();animId=requestAnimationFrame(render);
    };
    animId=requestAnimationFrame(render);

    const onDown=()=>{const s=stateRef.current;if(s.completed||s.breaking||s.fillPhase>0)return;
      if(s.currentContainer<CONTAINERS.length-1){s.breaking=true;cbRef.current.onHaptic('tap');}};
    canvas.addEventListener('pointerdown',onDown);
    return()=>{cancelAnimationFrame(animId);canvas.removeEventListener('pointerdown',onDown);};
  },[viewport.width,viewport.height]);

  return(<div style={{position:'absolute',inset:0,overflow:'hidden'}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none',cursor:'pointer'}}/></div>);
}
