/**
 * useSealCompletion -- Safe seal completion for NaviCue seal specimens
 *
 * PROBLEM SOLVED:
 * Seal specimens (Projector, Chronomancer, Materialist seals) previously
 * called handleComplete() as a side effect inside the render function:
 *
 *   {(verse) => {
 *     advanceRef.current = verse.advance;
 *     if (hold.completed) handleComplete(); // <-- side effect in render!
 *     return (...);
 *   }}
 *
 * This works due to ref guards but is technically incorrect React.
 * React may call render functions multiple times without committing,
 * and side effects in render can fire on abandoned renders in concurrent mode.
 *
 * SOLUTION:
 * This hook watches `isCompleted` and calls `advance()` via useEffect.
 * The verse.advance ref is synced every render, but the actual call
 * only happens in the effect phase.
 *
 * Usage:
 *   const hold = useHoldInteraction({ maxDuration: 8000 });
 *
 *   return (
 *     <NaviCueVerse ...>
 *       {(verse) => {
 *         useSealCompletion(hold.completed, verse.advance, 2500);
 *         return (...);
 *       }}
 *     </NaviCueVerse>
 *   );
 *
 * WAIT: The children render function of NaviCueVerse is a render function,
 * NOT a component. Hooks cannot be called inside render functions.
 * So we need a wrapper component pattern instead.
 *
 * Corrected usage -- wrap the seal's interactive content in a component:
 *
 *   function SealInner({ verse, hold }: { verse: VerseContext; hold: HoldState }) {
 *     useSealCompletion(hold.completed, verse.advance, 2500);
 *     return (...);
 *   }
 *
 *   <NaviCueVerse ...>
 *     {(verse) => <SealInner verse={verse} hold={hold} />}
 *   </NaviCueVerse>
 */
import { useEffect, useRef } from 'react';

/**
 * Watches `isCompleted` and calls `advance` after `delayMs` via useEffect.
 * Fires exactly once per mount. Safe for React concurrent mode.
 *
 * @param isCompleted - Whether the interaction is complete (e.g., hold.completed)
 * @param advance - The verse.advance function (call to move active -> resonant)
 * @param delayMs - Delay before calling advance (default: 2500ms for ceremony pacing)
 */
export function useSealCompletion(
  isCompleted: boolean,
  advance: () => void,
  delayMs = 2500,
) {
  const firedRef = useRef(false);
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  useEffect(() => {
    if (!isCompleted || firedRef.current) return;
    firedRef.current = true;

    const timer = setTimeout(() => {
      advanceRef.current();
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isCompleted, delayMs]);
}
