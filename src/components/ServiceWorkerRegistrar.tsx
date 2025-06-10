
"use client";

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ServiceWorkerRegistrar() {
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.workbox !== undefined) {
      // The window.workbox call must be within a useEffect hook or an event handler.
      // Next-PWA specific:
      // const wb = window.workbox
      // if (wb) {
      //   wb.active.then(worker => {
      //     // Send a message to the service worker to skip waiting and activate.
      //     // This is useful if you want to force activate a new service worker.
      //     // worker.messageSW({ type: 'SKIP_WAITING' })
      //   });
      // }
    }

    if ('serviceWorker' in navigator) {
      const handleServiceWorkerRegistration = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[ServiceWorkerRegistrar] Service Worker registered with scope:', registration.scope);
            
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      // New content is available and will be cached; waiting for user to reload.
                      console.log('[ServiceWorkerRegistrar] New content is available and will be used when all tabs for this page are closed.');
                      toast({
                        title: "Atualização Disponível",
                        description: "Uma nova versão do site foi baixada. Feche todas as abas e reabra para ver as novidades.",
                        duration: 8000,
                      });
                    } else {
                      // Content is cached for offline use.
                      console.log('[ServiceWorkerRegistrar] Content is cached for offline use.');
                      toast({
                        title: "Pronto para Offline",
                        description: "Este site agora pode ser acessado offline.",
                        duration: 5000,
                      });
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error('[ServiceWorkerRegistrar] Service Worker registration failed:', error);
          });
      };
      
      // Delay registration slightly to ensure the page is fully loaded
      // and to avoid potential interference with other initial scripts.
      if (document.readyState === 'complete') {
        handleServiceWorkerRegistration();
      } else {
        window.addEventListener('load', handleServiceWorkerRegistration);
        return () => window.removeEventListener('load', handleServiceWorkerRegistration);
      }
    }
  }, [toast]);

  return null; // This component does not render anything
}
