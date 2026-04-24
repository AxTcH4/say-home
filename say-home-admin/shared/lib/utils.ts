import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function calculateTimeAgo  (time: string)  {
    const diffMs = Date.now() - new Date(time).getTime();
    const diffSec = diffMs / 1000;
    if (diffSec < 60) {
      return `${diffSec.toFixed(0)} seconds`;
    } else if (diffSec < 3600) {
      const diffMin = diffSec / 60;
      return `${diffMin.toFixed(0)} minutes`;
    } else if (diffSec < 86400) {
      const diffHr = diffSec / 3600;
      return `${diffHr.toFixed(0)} heurs`;
    } else {
      const diffDay = diffSec / 86400;
      return `${diffDay.toFixed(0)} jours`;
    }
  };