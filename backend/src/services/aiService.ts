import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const GROQ_MODEL = 'llama-3.3-70b-versatile';

const DEVBUDDY_SYSTEM_PROMPT =
  'Você é o DevBuddy, um mentor de carreira para desenvolvedores experiente, direto e motivador. ' +
  'Ajude o usuário com dúvidas técnicas, conselhos de carreira, ou preparação para entrevistas. ' +
  'Seja conciso, profissional e responda sempre em português de Portugal ou Brasil (conforme o tom do usuário).';

/** Helper: chama o Groq e retorna o texto da resposta */
async function chat(
  messages: Groq.Chat.ChatCompletionMessageParam[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 500,
  });
  return completion.choices[0]?.message?.content ?? '';
}

export interface JobMatchAnalysis {
  score: number;
  reason: string;
}

export const analyzeJobMatch = async (
  jobTitle: string,
  jobRequirements: string[],
  jobDescription: string,
  devName: string,
  devSkills: string[],
  devBio: string
): Promise<JobMatchAnalysis> => {
  try {
    const prompt = `Analise objetivamente a compatibilidade técnica entre o programador e a vaga.

Vaga: ${jobTitle}
Requisitos: ${jobRequirements.join(', ')}
Descrição: ${jobDescription}

Candidato: ${devName}
Skills: ${devSkills.join(', ')}
Bio: ${devBio}

Retorne OBRIGATORIAMENTE um JSON válido com EXATAMENTE dois campos:
{
  "score": <número inteiro de 0 a 100>,
  "reason": "<uma frase curta explicando o motivo da nota técnica>"
}

Não inclua nenhum texto adicional além do JSON.`;

    const text = await chat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.1, maxTokens: 200 }
    );

    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis: JobMatchAnalysis = JSON.parse(cleanText);

    if (typeof analysis.score !== 'number' || typeof analysis.reason !== 'string') {
      throw new Error('Resposta da IA em formato inválido');
    }

    analysis.score = Math.max(0, Math.min(100, Math.round(analysis.score)));
    return analysis;
  } catch (error) {
    console.error('Erro ao analisar match com IA:', error);
    return {
      score: 50,
      reason: 'Não foi possível analisar a compatibilidade automaticamente.',
    };
  }
};

export const generateJobDescription = async (
  jobTitle: string,
  companyName: string
): Promise<string> => {
  try {
    const prompt = `Você é um recrutador técnico experiente. Crie uma descrição profissional e atraente para a vaga:

Cargo: ${jobTitle}
Empresa: ${companyName}

A descrição deve incluir:
1. Apresentação do cargo (2-3 frases)
2. Principais responsabilidades (4-5 bullets)
3. O que oferecemos (3-4 bullets)

Use linguagem moderna e envolvente. Seja específico e técnico. Máximo 250 palavras.`;

    return await chat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.7, maxTokens: 500 }
    );
  } catch (error) {
    console.error('Erro ao gerar descrição da vaga:', error);
    return `${companyName} está à procura de um profissional para a posição de ${jobTitle}.`;
  }
};

export const generateJobRequirements = async (
  jobTitle: string
): Promise<string[]> => {
  try {
    const prompt = `Liste exatamente 5 requisitos técnicos essenciais para a vaga de: ${jobTitle}

Retorne APENAS um JSON array de strings, sem nenhum texto adicional:
["tecnologia1", "tecnologia2", "tecnologia3", "tecnologia4", "tecnologia5"]`;

    const text = await chat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.3, maxTokens: 100 }
    );

    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const requirements = JSON.parse(cleanText);
    return Array.isArray(requirements) ? requirements : [];
  } catch (error) {
    console.error('Erro ao gerar requisitos:', error);
    return ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Git'];
  }
};

export const improveResumeForJob = async (
  resumeText: string,
  jobDescription: string
): Promise<string> => {
  try {
    const prompt = `Como especialista em carreiras tech, analise este currículo em relação à vaga:

Currículo:
${resumeText}

Vaga:
${jobDescription}

Dê 3 dicas práticas e específicas de como melhorar este currículo para esta vaga. Seja direto e objetivo (máximo 150 palavras).`;

    return await chat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.6, maxTokens: 300 }
    );
  } catch (error) {
    console.error('Erro ao gerar dicas de currículo:', error);
    return 'Não foi possível gerar dicas no momento. Tente novamente mais tarde.';
  }
};

export const generateInterviewQuestions = async (
  jobDescription: string
): Promise<string[]> => {
  try {
    const prompt = `Baseado nesta descrição de vaga, gere 5 perguntas técnicas relevantes para uma entrevista:

${jobDescription}

Retorne APENAS um JSON array de strings, sem texto adicional:
["pergunta 1?", "pergunta 2?", "pergunta 3?", "pergunta 4?", "pergunta 5?"]`;

    const text = await chat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.5, maxTokens: 400 }
    );

    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(cleanText);
    return Array.isArray(questions) ? questions : [];
  } catch (error) {
    console.error('Erro ao gerar perguntas:', error);
    return [
      'Descreva sua experiência com as tecnologias mencionadas na vaga.',
      'Como você abordaria um problema de performance em produção?',
      'Conte sobre um projeto desafiador que você liderou.',
    ];
  }
};

export const getCareerAdvice = async (
  message: string,
  history: { role: 'user' | 'assistant'; text: string }[]
): Promise<string> => {
  try {
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: DEVBUDDY_SYSTEM_PROMPT },
      ...history.map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.text,
      })),
      { role: 'user', content: message },
    ];

    return await chat(messages, { temperature: 0.7, maxTokens: 500 });
  } catch (error: any) {
    console.error('--- ERRO DETALHADO NO DEVBUDDY ---');
    console.error('Mensagem de erro:', error?.message);
    if (error?.stack) console.error('Stack trace:', error.stack);
    console.error('----------------------------------');
    return 'Desculpe, estou com dificuldades em processar isso agora. Pode tentar novamente em instantes?';
  }
};

export const improveResume = async (
  bio: string,
  skills: string[]
): Promise<string> => {
  try {
    const prompt = `Como um especialista em branding pessoal para tech, reescreva esta bio de forma mais profissional e atraente para recrutadores.
    
Bio atual: ${bio}
Skills: ${skills.join(', ')}
    
A nova bio deve ser concisa, destacar impacto e competência técnica. Máximo 100 palavras.`;

    return await chat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.7, maxTokens: 200 }
    );
  } catch (error) {
    console.error('Erro ao melhorar bio:', error);
    return bio;
  }
};

export const generateSkillRoadmap = async (
  currentSkills: string[]
): Promise<string> => {
  try {
    const prompt = `Com base nas skills atuais: ${currentSkills.join(', ')}, sugira um roadmap de aprendizado para os próximos 6 meses.
Foque em tecnologias complementares e tendências do mercado. 
Retorne em formato markdown conciso com tópicos.`;

    return await chat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.7, maxTokens: 600 }
    );
  } catch (error) {
    console.error('Erro ao gerar roadmap:', error);
    return 'Não foi possível gerar um roadmap no momento.';
  }
};