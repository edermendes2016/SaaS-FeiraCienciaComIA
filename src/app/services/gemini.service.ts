import { Injectable, inject } from '@angular/core';
import { VertexAI, getGenerativeModel } from '@angular/fire/vertexai';
import { from, Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface GeneratedProject {
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  checklist: { label: string; phase: string }[];
  tasks: { role: string; icon: string; color: string; items: string[]; hours: string }[];
  materials: { name: string; quantity: string }[];
  explanation: {
    concept: string;
    whyItHappens: string;
    realWorldApplication: string;
    presentationQnA: { question: string; answer: string }[];
  };
  youtubeQuery: string;
}

export interface ExecutionProtocol {
  steps: { title: string; detail: string; safety: string }[];
  observations: string[];
}

export interface ProjectReport {
  introduction: string;
  methodology: string;
  expectedResults: string;
  conclusionTemplate: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private vertexAI = inject(VertexAI);
  private model = getGenerativeModel(this.vertexAI, {
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });

  private readonly SYSTEM_PROMPT = `
    Você é um orientador de Feira de Ciências especialista em Ensino Médio.
    Sua missão é capacitar o aluno a entender profundamente seu projeto para que ele possa explicá-lo com confiança em uma apresentação.

    DIRETRIZES PEDAGÓGICAS:
    1. CONCEITO PROFUNDO: Não simplifique demais. Explique os mecanismos físicos/químicos/biológicos por trás do fenômeno.
    2. CONEXÃO REAL: Sempre conecte o experimento com aplicações industriais ou fenômenos da natureza em larga escala.
    3. PREPARAÇÃO PARA BANCA: Gere perguntas provocativas que um avaliador faria e forneça respostas que demonstrem domínio científico.
    4. EVITE REFORÇO VAZIO: Não use frases como "Bom trabalho" ou "Isso é legal". Foque 100% no conteúdo técnico e didático.
    5. SEGURANÇA: O projeto deve ser viável e seguro para o ambiente escolar.
    6. GAMIFICAÇÃO CIENTÍFICA: Se o tema envolver jogos (ex: Free Fire, Fortnite, Minecraft), abrace a ideia! Relacione mecânicas virtuais (como balística, construção ou queda livre) com as leis rigorosas da física e matemática do mundo real.
  `;

  generateProject(topic: string, subject: string, difficulty: string): Observable<GeneratedProject> {
    const prompt = `Gere um projeto de feira de ciências (JSON) sobre: "${topic}". Matéria: ${subject}. Dificuldade: ${difficulty}.
    ESTRUTURA JSON OBRIGATÓRIA:
    {
      "title": "Título",
      "description": "Resumo",
      "subject": "Matéria",
      "difficulty": "fácil/médio/avançado",
      "checklist": [{"label": "...", "phase": "..."}],
      "tasks": [{"role": "...", "icon": "...", "color": "...", "items": ["..."], "hours": "..."}],
      "materials": [{"name": "...", "quantity": "..."}],
      "explanation": {
        "concept": "O que é este projeto?",
        "whyItHappens": "A explicação científica do porquê o fenômeno ocorre",
        "realWorldApplication": "Como isso se aplica na vida real/indústria?",
        "presentationQnA": [{"question": "Pergunta provável do avaliador", "answer": "Resposta sugerida com termos técnicos"}]
      },
      "youtubeQuery": "query de busca"
    }`;

    return this.execute(prompt);
  }

  generateExecutionProtocol(projectTitle: string, description: string): Observable<ExecutionProtocol> {
    const prompt = `Gere um protocolo experimental detalhado para o projeto: "${projectTitle}".
    Resumo: ${description}.
    O JSON deve seguir esta estrutura: { "steps": [{ "title": "nome do passo", "detail": "instrução detalhada", "safety": "aviso de segurança se houver" }], "observations": ["o que observar"] }`;

    return this.execute(prompt);
  }

  generateProjectReport(projectTitle: string, description: string): Observable<ProjectReport> {
    const prompt = `Gere um rascunho de relatório científico para o projeto: "${projectTitle}".
    Resumo: ${description}.
    O JSON deve seguir esta estrutura: { "introduction": "texto", "methodology": "texto", "expectedResults": "texto", "conclusionTemplate": "texto para preencher" }`;

    return this.execute(prompt);
  }

  private execute(prompt: string): Observable<any> {
    const chat = this.model.startChat({
      history: [
        { role: 'user', parts: [{ text: this.SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Entendido. Estou pronto para gerar o conteúdo científico rigoroso e didático em formato JSON.' }] }
      ]
    });

    return from(chat.sendMessage(prompt)).pipe(
      map(result => {
        const responseText = result.response.text();
        return JSON.parse(responseText);
      }),
      catchError(err => {
        const isQuota = err?.code === 'resource-exhausted' || /quota|limit|exceeded/i.test(err?.message);
        if (isQuota) return throwError(() => new Error('FREE_TIER_QUOTA_EXCEEDED'));
        return throwError(() => err);
      })
    );
  }
}
