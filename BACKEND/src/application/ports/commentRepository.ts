import type { CharacterCommentRecord } from '../../domain/comment.js';

export interface CommentRepositoryPort {
  listByCharacterApiId(apiId: string | number): Promise<CharacterCommentRecord[]>;
  addForCharacterApiId(apiId: string | number, content: string): Promise<CharacterCommentRecord | null>;
  softDeleteById(commentId: string | number): Promise<boolean>;
}
