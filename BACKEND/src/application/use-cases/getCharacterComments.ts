import type { CacheStorePort } from '../ports/cacheStore.js';
import type { CommentRepositoryPort } from '../ports/commentRepository.js';
import type { CharacterCommentRecord } from '../../domain/comment.js';

function buildCommentsCacheKey(characterId: string) {
  return `comments:${characterId}`;
}

export class GetCharacterCommentsUseCase {
  constructor(
    private readonly repository: CommentRepositoryPort,
    private readonly cache: CacheStorePort,
  ) { }

  async execute(characterId: string): Promise<CharacterCommentRecord[]> {
    const cacheKey = buildCommentsCacheKey(characterId);
    const cached = await this.cache.get(cacheKey);

    if (cached) { return JSON.parse(cached) as CharacterCommentRecord[]; }

    const comments = await this.repository.listByCharacterApiId(characterId);
    await this.cache.set(cacheKey, JSON.stringify(comments), 300);

    return comments;
  }
}
