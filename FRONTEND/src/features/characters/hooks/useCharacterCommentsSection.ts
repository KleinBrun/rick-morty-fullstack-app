import { useCallback, useEffect, useRef, useState } from 'react';
import type { CharacterCommentsSectionProps } from '../types/ui.types';

export function useCharacterCommentsSection({ onAddComment }: Pick<CharacterCommentsSectionProps, 'onAddComment'>) {
  const [draftComment, setDraftComment] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollCommentIntoView = useCallback(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 768 || !textareaRef.current) {
      return;
    }
    textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }
    const handleViewportChange = () => {
      if (document.activeElement === textareaRef.current) {
        scrollCommentIntoView();
      }
    };
    window.visualViewport.addEventListener('resize', handleViewportChange);
    window.visualViewport.addEventListener('scroll', handleViewportChange);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleViewportChange);
    };
  }, [scrollCommentIntoView]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedComment = draftComment.trim();
    if (!trimmedComment) return;
    onAddComment(trimmedComment);
    setDraftComment('');
  };

  return {
    draftComment,
    setDraftComment,
    textareaRef,
    scrollCommentIntoView,
    handleSubmit,
  };
}
