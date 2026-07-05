import { Controller, Post, Body } from '@nestjs/common';
import { SupabaseEmbeddingsService } from '../supabase-embeddings/supabase-embeddings.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Controller('chat')
export class ChatController {
  private ai: GoogleGenerativeAI;

  constructor(
    private embeddingsService: SupabaseEmbeddingsService,
    private configService: ConfigService
  ) {
    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY')!;
    this.ai = new GoogleGenerativeAI(geminiApiKey);
  }

  @Post()
  async responderConsulta(
    @Body() body: { mensaje: string; sessionId: string }
  ) {
    const { mensaje, sessionId } = body;

    // 1. Guardar el mensaje del usuario en la base de datos
    await this.embeddingsService.guardarMensajeHistorial(sessionId, 'user', mensaje);

    // 2. Buscar Contexto Semántico convirtiendo la pregunta en vector
    const modelEmbedding = this.ai.getGenerativeModel({ model: 'gemini-embedding-001' });
    const embeddingRes = await modelEmbedding.embedContent(mensaje);
    const vectorPregunta = embeddingRes.embedding.values;
    
    const contextoExtraido = await this.embeddingsService.buscarContexto(vectorPregunta);

    // 3. Recuperar memoria previa de la conversación
    const historialPrevio = await this.embeddingsService.obtenerHistorialFormateado(sessionId);

    // 4. Configurar el Agente con su Rol Comercial (System Prompt) y enviarle la consulta
    const modelChat = this.ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `Sos el asistente virtual de 'Break tienda de viajes'.
      
      ⚠️ REGLA DE ORO INMUTABLE (MÁXIMA PRIORIDAD POR PRECIOS):
      - Si preguntan por PRECIOS, COSTOS o mencionan datos del grupo (ej: "somos 5"): PROHIBIDO explicar el itinerario. Responde ÚNICAMENTE:
      "¡Hola! ¡Buenísimo! Como el precio final varía según la logística que elijan, lo ideal es que navegues por nuestra aplicación hacia el cotizador. Allí vas a poder armar el paquete que mejor se ajuste, ver los precios exactos, conocer nuestra financiación exclusiva y poder señar directamente online para reservar tu lugar y congelar el precio."
      
      ⚡ REGLAS PARA RESPUESTAS INFORMATIVAS (CORTAS Y SCANNEABLES):
      - Si te preguntan por cómo es el viaje, qué se hace, boliches o playas, tus respuestas deben ser cortas (máximo 3 o 4 líneas en total).
      - Está PROHIBIDO escribir párrafos largos o bloques de texto denso. La gente no lee textos largos.
      - Estructurá la información usando viñetas cortas, punchis y concisas (frases de menos de 10 palabras).
      - Usá emojis funcionales como ganchos visuales (ej: 🇧🇷, 🚌, 🌊, 🎉).
      - Cerrá siempre con una pregunta cortita para mantener el interés (ej: "¿Te copa?", "¿Querés saber más?").
      
      CONTEXTO DE LA EMPRESA:\n${contextoExtraido}`
    });



    // Iniciamos el chat pasándole el historial de la base de datos
    const chat = modelChat.startChat({
      history: historialPrevio
    });

    const respuestaAi = await chat.sendMessage(mensaje);
    const textoRespuesta = respuestaAi.response.text();

    // 5. Guardar la respuesta del bot en la base de datos para el seguimiento comercial
    await this.embeddingsService.guardarMensajeHistorial(sessionId, 'model', textoRespuesta);

    return { respuesta: textoRespuesta };
  }
}
