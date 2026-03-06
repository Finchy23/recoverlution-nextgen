/**
 * ATOM 222: THE WATER MODE ENGINE · S23 · Position 2
 * Be water — flow around obstacles. Hold to become fluid.
 * INTERACTION: Hold → become fluid → flow around obstacles
 * RENDER: Canvas 2D · REDUCED MOTION: Static flowing path
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const OBSTACLES = [{x:0.35,y:0.35,r:0.06},{x:0.55,y:0.5,r:0.07},{x:0.4,y:0.65,r:0.05},{x:0.65,y:0.35,r:0.05}];
const STREAM_SPEED = 0.003; const FLUIDITY_RATE = 0.005; const RESPAWN_DELAY = 100;

interface WaterState { entranceProgress:number; frameCount:number; primaryRgb:RGB; accentRgb:RGB;
  holding:boolean; fluidity:number; streamY:number; particles:{x:number;y:number;vx:number;vy:number}[];
  completed:boolean; respawnTimer:number; }

function freshState(c:string,a:string):WaterState {
  const pts = Array.from({length:30},(_,i)=>({x:0.1,y:0.1+i*0.027,vx:STREAM_SPEED,vy:0}));
  return { entranceProgress:0,frameCount:0,primaryRgb:parseColor(c),accentRgb:parseColor(a),
    holding:false,fluidity:0,streamY:0,particles:pts,completed:false,respawnTimer:0 }; }

export default function WaterModeAtom({breathAmplitude,reducedMotion,color,accentColor,viewport,phase,composed,onHaptic,onStateChange}:AtomProps) {
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
        if(s.holding){s.fluidity=Math.min(1,s.fluidity+FLUIDITY_RATE);}
        else{s.fluidity=Math.max(0,s.fluidity-FLUIDITY_RATE*0.5);}

        for(const pt of s.particles){
          pt.x+=pt.vx*ms;pt.y+=pt.vy*ms;
          // Obstacle avoidance when fluid
          for(const ob of OBSTACLES){
            const dx=pt.x-ob.x;const dy=pt.y-ob.y;
            const dist=Math.sqrt(dx*dx+dy*dy);
            if(dist<ob.r+0.02){
              if(s.fluidity>0.3){
                // Flow around
                const nx=dy/dist;const ny=-dx/dist;
                pt.vx+=nx*0.0005*s.fluidity;pt.vy+=ny*0.0005*s.fluidity;
              }else{
                // Collision
                pt.vx*=-0.3;pt.vy*=-0.3;
                if(s.frameCount%20===0)cb.onHaptic('error_boundary');
              }
            }
          }
          pt.vx+=(STREAM_SPEED-pt.vx)*0.01;
          pt.vy*=0.95;
          // Reset at right edge
          if(pt.x>1){pt.x=0.05;s.streamY++;
            if(s.fluidity>0.5){cb.onStateChange?.(Math.min(1,s.streamY/30));}
            if(s.streamY>=30&&s.fluidity>0.5){s.completed=true;cb.onHaptic('completion');cb.onStateChange?.(1);s.respawnTimer=RESPAWN_DELAY;}
          }
        }
      }

      // Obstacles
      for(const ob of OBSTACLES){
        const ox=ob.x*w;const oy=ob.y*h;const or2=px(ob.r,minDim);
        ctx.beginPath();ctx.arc(ox,oy,or2,0,Math.PI*2);
        ctx.fillStyle=rgba(s.accentRgb,ALPHA.content.max*0.15*entrance);ctx.fill();
        ctx.strokeStyle=rgba(s.accentRgb,ALPHA.content.max*0.3*entrance);
        ctx.lineWidth=px(STROKE.medium,minDim);ctx.stroke();
      }

      // Stream particles
      const ptColor=s.fluidity>0.3?s.primaryRgb:s.accentRgb;
      for(const pt of s.particles){
        const ptx=pt.x*w;const pty=pt.y*h;const ptR=px(0.004+s.fluidity*0.003,minDim);
        ctx.beginPath();ctx.arc(ptx,pty,ptR,0,Math.PI*2);
        ctx.fillStyle=rgba(ptColor,ALPHA.content.max*(0.3+s.fluidity*0.3)*entrance*ms);ctx.fill();
        // Trail
        if(s.fluidity>0.3){
          ctx.beginPath();ctx.moveTo(ptx,pty);ctx.lineTo(ptx-pt.vx*w*5,pty-pt.vy*h*5);
          ctx.strokeStyle=rgba(s.primaryRgb,ALPHA.atmosphere.min*0.3*s.fluidity*entrance*ms);
          ctx.lineWidth=px(STROKE.hairline,minDim);ctx.stroke();
        }
      }

      // HUD
      const fontSize=Math.max(8,px(FONT_SIZE.sm,minDim));
      ctx.font=`${fontSize}px monospace`;ctx.textAlign='center';
      if(s.completed){ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.5*entrance);ctx.fillText('FLOWING',cx,h-px(0.035,minDim));}
      else if(s.fluidity>0.3){ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.3*entrance);ctx.fillText('BE WATER',cx,h-px(0.035,minDim));}
      else{ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.2*entrance);ctx.fillText('HOLD TO BECOME FLUID',cx,h-px(0.035,minDim));}

      if(s.completed&&p.phase!=='resolve'){s.respawnTimer--;if(s.respawnTimer<=0){Object.assign(s,freshState(color,accentColor));s.entranceProgress=1;}}
      ctx.restore();animId=requestAnimationFrame(render);
    };
    animId=requestAnimationFrame(render);

    const onDown=(e:PointerEvent)=>{stateRef.current.holding=true;cbRef.current.onHaptic('hold_start');canvas.setPointerCapture(e.pointerId);};
    const onUp=(e:PointerEvent)=>{stateRef.current.holding=false;canvas.releasePointerCapture(e.pointerId);};
    canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);
    return()=>{cancelAnimationFrame(animId);canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);

  return(<div style={{position:'absolute',inset:0,overflow:'hidden'}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none',cursor:'pointer'}}/></div>);
}
