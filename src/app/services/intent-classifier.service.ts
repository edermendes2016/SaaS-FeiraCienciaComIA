import { Injectable } from '@angular/core';

export type ClassificationResult =
  | { allowed: true; reason: string; suggestion: string }
  | { allowed: false; reason: string; suggestion: string };

/**
 * IntentClassifierService
 * Implementa as regras do guardião de conteúdo.
 * Bloqueia qualquer tema que não tenha relação com feira de ciências.
 */
@Injectable({ providedIn: 'root' })
export class IntentClassifierService {

  private readonly FORBIDDEN_KEYWORDS = [
    'comida', 'receita', 'jogo', 'game', 'futebol', 'filme', 'fofoca', 'musica', 'canção',
    'política', 'meme', 'venda', 'comprar', 'preço', 'investimento', 'cripto', 'fortnite',
    'minecraft', 'roblox', 'free fire', 'tiktok', 'instagram', 'novela', 'anime'
  ];

  private readonly ALLOWED_CONTEXTS = [
    'experimento', 'projeto', 'ciência', 'feira', 'escola', 'estudo', 'pesquisa',
    'reação', 'observação', 'maquete', 'protótipo', 'demonstração', 'química', 'física',
    'biologia', 'astronomia', 'ecologia', 'sustentabilidade', 'tecnologia', 'fenômeno',
    'hipótese', 'análise', 'conclusão', 'vulcão', 'energia', 'solar', 'eólica'
  ];

  classify(topic: string): ClassificationResult {
    const t = topic.toLowerCase().trim();

    // 1. Validação de tamanho mínimo
    if (t.length < 3) {
      return {
        allowed: false,
        reason: 'O tema é curto demais para ser um projeto científico.',
        suggestion: 'Tente descrever melhor sua ideia, como "Efeito da poluição na água".'
      };
    }

    // Contexto forte para salvação de palavras "proibidas"
    const strongContexts = [
      'física', 'química', 'biologia', 'matemática', 'ciência', 'trajetória',
      'gravidade', 'velocidade', 'termodinâmica', 'cinética', 'energia', 'força',
      'programação', 'algoritmo', 'probabilidade', 'estatística'
    ];
    const hasStrongContext = strongContexts.some(k => t.includes(k));

    // 2. Bloqueio por palavras proibidas (Entretenimento/Genérico)
    const foundForbidden = this.FORBIDDEN_KEYWORDS.find(k => t.includes(k));

    // Se achou palavra proibida, mas NÃO tem um forte contexto científico justificando, bloqueia.
    if (foundForbidden && !hasStrongContext) {
      return {
        allowed: false,
        reason: `O tema "${topic}" parece ser sobre entretenimento ou assuntos genéricos sem ligação clara com a ciência.`,
        suggestion: 'Se quiser usar jogos ou filmes, tente ligar à ciência! Ex: "A Física das Trajetórias no Free Fire / Fortnite " ou "A probabilidade no Minecraft".'
      };
    }

    // 3. Verificação de contexto científico
    const hasContext = this.ALLOWED_CONTEXTS.some(k => t.includes(k));
    const isDescriptive = t.split(' ').length >= 3;

    // Se a pesquisa for muito curta e sem contexto científico claro
    if (!isDescriptive && !hasContext && !hasStrongContext) {
      return {
        allowed: false,
        reason: `A pesquisa "${topic}" é muito genérica ou carece de contexto científico experimental.`,
        suggestion: `Tente transformar sua ideia em algo investigativo. Por exemplo: "A ciência por trás de um ${topic}".`
      };
    }

    return {
      allowed: true,
      reason: '',
      suggestion: ''
    };
  }
}
