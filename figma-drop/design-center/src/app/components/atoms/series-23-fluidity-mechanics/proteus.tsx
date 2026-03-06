/**
 * ATOM 227: THE PROTEUS ENGINE · S23 · Position 7
 * Rigidity is death. Distort your shape to fit through the gate.
 * INTERACTION: Drag (morph anchor points) → fit gate → pass through
 * RENDER: Canvas 2D · REDUCED MOTION: Static morphed shape
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const GATE_WIDTH=0.06;const GATE_HEIGHT=0.25;const SHAPE_POINTS=6;const FIT_THRESHOLD=0.03;const RESPAWN_DELAY=100;

interface Anchor{x:number;y:number;targetX:number;targetY:number;}

interface ProteusState{entranceProgress:number;frameCount:number;primaryRgb:RGB;accentRgb:RGB;
  anchors:Anchor[];draggingIdx:number;fitScore:number;passed:boolean;passAnim:number;
  completed:boolean;respawnTimer:number;}

function makeAnchors():Anchor[]{
  return Array.from({length:SHAPE_POINTS},(_,i)=>{
    const a=(i/SHAPE_POINTS)*Math.PI*2;const r=0.08;
    const gateR=GATE_HEIGHT/2;const ta=(i/SHAPE_POINTS)*Math.PI*2;
    return{x:0.3+Math.cos(a)*r,y:0.5+Math.sin(a)*r,
      targetX:0.7+Math.cos(ta)*GATE_WIDTH*0.4,targetY:0.5+Math.sin(ta)*gateR*0.8};
  });
}

function freshState(c:string,a:string):ProteusState{
  return{entranceProgress:0,frameCount:0,primaryRgb:parseColor(c),accentRgb:parseColor(a),
    anchors:makeAnchors(),draggingIdx:-1,fitScore:0,passed:false,passAnim:0,
    completed:false,respawnTimer:0};}

export default function ProteusAtom({breathAmplitude,reducedMotion,color,accentColor,viewport,phase,composed,onHaptic,onStateChange}:AtomProps){
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
        let totalDist=0;
        for(const a of s.anchors){totalDist+=Math.sqrt((a.x-a.targetX)**2+(a.y-a.targetY)**2);}
        s.fitScore=Math.max(0,1-totalDist/(SHAPE_POINTS*0.15));
        cb.onStateChange?.(s.fitScore);
        if(s.fitScore>0.9&&!s.passed){s.passed=true;cb.onHaptic('step_advance');}
        if(s.passed){s.passAnim=Math.min(1,s.passAnim+0.01);
          if(s.passAnim>=1){s.completed=true;cb.onHaptic('completion');cb.onStateChange?.(1);s.respawnTimer=RESPAWN_DELAY;}
          for(const a of s.anchors){a.x+=(a.targetX+0.15-a.x)*0.02;}
        }
      }

      // Gate
      const gateX=0.7*w;const gateTop=(0.5-GATE_HEIGHT/2)*h;const gateBtm=(0.5+GATE_HEIGHT/2)*h;
      const gateW=px(GATE_WIDTH,minDim);
      ctx.fillStyle=rgba(s.accentRgb,ALPHA.content.max*0.1*entrance);
      ctx.fillRect(gateX-gateW/2,0,gateW,gateTop);
      ctx.fillRect(gateX-gateW/2,gateBtm,gateW,h-gateBtm);
      ctx.strokeStyle=rgba(s.accentRgb,ALPHA.content.max*0.3*entrance);
      ctx.lineWidth=px(STROKE.medium,minDim);
      ctx.beginPath();ctx.moveTo(gateX-gateW/2,gateTop);ctx.lineTo(gateX+gateW/2,gateTop);ctx.stroke();
      ctx.beginPath();ctx.moveTo(gateX-gateW/2,gateBtm);ctx.lineTo(gateX+gateW/2,gateBtm);ctx.stroke();

      // Shape
      ctx.beginPath();
      for(let i=0;i<s.anchors.length;i++){
        const a=s.anchors[i];
        if(i===0)ctx.moveTo(a.x*w,a.y*h);else ctx.lineTo(a.x*w,a.y*h);
      }
      ctx.closePath();
      ctx.fillStyle=rgba(s.primaryRgb,ALPHA.content.max*0.15*entrance);ctx.fill();
      ctx.strokeStyle=rgba(s.primaryRgb,ALPHA.content.max*0.4*entrance);
      ctx.lineWidth=px(STROKE.medium,minDim);ctx.stroke();

      // Anchor handles
      for(const a of s.anchors){
        ctx.beginPath();ctx.arc(a.x*w,a.y*h,px(0.008,minDim),0,Math.PI*2);
        ctx.fillStyle=rgba(s.primaryRgb,ALPHA.content.max*0.6*entrance);ctx.fill();
      }

      // Target ghost
      if(s.fitScore<0.9){
        ctx.setLineDash([px(0.003,minDim),px(0.005,minDim)]);ctx.beginPath();
        for(let i=0;i<s.anchors.length;i++){
          const a=s.anchors[i];
          if(i===0)ctx.moveTo(a.targetX*w,a.targetY*h);else ctx.lineTo(a.targetX*w,a.targetY*h);
        }
        ctx.closePath();ctx.strokeStyle=rgba(s.primaryRgb,ALPHA.atmosphere.min*0.3*entrance);
        ctx.lineWidth=px(STROKE.hairline,minDim);ctx.stroke();ctx.setLineDash([]);
      }

      const fontSize=Math.max(8,px(FONT_SIZE.sm,minDim));ctx.font=`${fontSize}px monospace`;ctx.textAlign='center';
      if(s.completed){ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.5*entrance);ctx.fillText('METAMORPHOSIS',cx,h-px(0.035,minDim));}
      else{ctx.fillStyle=rgba(s.primaryRgb,ALPHA.text.max*0.2*entrance);ctx.fillText('DRAG POINTS TO FIT GATE',cx,h-px(0.035,minDim));}

      if(s.completed&&p.phase!=='resolve'){s.respawnTimer--;if(s.respawnTimer<=0){Object.assign(s,freshState(color,accentColor));s.entranceProgress=1;}}
      ctx.restore();animId=requestAnimationFrame(render);
    };
    animId=requestAnimationFrame(render);

    const onDown=(e:PointerEvent)=>{const s=stateRef.current;if(s.completed||s.passed)return;
      const rect=canvas.getBoundingClientRect();const mx=(e.clientX-rect.left)/rect.width;const my=(e.clientY-rect.top)/rect.height;
      let closest=-1;let minD=0.05;
      for(let i=0;i<s.anchors.length;i++){const d=Math.sqrt((mx-s.anchors[i].x)**2+(my-s.anchors[i].y)**2);if(d<minD){minD=d;closest=i;}}
      s.draggingIdx=closest;canvas.setPointerCapture(e.pointerId);};
    const onMove=(e:PointerEvent)=>{const s=stateRef.current;if(s.draggingIdx<0)return;
      const rect=canvas.getBoundingClientRect();s.anchors[s.draggingIdx].x=(e.clientX-rect.left)/rect.width;
      s.anchors[s.draggingIdx].y=(e.clientY-rect.top)/rect.height;};
    const onUp=(e:PointerEvent)=>{stateRef.current.draggingIdx=-1;canvas.releasePointerCapture(e.pointerId);};

    canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);
    canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);
    return()=>{cancelAnimationFrame(animId);canvas.removeEventListener('pointerdown',onDown);
      canvas.removeEventListener('pointermove',onMove);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);};
  },[viewport.width,viewport.height]);

  return(<div style={{position:'absolute',inset:0,overflow:'hidden'}}><canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%',touchAction:'none',cursor:'grab'}}/></div>);
}
