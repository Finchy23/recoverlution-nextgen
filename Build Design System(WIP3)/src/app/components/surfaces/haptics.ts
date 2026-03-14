/**
 * HAPTIC FEEDBACK — Somatic Confirmation
 *
 * The device becomes an extension of the room's physics.
 * Vibration patterns are tuned to the breath cycle.
 *
 * We never vibrate to alert. We vibrate to confirm weight,
 * resistance, release, and receipt.
 */

/** Light confirmation — a single micro-pulse */
export function hapticTick() {
  if ('vibrate' in navigator) {
    navigator.vibrate(8);
  }
}

/** Medium weight — threshold crossed */
export function hapticThreshold() {
  if ('vibrate' in navigator) {
    navigator.vibrate([12, 40, 8]);
  }
}

/** Heavy resolve — the snap moment */
export function hapticResolve() {
  if ('vibrate' in navigator) {
    navigator.vibrate([20, 30, 15, 30, 10]);
  }
}

/** Viscous resistance — escalating pressure during hold */
export function hapticPressure(intensity: number) {
  if ('vibrate' in navigator) {
    const ms = Math.round(4 + intensity * 12);
    navigator.vibrate(ms);
  }
}

/** Breath sync — gentle pulse matching the somatic breath */
export function hapticBreathPulse() {
  if ('vibrate' in navigator) {
    navigator.vibrate(6);
  }
}

/** Seal confirmation — the moment is stamped */
export function hapticSeal() {
  if ('vibrate' in navigator) {
    navigator.vibrate([15, 60, 10, 40, 6]);
  }
}
