/**
 * ATOM 228: THE OCEAN DEPTH ENGINE · S23 · Position 8
 * Storm is only on surface. Scrub down to dive deep — massive
 * slow currents are unshakeable. Frequency dampening with depth.
 * INTERACTION: Scrub (drag down) → dive deeper → peace
 * RENDER: Canvas 2D · REDUCED MOTION: Static deep blue
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const DIVE_RATE=0.004;const SURFACE_CHAOS=0.8;const RESPAWN_DELAY=100;

interface OceanState{entranceProgress:number;frameCount:number;primaryRgb:RGB;accentRgb:RGB;
  depth:number;dragging:boolean;lastY:number;completed:boolean;respawnTimer:number;}

function freshState(c:string,a:string):OceanState{
  return{entranceProgress:0,frameCount:0,primaryRgb:parseColor(c),accentRgb:parseColor(a),
    depth:0,dragging:false,lastY:0,completed:false,respawnTimer:0};}

export default function OceanDepthAtom({breathAmplitude,reducedMotion,color,accentColor,viewport,phase,composed,onHaptic,onStateChange}:AtomProps){
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

      cb.onStateChange?.(s.depth);
      if(s.depth>=1&&!s.completed){s.completed=true;cb.onHaptic('completion');cb.onStateChange?.(1);s.respawnTimer=RESPAWN_DELAY;}

      // Background gets deeper blue with depth
      const deepColor=lerpColor(s.accentRgb,s.primaryRgb,s.depth);
      const bgAlpha=ALPHA.background.min*(2+s.depth*3)*entrance;
      ctx.fillStyle=rgba(deepColor,bgAlpha);ctx.fillRect(0,0,w,h);

      // Surface waves (chaotic, dampened with depth)
      const chaos=SURFACE_CHAOS*(1-s.depth);
      if(chaos>0.05){
        for(let layer=0;layer<3;layer++){
          ctx.beginPath();
          for(let x=0;x<w;x+=3){
            const waveY=h*(0.1+layer*0.03)+Math.sin(x*0.02+s.frameCount*0.05*(1-s.depth)+layer)*px(0.02,minDim)*chaos;
            if(x===0)ctx.moveTo(x,waveY);else ctx.lineTo(x,waveY);
          }
          ctx.strokeStyle=rgba(s.accentRgb,chaos*ALPHA.content.max*0.2*entrance*ms);
          ctx.lineWidth=px(STROKE.thin,minDim);ctx.stroke();
        }
      }

      // Depth particles (slow, peaceful with depth)
      const particleSpeed=0.01*(1-s.depth*0.8);
      for(let i=0;i<8;i++){
        const px2=cx+Math.sin(s.frameCount*particleSpeed+i*1.7)*w*0.3;
        const py2=h*(0.3+i*0.08)+Math.cos(s.frameCount*particleSpeed*0.5+i)*px(0.01,minDim);
        const pAlpha=s.depth*ALPHA.atmosphere.min*0.3*entrance*ms;
        ctx.beginPath();ctx.arc(px2,py2,px(0.003+s.depth*0.002,minDim),0,Math.PI*2);
        ctx.fillStyle=rgba(s.primaryRgb,pAlpha);ctx.fill();
      }

      // Deep current lines (visible at depth)
      if(s.depth>0.4){
        const currentAlpha=(s.depth-0.4)*1.67*ALPHA.atmosphere.max*0.2*entrance*ms;
        for(let i=0;i<4;i++){
          const curY=h*(0.4+i*0.12);
          ctx.beginPath();ctx.moveTo(0,curY);
          for(let x=0;x<w;x+=5){
            ctx.lineTo(x,curY+Math.sin(x*0.003+s.frameCount*0.002)*px(0.02,minDim));
          }
          ctx.strokeStyle=rgba(s.primaryRgb,currentAlpha);
          ctx.lineWidth=px(STROKE.light,minDim);ctx.stroke();
        }
      }

      // Diver node
      const nodeY=h*(0.15+s.depth*0.65);
      const gr=px(0.07,minDim);const g=ctx.createRadialGradient(cx,nodeY,0,cx,nodeY,gr);
      g.addColorStop(0,rgba(s.primaryRgb,ALPHA.glow.max*0.3*entrance));g.addColorStop(1,rgba(s.primaryRgb,0));
      ctx.fillStyle=g;ctx.fillRect(cx-gr,nodeY-gr,gr*2,gr*2);
      ctx.beginPath();ctx.arc(cx,nodeY,px(0.02,minDim),0,Math.PI*2);
      ctx.fillStyle=rgba(s.primaryRgb,ALPHA.content.max*entrance);ctx.fill();

      // Depth meter
      const meterX=w-px(0.04,minDim);const meterH=h*0.6;const meterY=(h-meterH)/2;
      ctx.fillStyle=rgba(s.primaryRgb,ALPHA.background.min*2*entrance);
      ctx.fillRect(meterX,meterY,px(0.004,minDim),meterH);
      ctx.beginPath();ctx.arc(meterX+px(0.002,minDim),meterY+meterH*s.depth,px(0.005,minDim),0,Math.PI*2);
      ctx.fillStyle=rgba(s.primaryRgb,ALPHA.content.max*0.5*entrance);ctx.fill();

      const fontSize=Math.max(8,px(FONT_SIZE.sm,minDim));ctx.font=`${fontSize}px monospace`;ctx.textAlign='center';
      if(s.completed){ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.5*entrance);ctx.fillText('DEEP PEACE',cx,h-px(0.035,minDim));}
      else{ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.2*entrance);ctx.fillText('DRAG DOWN TO DIVE',cx,h-px(0.035,minDim));}

      if(s.completed&&p.phase!=='resolve'){s.respawnTimer--;if(s.respawnTimer<=0){Object.assign(s,freshState(color,accentColor));s.entranceProgress=1;}}
      ctx.restore();animId=requestAnimationFrame(render);
    };
    animId=requestAnimationFrame(render);

    const onDown=(e:PointerEvent)=>{const s=stateRef.current;s.dragging=true;
      const rect=canvas.getBoundingClientRect();s.lastY=(e.clientY-rect.top)/rect.height;canvas.setPointerCapture(e.pointerId);};
    const onMove=(e:PointerEvent)=>{const s=stateRef.current;if(!s.dragging||s.completed)return;
      const rect=canvas.getBoundingClientRect();const my=(e.clientY-rect.top)/rect.height;
      const dy=my-s.lastY;s.depth=Math.max(0,Math.min(1,s.depth+dy*2));s.lastY=my;
      if(dy>0.005)cbRef.current.onHaptic('drag_snap');};
    const onUp=(e:PointerEvent)=>{stateRef.current.dragging=false;canvas.releasePointerCapture(e.pointerId);};

    canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);
    canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);
    return()=>{cancelAnimationFrame(animId);canvas.removeEventListener('pointerdown',onDown);
      canvas.removeEventListener('pointermove',onMove);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);

  return(<div style={{position:'absolute',inset:0,overflow:'hidden'}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none',cursor:'ns-resize'}}/></div>);
}
