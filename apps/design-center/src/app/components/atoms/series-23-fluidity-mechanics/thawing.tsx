/**
 * ATOM 226: THE THAWING ENGINE · S23 · Position 6
 * Anxiety is frozen energy. Press palm to thaw frost.
 * INTERACTION: Hold → thermal melting → vibrant warmth revealed
 * RENDER: Canvas 2D · REDUCED MOTION: Static thawed
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const THAW_RATE=0.004;const CRACK_RATE=0.006;const RESPAWN_DELAY=100;

interface ThawState{entranceProgress:number;frameCount:number;primaryRgb:RGB;accentRgb:RGB;
  holding:boolean;thaw:number;cracks:{x:number;y:number;angle:number;len:number}[];
  completed:boolean;respawnTimer:number;}

function freshState(c:string,a:string):ThawState{
  const cracks=Array.from({length:12},()=>({x:0.2+Math.random()*0.6,y:0.2+Math.random()*0.6,angle:Math.random()*Math.PI*2,len:0.02+Math.random()*0.04}));
  return{entranceProgress:0,frameCount:0,primaryRgb:parseColor(c),accentRgb:parseColor(a),
    holding:false,thaw:0,cracks,completed:false,respawnTimer:0};}

export default function ThawingAtom({breathAmplitude,reducedMotion,color,accentColor,viewport,phase,composed,onHaptic,onStateChange}:AtomProps){
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
        if(s.holding){s.thaw=Math.min(1,s.thaw+THAW_RATE);
          if(s.frameCount%20===0)cb.onHaptic('hold_threshold');
          cb.onStateChange?.(s.thaw);
          if(s.thaw>=1){s.completed=true;cb.onHaptic('completion');cb.onStateChange?.(1);s.respawnTimer=RESPAWN_DELAY;}
        }
      }

      // Ice layer (fades with thaw)
      const iceAlpha=(1-s.thaw)*ALPHA.content.max*0.15*entrance;
      if(iceAlpha>0.01){
        ctx.fillStyle=rgba(s.accentRgb,iceAlpha);ctx.fillRect(0,0,w,h);
        // Frost patterns
        for(let i=0;i<30;i++){
          const fx=Math.sin(i*3.7)*w*0.4+cx;const fy=Math.cos(i*2.3)*h*0.4+cy;
          const fr=px(0.01+Math.random()*0.02,minDim)*(1-s.thaw);
          ctx.beginPath();ctx.arc(fx,fy,fr,0,Math.PI*2);
          ctx.fillStyle=rgba(s.accentRgb,iceAlpha*0.5*ms);ctx.fill();
        }
      }

      // Cracks (appear early in thawing)
      if(s.thaw>0.1&&s.thaw<0.8){
        for(const cr of s.cracks){
          ctx.beginPath();ctx.moveTo(cr.x*w,cr.y*h);
          ctx.lineTo(cr.x*w+Math.cos(cr.angle)*px(cr.len,minDim),cr.y*h+Math.sin(cr.angle)*px(cr.len,minDim));
          ctx.strokeStyle=rgba(s.primaryRgb,Math.min(1,(s.thaw-0.1)*3)*ALPHA.content.max*0.3*entrance);
          ctx.lineWidth=px(STROKE.hairline,minDim);ctx.stroke();
        }
      }

      // Warmth revealed (gradient underneath)
      if(s.thaw>0.2){
        const warmAlpha=(s.thaw-0.2)*1.25*ALPHA.glow.max*0.3*entrance;
        const warm=ctx.createRadialGradient(cx,cy,0,cx,cy,minDim*0.4);
        warm.addColorStop(0,rgba(s.primaryRgb,warmAlpha));
        warm.addColorStop(0.5,rgba(lerpColor(s.primaryRgb,s.accentRgb,0.3),warmAlpha*0.5));
        warm.addColorStop(1,rgba(s.primaryRgb,0));
        ctx.fillStyle=warm;ctx.fillRect(0,0,w,h);
      }

      // Dripping condensation
      if(s.thaw>0.4){
        for(let i=0;i<5;i++){
          const dx=w*(0.15+i*0.175);const dy=(s.thaw-0.4+Math.sin(s.frameCount*0.02+i)*0.05)*h;
          ctx.beginPath();ctx.arc(dx,dy,px(0.003,minDim),0,Math.PI*2);
          ctx.fillStyle=rgba(s.primaryRgb,ALPHA.atmosphere.min*0.4*entrance*ms);ctx.fill();
        }
      }

      // HUD
      const fontSize=Math.max(8,px(FONT_SIZE.sm,minDim));ctx.font=`${fontSize}px monospace`;ctx.textAlign='center';
      if(s.completed){ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.5*entrance);ctx.fillText('THAWED',cx,h-px(0.035,minDim));}
      else{ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.2*entrance);ctx.fillText(s.holding?`${Math.round(s.thaw*100)}%`:'HOLD TO THAW',cx,h-px(0.035,minDim));}

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
