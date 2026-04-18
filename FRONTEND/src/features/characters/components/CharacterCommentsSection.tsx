import { useCharacterCommentsSection } from '../hooks/useCharacterCommentsSection';
import type { CharacterCommentsSectionProps } from '../types/ui.types';

export function CharacterCommentsSection({ comments, onAddComment, onDeleteComment, originName }: CharacterCommentsSectionProps) {
    const {
        draftComment,
        setDraftComment,
        textareaRef,
        scrollCommentIntoView,
        handleSubmit,
    } = useCharacterCommentsSection({ onAddComment });

    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900">Comments</h2>
                <p className="text-xs text-slate-400">Origin: {originName}</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <textarea
                    ref={textareaRef}
                    value={draftComment}
                    onChange={(event) => setDraftComment(event.target.value)}
                    onFocus={() => {
                        scrollCommentIntoView();
                        window.setTimeout(scrollCommentIntoView, 250);
                        window.setTimeout(scrollCommentIntoView, 500);
                    }}
                    rows={4}
                    placeholder="Write a note about this character"
                    className="w-full scroll-mt-24 scroll-mb-40 rounded-2xl border border-slate-200 px-3 py-3 text-base text-slate-700 outline-none transition focus:border-[#8757D1] md:text-sm"
                />

                <button
                    type="submit"
                    disabled={!draftComment.trim()}
                    className="rounded-full bg-[#8757D1] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#673FAC] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Save comment
                </button>
            </form>

            <div className="mt-4 space-y-2">
                {comments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        No comments yet. Leave the first note for this character.
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p>{comment.content}</p>
                                    <p className="mt-1 text-[11px] text-slate-400">{new Date(comment.createdAt).toLocaleString()}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onDeleteComment(comment.id)}
                                    className="rounded-full px-2 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
