import { useRef, useEffect } from 'react';
import { trapFocus, KeyboardKeys } from '../lib/accessibility';

/**
 * Hook for managing focus trap in modals and dialogs
 */
export function useFocusTrap(isOpen: boolean): React.RefObject<HTMLDivElement> {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        trapFocus(containerRef.current!, e);
      }
    };

    containerRef.current.addEventListener('keydown', handleKeyDown);
    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return containerRef;
}

/**
 * Hook for keyboard event handling
 */
export function useKeyboardNavigation(
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KeyboardKeys.ENTER && onEnter) {
        onEnter();
      } else if (e.key === KeyboardKeys.ESCAPE && onEscape) {
        onEscape();
      } else if (e.key === KeyboardKeys.ARROW_UP && onArrowUp) {
        e.preventDefault();
        onArrowUp();
      } else if (e.key === KeyboardKeys.ARROW_DOWN && onArrowDown) {
        e.preventDefault();
        onArrowDown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnter, onEscape, onArrowUp, onArrowDown]);
}

/**
 * Hook for screen reader announcements
 */
export function useScreenReaderAnnouncement() {
  const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', politeness);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      announcement.remove();
    }, 1000);
  };

  return { announce };
}
