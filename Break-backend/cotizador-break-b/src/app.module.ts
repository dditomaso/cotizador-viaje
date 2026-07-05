import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseEmbeddingsService } from './supabase-embeddings/supabase-embeddings.service';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat/chat.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables estén disponibles en todo el proyecto
    }),
  ],
  controllers: [AppController, ChatController],
  providers: [AppService, SupabaseEmbeddingsService],
})
export class AppModule {}
