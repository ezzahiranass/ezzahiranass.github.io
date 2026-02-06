'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export default function CanvasKickstart() {
  const { gl, invalidate } = useThree();

  useEffect(() => {
    let raf = 0;

    const kick = () => {
      const rect = gl.domElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        gl.setSize(rect.width, rect.height, false);
      }
      invalidate();
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(kick);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        schedule();
      }
    };

    schedule();

    window.addEventListener('focus', schedule);
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('focus', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [gl, invalidate]);

  return null;
}
