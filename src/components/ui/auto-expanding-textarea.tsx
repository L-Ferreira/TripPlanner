import { cn } from '@/lib/utils';
import React, { TextareaHTMLAttributes, forwardRef, useCallback, useEffect, useRef, useState } from 'react';

export interface AutoExpandingTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSizeChange?: (height: number) => void;
  savedHeight?: number;
  minHeight?: number;
  maxHeight?: number;
}

const AutoExpandingTextarea = forwardRef<HTMLTextAreaElement, AutoExpandingTextareaProps>(
  ({ className, onSizeChange, savedHeight, minHeight = 60, maxHeight = 500, onInput, onChange, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [height, setHeight] = useState(savedHeight || minHeight);

    // Use useImperativeHandle to properly handle the ref
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(textareaRef.current);
      } else if (ref) {
        ref.current = textareaRef.current;
      }
    }, [ref]);

    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Calculate new height - scrollHeight already includes padding
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

      // Set the height
      textarea.style.height = `${newHeight}px`;
      setHeight(newHeight);

      // Enable/disable scrolling based on content height
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }

      // Notify parent of size change
      if (onSizeChange) {
        onSizeChange(newHeight);
      }
    }, [minHeight, maxHeight, onSizeChange]);

    // Handle input events
    const handleInput = useCallback(
      (e: React.FormEvent<HTMLTextAreaElement>) => {
        // Call original onInput if provided
        if (onInput) {
          onInput(e);
        }
        // Adjust height after input
        requestAnimationFrame(adjustHeight);
      },
      [onInput, adjustHeight]
    );

    // Handle change events (for controlled components)
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Call original onChange if provided
        if (onChange) {
          onChange(e);
        }
        // Adjust height after change
        requestAnimationFrame(adjustHeight);
      },
      [onChange, adjustHeight]
    );

    // Adjust height when value changes
    useEffect(() => {
      requestAnimationFrame(adjustHeight);
    }, [props.value, adjustHeight]);

    // Set initial height when component mounts
    useEffect(() => {
      if (savedHeight && textareaRef.current) {
        textareaRef.current.style.height = `${savedHeight}px`;
        setHeight(savedHeight);
      }
      // Also adjust height on mount to handle initial content
      requestAnimationFrame(adjustHeight);
    }, [savedHeight, adjustHeight]);

    return (
      <textarea
        {...props}
        className={cn(
          'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
          className
        )}
        ref={textareaRef}
        style={{ height: `${height}px`, ...props.style }}
        onInput={handleInput}
        onChange={handleChange}
      />
    );
  }
);

AutoExpandingTextarea.displayName = 'AutoExpandingTextarea';

export { AutoExpandingTextarea };
