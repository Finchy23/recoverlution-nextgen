/**
 * ATOM 230: THE SHIFTER SEAL · S23 · Position 10 (Capstone)
 * I contain multitudes. A single drop loses surface tension and
 * becomes the entire flowing surface. Hold to dissolve boundary.
 * INTERACTION: Hold → surface tension breaks → becomes the ocean
 * RENDER: Canvas 2D · REDUCED MOTION: Static ocean surface
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const DROP_RADIUS=0.04;const DISSOLVE_RATE=0.005;const SURFACE_EXPAND=0.008;const RESPAWN_DELAY=100;

interface ShifterState{entranceProgress:number;frameCount:number;primaryRgb:RGB;accentRgb:RGB;
  holding:boolean;dissolve:number;surfaceRadius:number;
  completed:boolean;respawnTimer:number;}

function freshState(c:string,a:string):ShifterState{
  return{entranceProgress:0,frameCount:0,primaryRgb:parseColor(c),accentRgb:parseColor(a),
    holding:false,dissolve:0,surfaceRadius:0,completed:false,respawnTimer:0};}

export default function ShifterSealAtom({breathAmplitude,reducedMotion,color,accentColor,viewport,phase,composed,onHaptic,onStateChange}:AtomProps){
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

      if(!p.composed)drawAtmosphere(ctx,cx,cy,w,h,minDim,s.primaryRgb,entrance,GLOW.lg);

      if(!p.reducedMotion&&!s.completed){
        if(s.holding){
          s.dissolve=Math.min(1,s.dissolve+DISSOLVE_RATE);
          if(s.dissolve>=1)s.surfaceRadius=Math.min(1,s.surfaceRadius+SURFACE_EXPAND);
          if(s.frameCount%25===0)cb.onHaptic('hold_threshold');
          cb.onStateChange?.(s.dissolve*0.5+s.surfaceRadius*0.5);
          if(s.surfaceRadius>=1){s.completed=true;cb.onHaptic('seal_stamp');cb.onStateChange?.(1);s.respawnTimer=RESPAWN_DELAY;}
        }
      }

      const dropR=px(DROP_RADIUS,minDim);
      const dropAlpha=Math.max(0,1-s.dissolve)*ALPHA.content.max*entrance;

      // Surface water (expanding)
      if(s.surfaceRadius>0){
        const surfR=minDim*0.6*s.surfaceRadius;
        // Pearlescent ocean
        for(let layer=0;layer<3;layer++){
          const lr=surfR*(0.7+layer*0.15);
          const lColor=lerpColor(s.primaryRgb,s.accentRgb,layer*0.3+Math.sin(s.frameCount*0.01+layer)*0.1);
          const lGrad=ctx.createRadialGradient(cx,cy,lr*0.3,cx,cy,lr);
          lGrad.addColorStop(0,rgba(lColor,ALPHA.glow.max*0.15*s.surfaceRadius*entrance));
          lGrad.addColorStop(1,rgba(lColor,0));
          ctx.fillStyle=lGrad;ctx.fillRect(cx-lr,cy-lr,lr*2,lr*2);
        }
        // Gentle wave ripples
        for(let i=0;i<5;i++){
          const ripR=surfR*(0.2+i*0.18)+Math.sin(s.frameCount*0.02+i)*px(0.01,minDim);
          ctx.beginPath();ctx.arc(cx,cy,ripR,0,Math.PI*2);
          ctx.strokeStyle=rgba(s.primaryRgb,ALPHA.atmosphere.min*0.2*s.surfaceRadius*entrance*ms);
          ctx.lineWidth=px(STROKE.hairline,minDim);ctx.stroke();
        }
      }

      // Drop (dissolving)
      if(dropAlpha>0.01){
        // Surface tension ring
        if(s.dissolve<0.5){
          ctx.beginPath();ctx.arc(cx,cy,dropR*(1+s.dissolve*2),0,Math.PI*2);
          ctx.strokeStyle=rgba(s.primaryRgb,(1-s.dissolve*2)*ALPHA.content.max*0.3*entrance);
          ctx.lineWidth=px(STROKE.thin,minDim);ctx.stroke();
        }

        // Drop body
        const gr=dropR*2;const g=ctx.createRadialGradient(cx,cy,0,cx,cy,gr);
        g.addColorStop(0,rgba(s.primaryRgb,ALPHA.glow.max*0.3*(1-s.dissolve)*entrance));g.addColorStop(1,rgba(s.primaryRgb,0));
        ctx.fillStyle=g;ctx.fillRect(cx-gr,cy-gr,gr*2,gr*2);

        ctx.beginPath();ctx.arc(cx,cy,dropR*(1-s.dissolve*0.3),0,Math.PI*2);
        ctx.fillStyle=rgba(s.primaryRgb,dropAlpha);ctx.fill();

        // Highlight
        ctx.beginPath();ctx.arc(cx-dropR*0.3,cy-dropR*0.3,dropR*0.2*(1-s.dissolve),0,Math.PI*2);
        ctx.fillStyle=rgba([255,255,255] as RGB,dropAlpha*0.3);ctx.fill();
      }

      // Dissolving particles
      if(s.dissolve>0.3&&s.dissolve<1){
        for(let i=0;i<8;i++){
          const da=(i/8)*Math.PI*2+s.frameCount*0.02;
          const dr=dropR*(1+s.dissolve*3);
          const dpx=cx+Math.cos(da)*dr;const dpy=cy+Math.sin(da)*dr;
          ctx.beginPath();ctx.arc(dpx,dpy,px(0.003,minDim)*(1-s.dissolve),0,Math.PI*2);
          ctx.fillStyle=rgba(s.primaryRgb,(1-s.dissolve)*ALPHA.content.max*0.4*entrance*ms);ctx.fill();
        }
      }

      // HUD
      const fontSize=Math.max(8,px(FONT_SIZE.sm,minDim));ctx.font=`${fontSize}px monospace`;ctx.textAlign='center';
      if(s.completed){ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.5*entrance);ctx.fillText('THE MULTITUDES',cx,h-px(0.035,minDim));}
      else if(s.dissolve<0.1){ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.2*entrance);ctx.fillText('HOLD TO DISSOLVE',cx,h-px(0.035,minDim));}
      else if(s.dissolve<1){ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.3*entrance);ctx.fillText('RELEASING...',cx,h-px(0.035,minDim));}
      else{ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.35*entrance);ctx.fillText('BECOMING OCEAN',cx,h-px(0.035,minDim));}

      if(p.reducedMotion){const sfR=minDim*0.4;const g=ctx.createRadialGradient(cx,cy,0,cx,cy,sfR);
        g.addColorStop(0,rgba(s.primaryRgb,ALPHA.glow.max*0.3*entrance));g.addColorStop(1,rgba(s.primaryRgb,0));
        ctx.fillStyle=g;ctx.fillRect(cx-sfR,cy-sfR,sfR*2,sfR*2);}

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
