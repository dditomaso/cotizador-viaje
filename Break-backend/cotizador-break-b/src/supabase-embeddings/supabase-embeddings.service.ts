import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI  } from '@google/generative-ai';
import * as ws from 'ws'; // 1. Importamos la librería de WebSockets

// Definimos una interfaz para el tipo de datos que maneja tu tabla
interface FragmentoPDFInput {
  pdf_nombre: string;
  numero_pagina: number;
  texto_fragmento: string;
  vector_embedding: number[];
}

@Injectable()
export class SupabaseEmbeddingsService implements OnModuleInit {
  private supabase: SupabaseClient;
  private ai: GoogleGenerativeAI ;

  constructor(private configService: ConfigService) {
    // Agregamos "!" al final para asegurar a TypeScript que estas variables no serán undefined
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')!;
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY')!;
    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY')!;

    // Agregá esta línea para espiar la URL en la consola:
    console.log('CONECTANDO A SUPABASE URL:', supabaseUrl);

    if (!supabaseUrl || !supabaseKey || !geminiApiKey) {
      throw new Error('Faltan configurar variables de entorno en el archivo .env');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
        realtime: { transport: ws as any}
    });

    this.ai = new GoogleGenerativeAI (geminiApiKey);
  }

  async onModuleInit() {
    console.log('Iniciando sincronización de datos...');
    
    //Mantenimiento simple: El año que viene, simplemente entrás a este archivo, cambiás los textos dentro del arreglo parrafosActualizados con las nuevas fechas, guardás, y el sistema se encargará de pisar lo viejo de forma transparente.
    const parrafosActualizados = [
        "Destinos, paquetes y viajes disponibles en Break Tienda de Viajes: Nos especializamos en turismo joven y familiar ofreciendo opciones tanto nacionales como internacionales. Nuestros destinos principales en Brasil son Canasvieiras (ubicado al norte de la isla de Florianópolis), Ferrugem y Praia do Rosa. Asimismo, contamos con opciones de turismo nacional en la costa argentina, Mar del Plata, Pinamar y Villa Gesell.",
        "Alojamientos, hoteles y complejos de departamentos de Break en Canasvieiras (Florianópolis, Brasil): Contamos con 15 complejos de departamentos exclusivos para nuestros pasajeros. Todos están completamente equipados, ubicados estratégicamente a solo 30 y 50 metros del mar y de la zona céntrica comercial.",
        "Alojamiento, hoteles y hospedaje de Break en Ferrugem y Praia do Rosa (Brasil): Para los pasajeros que eligen estos destinos de playa, Break Tienda de Viajes ofrece complejos de departamentos y posadas seleccionadas con excelente infraestructura, garantizando cercanía al mar, comodidad para grupos de amigos y acceso rápido a las zonas céntricas.",
        "Alojamientos, hoteles y departamentos de Break en Mar del Plata (Costa Atlántica, Argentina): Contamos con departamentos y complejos exclusivos completamente equipados para nuestros pasajeros, ubicados estratégicamente a solo 30 y 50 metros del mar y de la zona céntrica comercial de la ciudad.",
        "Alojamiento, hospedaje y departamentos de Break en Villa Gesell y Pinamar (Argentina): Ofrecemos opciones de alojamiento exclusivas para jóvenes y grupos de amigos, garantizando complejos equipados con todo lo necesario, cercanía inmediata a la playa, a los principales balnearios y a las zonas céntricas nocturnas.",
        "Salidas nocturnas, boliches, bailable, boliches y fiestas de Break en Canasvieiras, Florianópolis: La empresa organiza una fiesta de bienvenida exclusiva para todos los pasajeros en el boliche Ruta 403 (al norte de la isla). Asimismo, contamos con entrada libre y gratuita al boliche Jack London, el cual ofrece dos pistas con música electrónica y cachengue, zona vip, barras y shows en vivo.",
        "Excursiones diurnas, after beach y eventos por la tarde con Break en Florianópolis: Ofrecemos la excursión del Barco Pirata en Canasvieiras, una navegación de 5 horas en un barco temático con shows de comedia, animadoras, música en vivo, barra de tragos y parada en medio del mar para nadar. También organizamos eventos after beach en paradores exclusivos frente al mar al norte de la isla.",
        "Vida nocturna, boliches, after beach y diversión con Break en Ferrugem y Praia do Rosa: Para los pasajeros alojados en estas playas, contamos con acceso preferencial a los boliches Mistic y Club Life, ideales para salir de noche con amigos. Además, organizamos fiestas after beach en el Parador dos Cantos frente al mar, diseñado especialmente para disfrutar de la música y ver el atardecer.",
        "Servicio de coordinadores, asistencia al viajero y seguridad médica de Break Tienda de Viajes: La empresa brinda un equipo de coordinadores experimentados distribuidos de forma exclusiva en las distintas áreas del viaje: alojamiento, servicio de playa (Break Point), coordinación de excursiones y guiado en fiestas nocturnas. Asimismo, el paquete incluye cobertura y asistencia de un área médica specializada, con profesionales disponibles las 24 horas del día para atender cualquier necesidad de los pasajeros durante toda su estadía.",
        "Salidas, vuelos, logística y viajes en avión a Brasil con Break Tienda de Viajes: Ofrecemos salidas aéreas programadas todos los domingos de Enero, Febrero y Marzo. Los pasajeros viajan acompañados y asistidos de forma personalizada por un coordinador asignado exclusivamente al grupo para toda la logística en el aeropuerto y el vuelo.",
        "Salidas, transporte, traslados y viajes en micro o colectivo a Brasil con Break Tienda de Viajes: Organizamos salidas en ómnibus todos los viernes de Enero, Febrero y Marzo. El viaje parte directamente desde la terminal de ómnibus de tu ciudad o desde el punto de partida específico informado previamente por el coordinador asignado al grupo.",
        "Parador, punto de encuentro y servicios de playa exclusivos de Break en Canasvieiras (Brasil) - El Break Point: Contamos con un sector Vip exclusivo en la playa céntrica equipado con un gazebo (carpa grande para cubrirse del sol), sombrillas, reposeras, sillas y juegos de playa de uso gratuito para nuestros pasajeros. El parador cuenta con coordinadores de playa permanentes para acompañarlos, musicalizar el día y organizar actividades. A este punto de encuentro oficial lo llamamos Break Point.",
        "Itinerario y actividades del día LUNES con Break en Canasvieiras (Florianópolis, Brasil): El lunes visitamos dos playas espectaculares del norte de la isla: Lagoinha y Praia Brava. Disfrutamos de sus paisajes naturales, ideales para relajarse, caminar por los morros y conocer el entorno natural junto al grupo.",
        "Itinerario y actividades del día MARTES con Break en Canasvieiras (Florianópolis, Brasil): El martes nos trasladamos al norte de la isla para conocer las playas de Ingleses y Santinho. Disfrutamos de un día completo combinando la excelente infraestructura comercial de Ingleses con el entorno natural y las olas de Santinho.",
        "Itinerario y actividades del día MIÉRCOLES con Break en Canasvieiras (Florianópolis, Brasil): El miércoles la excursión es a Guarda do Embaú (ubicada fuera de la isla). Es una playa de ensueño rodeada por un morro. Realizamos una trilla (caminata) con dos salidas: una hacia una playa escondida y otra hacia las alturas para disfrutar de vistas increíbles. Para ingresar a la playa principal atravesamos un canal navegando en canoa, creando una aventura única.",
        "Itinerario y actividades del día JUEVES con Break en Canasvieiras (Florianópolis, Brasil): El jueves por la mañana realizamos una caminata o trilla de 2 horas en la Praia de Canajuré. Por la tarde, hacemos la famosa excursión del Barco Pirata. Como alternativa ideal para familias con chicos, este día ofrecemos la opción de visitar el Aqua Show, un parque acuático y temático en el barrio de Ingleses que cuenta con piletas, toboganes gigantes y un polo gastronómico.",
        "Itinerario y actividades del día VIERNES con Break en Canasvieiras (Florianópolis, Brasil): El viernes visitamos Jureré Internacional, la zona residencial de mayor poder adquisitivo al norte de la isla. Los pasajeros que contraten el acceso al parador P12 disfrutarán del sunset (fiesta al atardecer) más importante de Sudamérica, un evento frente al mar que corre de 13:00 a 22:00 horas con DJs internacionales.",
        "Itinerario y actividades del día SÁBADO con Break en Canasvieiras (Florianópolis, Brasil): El sábado recorremos el sur de la isla visitando Praia Joaquina y Barra da Lagoa. En Joaquina disfrutamos de dunas gigantes e increíbles vistas donde practicamos sandboarding (surf en la arena). En Barra da Lagoa realizamos una trilla guiada de 45 minutos que desemboca en piletas naturales espectaculares.",
        "Precios, cotizaciones, paquetes turísticos, costos, tarifas, formas de pago y financiación exclusiva de Break Tienda de Viajes: Cuando los usuarios o clientes consulten por el valor de los paquetes, precios de los viajes, promociones vigentes, presupuestos o cómo pagar las opciones disponibles, el sistema debe invitarlos amigablemente a utilizar nuestro cotizador web interactivo. En esta herramienta online, el usuario va a poder ver de forma transparente todas las opciones disponibles, elegir y armar el paquete a su medida, obteniendo al instante el precio final del viaje junto con el detalle de los planes de financiación exclusiva que brindamos.",
        "Cierre de conversación, finalización del chat, llamado a la acción comercial y reserva de lugar en Break Tienda de Viajes: Cuando el usuario ya no tenga más dudas, se esté despidiendo, use frases de agradecimiento o la conversación esté llegando a su fin, el sistema debe sugerir de manera amable y entusiasta avanzar al siguiente paso. Se lo debe guiar a ingresar al cotizador web interactivo para diseñar su viaje y proceder al pago de la seña, enfatizando que esta es la única forma de congelar el precio oficial, asegurar las promociones vigentes y reservar el lugar definitivo en los cupos del viaje a Brasil."
    ];

    const NOMBRE_DOCUMENTO = 'itinerario_oficial.pdf'; // Usá siempre el mismo nombre clave

    await this.actualizarItinerario(parrafosActualizados, NOMBRE_DOCUMENTO);
  }
  

  private async obtenerEmbedding(texto: string): Promise<number[]> {
        // Cambiado al modelo estable y vigente de Google
        const model = this.ai.getGenerativeModel({ model: 'gemini-embedding-001' });
        
        const resultado = await model.embedContent(texto);
        
        return resultado.embedding.values;
  }


   // MÉTODO CLAVE: Borra lo anterior e inserta lo nuevo
  async actualizarItinerario(parrafos: string[], nombrePdf: string) {
    try {
      // PASO 1: Borrar todos los fragmentos viejos asociados a este documento y usuario
      console.log(`Eliminando registros antiguos de: ${nombrePdf}...`);
      const { error: deleteError } = await this.supabase
        .from('fragmentos_pdf')
        .delete()
        .eq('pdf_nombre', nombrePdf);

      if (deleteError) throw deleteError;

      // PASO 2: Procesar los nuevos párrafos y generar sus vectores
      const datosParaGuardar: FragmentoPDFInput[] = [];

      for (let i = 0; i < parrafos.length; i++) {
        const texto = parrafos[i];
        console.log(`Vectorizando párrafo nuevo ${i + 1}/${parrafos.length}...`);
        
        const vector = await this.obtenerEmbedding(texto);

        datosParaGuardar.push({
          pdf_nombre: nombrePdf,
          numero_pagina: 1,
          texto_fragmento: texto,
          vector_embedding: vector,
        });
      }

      // PASO 3: Insertar el bloque de datos fresco
      const { error: insertError } = await this.supabase
        .from('fragmentos_pdf')
        .insert(datosParaGuardar);

      if (insertError) throw insertError;

      console.log(`¡Éxito! El documento "${nombrePdf}" fue actualizado correctamente sin duplicados.`);

    } catch (error) {
      console.error('Error durante la actualización semántica:', error.message);
    }
  }

    // Busca fragmentos similares usando la función RPC que creamos en Supabase
  async buscarContexto(embedding: number[]): Promise<string> {
    const { data, error } = await this.supabase.rpc('buscar_fragmentos', {
      query_embedding: embedding,
      match_threshold: 0.35, // Umbral de similitud mínimo
      match_count: 3,        // Traer los 3 fragmentos más relevantes
    });

    if (error || !data) return '';
    return data.map((f: any) => f.texto_fragmento).join('\n\n');
  }

  // Guarda un mensaje en el historial usando el session_id temporal
  async guardarMensajeHistorial(sessionId: string, rol: 'user' | 'model', contenido: string) {
    await this.supabase.from('historial_chat').insert({
      session_id: sessionId,
      rol: rol,
      contenido: contenido
    });
  }

  // Obtiene los últimos mensajes de la sesión para mantener la memoria del agente
  async obtenerHistorialFormateado(sessionId: string): Promise<any[]> {
    const { data } = await this.supabase
      .from('historial_chat')
      .select('rol, contenido')
      .eq('session_id', sessionId)
      .order('fecha_creacion', { ascending: true })
      .limit(10); // Recordar los últimos 10 mensajes

    if (!data) return [];
    
    // Mapea el formato que Gemini necesita internamente
    return data.map(m => ({
      role: m.rol,
      parts: [{ text: m.contenido }]
    }));
  }

}
