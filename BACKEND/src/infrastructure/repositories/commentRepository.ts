import type { CommentRepositoryPort } from '../../domain/ports/commentRepository.js';
import { Character } from '../db/models/character.js';
import { Comment } from '../db/models/comment.js';
import type { CharacterCommentRecord } from '../../domain/comment.js';

function mapComment(record: Comment): CharacterCommentRecord {
  return {
    id: Number(record.id),
    characterId: Number(record.characterId),
    content: String(record.content),
    createdAt: record.createdAt ?? new Date(),
    updatedAt: record.updatedAt ?? new Date(),
  };
}

export class CommentRepository implements CommentRepositoryPort {
  constructor(
    private readonly commentModel: typeof Comment,
    private readonly characterModel: typeof Character,
  ) {}

  async listByCharacterApiId(apiId: string | number): Promise<CharacterCommentRecord[]> {
    const character = await this.characterModel.findOne({
      where: {
        apiId: Number(apiId),
      },
    });

    if (!character) {
      return [];
    }

    const comments = await this.commentModel.findAll({
      where: {
        characterId: character.id,
        deletedAt: null,
      },
      order: [['createdAt', 'DESC']],
    });

    return comments.map(mapComment);
  }

  async addForCharacterApiId(apiId: string | number, content: string): Promise<CharacterCommentRecord | null> {
    const character = await this.characterModel.findOne({
      where: {
        apiId: Number(apiId),
      },
    });

    if (!character || !content.trim()) {
      return null;
    }

    const comment = await this.commentModel.create({
      characterId: character.id,
      content: content.trim(),
    });

    return mapComment(comment);
  }

  async softDeleteById(commentId: string | number): Promise<boolean> {
    const [affectedRows] = await this.commentModel.update(
      { deletedAt: new Date() },
      {
        where: {
          id: Number(commentId),
          deletedAt: null,
        },
      },
    );

    return affectedRows > 0;
  }
}
