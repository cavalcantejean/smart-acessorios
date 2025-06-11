
"use client";

import { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // Import nprogress default CSS
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false }); // Optional: disable the spinner

    // Start NProgress when the pathname or searchParams change,
    // indicating a new navigation has begun.
    NProgress.start();

    // The cleanup function of this useEffect hook will be called when the
    // component unmounts or when the dependencies (pathname, searchParams) change again.
    // This effectively means NProgress.done() is called just before the *next*
    // navigation starts or when the page is left.
    return () => {
      NProgress.done();
    };
  }, [pathname, searchParams]); // Re-run effect when path or query params change

  return null; // This component does not render anything itself
}
