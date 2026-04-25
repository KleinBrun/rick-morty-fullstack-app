import type { CacheStorePort } from '../domain/ports/cacheStore.js';
import type { CommentRepositoryPort } from '../domain/ports/commentRepository.js';
import type { CharacterCommentRecord } from '../domain/comment.js';

export class AddCommentUseCase {
  constructor(
    private readonly repository: CommentRepositoryPort,
    private readonly cache: CacheStorePort,
  ) {}

  async execute(characterId: string, content: string): Promise<CharacterCommentRecord | null> {
    const result = await this.repository.addForCharacterApiId(characterId, content.trim());
    if (result) { await this.cache.delete(`comments:${characterId}`); }
    return result;
  }
}
