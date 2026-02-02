'use client';

import { useState, useEffect } from 'react';
import { JunieReactionType, JUNIE_REACTIONS } from './junieReactions';

interface JunieProps {
  reaction: JunieReactionType;
}

/**
 * Junie mascot component - Cat mascot providing game feedback
 *
 * Fixed position in bottom-left corner.
 * Shows emoji with animated speech bubble that fades after 1.5s.
 */
export function Junie({ reaction }: JunieProps) {
  const [showBubble, setShowBubble] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<JunieReactionType>('idle');

  const reactionData = JUNIE_REACTIONS[currentReaction];

  useEffect(() => {
    if (reaction !== 'idle') {
      setCurrentReaction(reaction);
      setShowBubble(true);

      // Hide bubble after 1.5 seconds
      const timer = setTimeout(() => {
        setShowBubble(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [reaction]);

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-end gap-2">
      {/* Mascot emoji - large size for visibility */}
      <div className="text-5xl select-none" role="img" aria-label="Junie the cat mascot">
        {reactionData.emoji}
      </div>

      {/* Speech bubble with fade animation */}
      {showBubble && reactionData.text && (
        <div
          className="relative bg-white text-gray-900 px-3 py-2 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-200"
          style={{
            animation: 'fadeInOut 1.5s ease-in-out forwards'
          }}
        >
          {/* Speech bubble tail */}
          <div className="absolute left-0 bottom-2 -translate-x-2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent" />
          {reactionData.text}
        </div>
      )}

      {/* CSS for fade animation */}
      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-8px); }
          15% { opacity: 1; transform: translateX(0); }
          85% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
