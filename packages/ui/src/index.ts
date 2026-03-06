export const UI_RUNTIME_SURFACES = ['design-center', 'marketing', 'platform'] as const;

export type UIRuntimeSurface = (typeof UI_RUNTIME_SURFACES)[number];

export { cn } from './primitives/utils';
export { Button, buttonVariants } from './primitives/button';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './primitives/card';
export { Badge, badgeVariants } from './primitives/badge';
export { Input } from './primitives/input';
export { Textarea } from './primitives/textarea';
export { Label } from './primitives/label';
export { Separator } from './primitives/separator';
