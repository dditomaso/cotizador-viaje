import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseEmbeddingsService } from './supabase-embeddings.service';

describe('SupabaseEmbeddingsService', () => {
  let service: SupabaseEmbeddingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupabaseEmbeddingsService],
    }).compile();

    service = module.get<SupabaseEmbeddingsService>(SupabaseEmbeddingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
