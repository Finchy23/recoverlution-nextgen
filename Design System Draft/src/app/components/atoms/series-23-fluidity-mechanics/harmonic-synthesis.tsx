/**
 * ATOM 224: THE HARMONIC SYNTHESIS ENGINE · S23 · Position 4
 * Two opposing forces orbit and melt into a superior third.
 * INTERACTION: Drag (bring orbits closer) → merge → synthesis
 * RENDER: Canvas 2D · REDUCED MOTION: Static merged sphere
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const ORBIT_RADIUS=0.2;const MERGE_DIST=0.06;const ORBIT_SPEED=0.02;const MERGE_RATE=0.006;const RESPAWN_DELAY=100;

interface HarmState{entranceProgress:number;frameCount:number;primaryRgb:RGB;accentRgb:RGB;
  orbitAngle:number;orbitRadius:number;mergeProgress:number;dragging:boolean;
  completed:boolean;respawnTimer:number;}

function freshState(c:string,a:string):HarmState{
  return{entranceProgress:0,frameCount:0,primaryRgb:parseColor(c),accentRgb:parseColor(a),
    orbitAngle:0,orbitRadius:ORBIT_RADIUS,mergeProgress:0,dragging:false,
    completed:false,respawnTimer:0};}

export default function HarmonicSynthesisAtom({breathAmplitude,reducedMotion,color,accentColor,viewport,phase,composed,onHaptic,onStateChange}:AtomProps){
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
        s.orbitAngle+=ORBIT_SPEED*ms;
        if(s.dragging){s.orbitRadius=Math.max(MERGE_DIST,s.orbitRadius-0.001);}
        if(s.orbitRadius<=MERGE_DIST+0.01){
          s.mergeProgress=Math.min(1,s.mergeProgress+MERGE_RATE);
          cb.onStateChange?.(s.mergeProgress);
          if(s.mergeProgress>=1){s.completed=true;cb.onHaptic('completion');cb.onStateChange?.(1);s.respawnTimer=RESPAWN_DELAY;}
        }
        if(s.frameCount%15===0&&s.orbitRadius<ORBIT_RADIUS*0.7)cb.onHaptic('drag_snap');
      }

      const nodeR=px(0.025,minDim);const orbR=px(s.orbitRadius,minDim);
      const ax=cx+Math.cos(s.orbitAngle)*orbR*(1-s.mergeProgress);
      const ay=cy+Math.sin(s.orbitAngle)*orbR*(1-s.mergeProgress);
      const bx=cx-Math.cos(s.orbitAngle)*orbR*(1-s.mergeProgress);
      const by=cy-Math.sin(s.orbitAngle)*orbR*(1-s.mergeProgress);

      // Orbit trail
      if(s.mergeProgress<0.8){
        ctx.beginPath();ctx.arc(cx,cy,orbR*(1-s.mergeProgress),0,Math.PI*2);
        ctx.strokeStyle=rgba(s.primaryRgb,ALPHA.atmosphere.min*0.2*(1-s.mergeProgress)*entrance);
        ctx.lineWidth=px(STROKE.hairline,minDim);ctx.stroke();
      }

      // Node A (thesis)
      if(s.mergeProgress<0.9){
        const gr=px(0.06,minDim);const g=ctx.createRadialGradient(ax,ay,0,ax,ay,gr);
        g.addColorStop(0,rgba(s.accentRgb,ALPHA.glow.max*0.2*(1-s.mergeProgress)*entrance));g.addColorStop(1,rgba(s.accentRgb,0));
        ctx.fillStyle=g;ctx.fillRect(ax-gr,ay-gr,gr*2,gr*2);
        ctx.beginPath();ctx.arc(ax,ay,nodeR*(1-s.mergeProgress*0.5),0,Math.PI*2);
        ctx.fillStyle=rgba(s.accentRgb,ALPHA.content.max*(1-s.mergeProgress)*entrance);ctx.fill();
      }

      // Node B (antithesis)
      if(s.mergeProgress<0.9){
        const gr=px(0.06,minDim);const g=ctx.createRadialGradient(bx,by,0,bx,by,gr);
        g.addColorStop(0,rgba(s.primaryRgb,ALPHA.glow.max*0.2*(1-s.mergeProgress)*entrance));g.addColorStop(1,rgba(s.primaryRgb,0));
        ctx.fillStyle=g;ctx.fillRect(bx-gr,by-gr,gr*2,gr*2);
        ctx.beginPath();ctx.arc(bx,by,nodeR*(1-s.mergeProgress*0.5),0,Math.PI*2);
        ctx.fillStyle=rgba(s.primaryRgb,ALPHA.content.max*(1-s.mergeProgress)*entrance);ctx.fill();
      }

      // Synthesis sphere
      if(s.mergeProgress>0.1){
        const synthR=nodeR*(0.5+s.mergeProgress*1.5);const synthColor=lerpColor(s.primaryRgb,s.accentRgb,0.5);
        const gr=synthR*2.5;const g=ctx.createRadialGradient(cx,cy,0,cx,cy,gr);
        g.addColorStop(0,rgba(synthColor,ALPHA.glow.max*0.3*s.mergeProgress*entrance));g.addColorStop(1,rgba(synthColor,0));
        ctx.fillStyle=g;ctx.fillRect(cx-gr,cy-gr,gr*2,gr*2);
        ctx.beginPath();ctx.arc(cx,cy,synthR,0,Math.PI*2);
        ctx.fillStyle=rgba(synthColor,ALPHA.content.max*s.mergeProgress*entrance);ctx.fill();
      }

      // HUD
      const fontSize=Math.max(8,px(FONT_SIZE.sm,minDim));ctx.font=`${fontSize}px monospace`;ctx.textAlign='center';
      if(s.completed){ctx.fillStyle=rgba(lerpColor(s.primaryRgb,s.accentRgb,0.5),ALPHA.text.max*0.5*entrance);ctx.fillText('SYNTHESIS',cx,h-px(0.035,minDim));}
      else{ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.2*entrance);ctx.fillText('HOLD TO CONVERGE',cx,h-px(0.035,minDim));}

      if(s.completed&&p.phase!=='resolve'){s.respawnTimer--;if(s.respawnTimer<=0){Object.assign(s,freshState(color,accentColor));s.entranceProgress=1;}}
      ctx.restore();animId=requestAnimationFrame(render);
    };
    animId=requestAnimationFrame(render);

    const onDown=(e:PointerEvent)=>{stateRef.current.dragging=true;canvas.setPointerCapture(e.pointerId);};
    const onUp=(e:PointerEvent)=>{stateRef.current.dragging=false;canvas.releasePointerCapture(e.pointerId);};
    canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);
    return()=>{cancelAnimationFrame(animId);canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);

  return(<div style={{position:'absolute',inset:0,overflow:'hidden'}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none',cursor:'pointer'}}/></div>);
}
