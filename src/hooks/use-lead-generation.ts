'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseLeadGenerationOptions {
  scrollTrigger?: number; // Percentage of page scrolled
  timeTrigger?: number; // Seconds on page
  exitIntentEnabled?: boolean;
  cookieExpiration?: number; // Days
}

const defaultOptions: UseLeadGenerationOptions = {
  scrollTrigger: 70,
  timeTrigger: 30,
  exitIntentEnabled: true,
  cookieExpiration: 7
};

export function useLeadGeneration(options: UseLeadGenerationOptions = {}) {
  const config = { ...defaultOptions, ...options };
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [trigger, setTrigger] = useState<'scroll' | 'time' | 'exit-intent' | 'manual'>('manual');
  const [hasBeenTriggered, setHasBeenTriggered] = useState(false);

  // Check if user has already seen the popup
  const checkCookie = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('leadMagnetSeen') !== null;
  }, []);

  // Set cookie to prevent showing popup again
  const setCookie = useCallback(() => {
    if (typeof window === 'undefined') return;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + (config.cookieExpiration || 7));
    localStorage.setItem('leadMagnetSeen', expirationDate.toISOString());
  }, [config.cookieExpiration]);

  // Check if cookie has expired
  const isCookieExpired = useCallback(() => {
    if (typeof window === 'undefined') return true;
    const cookieValue = localStorage.getItem('leadMagnetSeen');
    if (!cookieValue) return true;
    
    const expirationDate = new Date(cookieValue);
    return new Date() > expirationDate;
  }, []);

  // Scroll trigger
  useEffect(() => {
    if (hasBeenTriggered || !isCookieExpired()) return;

    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercentage >= (config.scrollTrigger || 70)) {
        setTrigger('scroll');
        setIsPopupOpen(true);
        setHasBeenTriggered(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasBeenTriggered, config.scrollTrigger, isCookieExpired]);

  // Time trigger
  useEffect(() => {
    if (hasBeenTriggered || !isCookieExpired()) return;

    const timer = setTimeout(() => {
      setTrigger('time');
      setIsPopupOpen(true);
      setHasBeenTriggered(true);
    }, (config.timeTrigger || 30) * 1000);

    return () => clearTimeout(timer);
  }, [hasBeenTriggered, config.timeTrigger, isCookieExpired]);

  // Exit intent trigger
  useEffect(() => {
    if (!config.exitIntentEnabled || hasBeenTriggered || !isCookieExpired()) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setTrigger('exit-intent');
        setIsPopupOpen(true);
        setHasBeenTriggered(true);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [config.exitIntentEnabled, hasBeenTriggered, isCookieExpired]);

  // Manual trigger
  const showPopup = useCallback((triggerType: 'manual' = 'manual') => {
    setTrigger(triggerType);
    setIsPopupOpen(true);
    setHasBeenTriggered(true);
  }, []);

  // Close popup
  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
    setCookie();
  }, [setCookie]);

  // Reset for testing
  const resetTriggers = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('leadMagnetSeen');
    setHasBeenTriggered(false);
    setIsPopupOpen(false);
  }, []);

  return {
    isPopupOpen,
    trigger,
    showPopup,
    closePopup,
    resetTriggers,
    hasBeenTriggered
  };
}