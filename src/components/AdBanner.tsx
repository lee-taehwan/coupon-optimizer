'use client';

import { useEffect } from 'react';

const AdBanner = () => {
  useEffect(() => {
    try {
      // @ts-expect-error - Google AdSense is not typed in window object
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("Failed to push adsbygoogle", err);
    }
  }, []);

  return (
    <div className="flex justify-center items-center my-4 bg-slate-200 dark:bg-slate-800 rounded-md h-[105px] overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-7975402530066755"
        data-ad-slot="4006228224"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner; 