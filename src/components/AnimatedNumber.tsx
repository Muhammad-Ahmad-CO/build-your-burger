// ============= Full file contents =============

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import { formatRs } from "@/components/burger/data";

/** Live price that counts up/down instead of jumping. */
export function AnimatedNumber({
  value,
  format = formatRs,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 300, damping: 22 });
  const text = useTransform(spring, (v) => format(v));

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  return <motion.span className={className}>{text}</motion.span>;
}
