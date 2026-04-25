import type { CacheStorePort } from '../domain/ports/cacheStore.js';
import type { CommentRepositoryPort } from '../domain/ports/commentRepository.js';

export class SoftDeleteCommentUseCase {
  constructor(
    private readonly repository: CommentRepositoryPort,
    private readonly cache: CacheStorePort,
  ) {}

  async execute(commentId: string): Promise<boolean> {
    const wasDeleted = await this.repository.softDeleteById(commentId);

    if (wasDeleted) {
      await this.cache.deleteByPrefix('comments:');
    }

    return wasDeleted;
  }
}
