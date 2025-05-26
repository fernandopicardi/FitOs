
'use server';
/**
 * @fileOverview Fluxo Genkit para gerar um plano de treino inteligente.
 *
 * - generateWorkoutPlan - Função que lida com a geração do plano de treino.
 * - GenerateWorkoutPlanInput - O tipo de entrada para a função generateWorkoutPlan.
 * - GenerateWorkoutPlanOutput - O tipo de retorno para a função generateWorkoutPlan.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { AISimplifiedExercise } from '@/types';

// Esquema de Entrada
const GenerateWorkoutPlanInputSchema = z.object({
  planName: z.string().describe("O nome desejado para o plano de treino (ex: 'Treino Rápido de Peito e Tríceps')."),
  planDescription: z.string().optional().describe("Uma descrição opcional para o plano de treino."),
  categories: z.array(z.string()).min(1).describe("Pelo menos uma categoria ou estilo de treino preferido (ex: Força, HIIT, Mobilidade)."),
  muscleGroups: z.array(z.string()).min(1).describe("Pelo menos um grupo muscular principal a ser focado (ex: Peito, Costas, Pernas)."),
  availableEquipment: z.array(z.string()).min(1).describe("Lista de equipamentos de fitness disponíveis (ex: Argolas, Kettlebell, Superbands, Rodinha Abdominal, Calistenia, Halteres, Barra, Peso Corporal)."),
  durationMinutes: z.number().positive().min(15).max(180).describe("Tempo total disponível para a sessão de treino em minutos (entre 15 e 180 minutos)."),
  availableExercises: z.array(z.object({
    id: z.string(),
    name: z.string(),
    muscleGroup: z.string(),
    workoutType: z.array(z.string()),
  })).min(1).describe("Uma lista de exercícios existentes que a IA deve priorizar. Forneça o ID, nome, grupo muscular principal e tipos de treino para cada um."),
});
export type GenerateWorkoutPlanInput = z.infer<typeof GenerateWorkoutPlanInputSchema>;

// Esquemas de Saída Aninhados
const GeneratedPlannedExerciseSchema = z.object({
  exerciseId: z.string().describe("OBRIGATÓRIO: O ID do exercício escolhido da lista 'availableExercises' fornecida na entrada. NÃO invente um ID."),
  name: z.string().describe("OBRIGATÓRIO: O nome do exercício. Deve corresponder exatamente ao nome do exercício para o 'exerciseId' escolhido da lista fornecida."),
  emoji: z.string().describe("OBRIGATÓRIO: O emoji para o exercício. Deve corresponder exatamente ao emoji do exercício para o 'exerciseId' escolhido da lista fornecida (ou um emoji apropriado se não estiver na lista de input, mas o exercício sim)."),
  sets: z.string().describe("Número recomendado de séries (ex: '3', '3-4', '4 rounds')."),
  reps: z.string().describe("Número recomendado de repetições ou duração (ex: '8-12', '15', '30s')."),
  rest: z.string().optional().describe("Tempo de descanso recomendado entre as séries (ex: '60s', '1-2min', 'Conforme necessário')."),
  notes: z.string().optional().describe("Notas específicas, dicas ou observações para este exercício na sessão (curtas e úteis)."),
});

const GeneratedWorkoutSessionSchema = z.object({
  name: z.string().describe("Um nome descritivo para esta sessão de treino (ex: 'Foco em Peito e Tríceps', 'Circuito de Corpo Inteiro', 'Sessão Principal')."),
  notes: z.string().optional().describe("Notas gerais para esta sessão de treino específica."),
  exercises: z.array(GeneratedPlannedExerciseSchema).min(1).describe("Uma lista de exercícios planejados para esta sessão. Deve haver pelo menos 1 exercício."),
});

const GenerateWorkoutPlanOutputSchema = z.object({
  name: z.string().describe("O nome do plano de treino gerado. Deve ser o 'planName' fornecido na entrada ou um refinamento criativo dele."),
  description: z.string().optional().describe("A descrição do plano de treino gerado."),
  sessions: z.array(GeneratedWorkoutSessionSchema).min(1).describe("Uma lista de sessões de treino. Para uma única geração de treino, geralmente conterá uma sessão, mas pode ter mais se fizer sentido para a duração e objetivos."),
});
export type GenerateWorkoutPlanOutput = z.infer<typeof GenerateWorkoutPlanOutputSchema>;


// Função exportada que chama o fluxo
export async function generateWorkoutPlan(input: GenerateWorkoutPlanInput): Promise<GenerateWorkoutPlanOutput> {
  if (!input.availableExercises || input.availableExercises.length === 0) {
    // Tenta carregar PRELOADED_EXERCISES como fallback se não for fornecido
    // Isso é uma simplificação para teste; idealmente, o frontend sempre forneceria.
    // const { PRELOADED_EXERCISES } = await import('@/constants/exercises'); // Dynamic import
    // input.availableExercises = PRELOADED_EXERCISES.map(ex => ({
    //   id: ex.id,
    //   name: ex.name,
    //   muscleGroup: ex.muscleGroup as string,
    //   workoutType: ex.workoutType as string[],
    // }));
    // if (!input.availableExercises || input.availableExercises.length === 0) {
       throw new Error("A lista de exercícios disponíveis não pode estar vazia e não pôde ser carregada como fallback.");
    // }
  }
  return smartWorkoutPlanFlow(input);
}

const systemPrompt = `
Você é FitOS AI, um personal trainer especialista em criar planos de treino personalizados, eficazes e seguros.
Sua tarefa é gerar um plano de treino com base nas preferências do usuário.

**Instruções Críticas:**
1.  **Estrutura da Resposta:** Sua resposta DEVE estar em formato JSON e seguir EXATAMENTE o schema de saída fornecido.
2.  **Seleção de Exercícios:**
    *   Você receberá uma lista de 'availableExercises' com ID, nome, grupo muscular e tipos de treino.
    *   Para CADA exercício no plano gerado, você DEVE escolher um exercício desta lista 'availableExercises'.
    *   No campo 'exerciseId' do exercício planejado, você DEVE usar o 'id' exato do exercício escolhido. NÃO invente IDs.
    *   Os campos 'name' e 'emoji' do exercício planejado DEVEM corresponder exatamente aos do exercício escolhido da lista 'availableExercises'. Se o exercício da lista não tiver um emoji, você pode sugerir um emoji apropriado.
    *   Priorize exercícios que correspondam aos 'muscleGroups', 'categories' e 'availableEquipment' fornecidos pelo usuário.
3.  **Duração:** O plano (ou a soma das sessões, se gerar múltiplas) deve tentar se adequar à 'durationMinutes' especificada. Considere o número de exercícios, séries, repetições e descansos. Se a duração for curta, gere menos exercícios ou sessões.
4.  **Equipamento:** Use APENAS os equipamentos listados em 'availableEquipment'. Se 'Peso Corporal' estiver na lista, você pode incluir exercícios calistênicos.
5.  **Séries, Reps, Descanso:** Forneça recomendações realistas e apropriadas para os 'sets', 'reps' e 'rest' (opcional). Para 'sets' e 'reps', use formatos como "3-4" ou "8-12" ou "30s".
6.  **Notas:** As 'notes' para exercícios e sessões devem ser concisas, úteis e motivadoras.
7.  **Nome e Descrição do Plano:** Use o 'planName' e 'planDescription' fornecidos pelo usuário como base para a saída.
8.  **Sessões:** Você pode gerar uma ou mais sessões ('sessions') se achar apropriado para a duração e os objetivos. Cada sessão deve ter um nome e pelo menos um exercício.

**Exercícios Disponíveis para Escolha (use o 'id' exato para 'exerciseId'):**
{{#each availableExercises}}
- ID: {{{id}}}, Nome: {{{name}}}, Emoji: (use o emoji do exercício se disponível, ou sugira um), Grupo Muscular: {{{muscleGroup}}}, Tipos: {{#each workoutType}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Analise cuidadosamente as preferências do usuário e a lista de exercícios disponíveis antes de construir o plano.
Certifique-se de que cada 'exerciseId' na sua resposta JSON exista na lista 'availableExercises' que foi fornecida.
`;

const smartWorkoutPlannerPrompt = ai.definePrompt({
  name: 'smartWorkoutPlannerPrompt',
  input: { schema: GenerateWorkoutPlanInputSchema },
  output: { schema: GenerateWorkoutPlanOutputSchema },
  prompt: systemPrompt,
  // model: 'gemini-1.5-flash-latest', // Modelo mais recente pode ser melhor
  // config: { 
  //   temperature: 0.6, // Um pouco de criatividade, mas ainda focado
  // }
});

const smartWorkoutPlanFlow = ai.defineFlow(
  {
    name: 'smartWorkoutPlanFlow',
    inputSchema: GenerateWorkoutPlanInputSchema,
    outputSchema: GenerateWorkoutPlanOutputSchema,
  },
  async (input) => {
    const { output, usage } = await smartWorkoutPlannerPrompt(input);

    if (!output) {
      throw new Error('A IA não conseguiu gerar um plano de treino. Tente refinar suas preferências ou verificar o log para mais detalhes.');
    }
    
    // Validação e correção pós-geração (essencial)
    output.sessions.forEach(session => {
      session.exercises.forEach(plannedExercise => {
        const sourceExercise = input.availableExercises.find(ex => ex.id === plannedExercise.exerciseId);
        if (!sourceExercise) {
          console.warn(`Alerta IA: exerciseId '${plannedExercise.exerciseId}' (Nome: ${plannedExercise.name}) não encontrado na lista de entrada. Isso causará erro no frontend.`);
          // TRATAMENTO DE ERRO: Idealmente, o prompt deveria evitar isso.
          // Como fallback, poderia tentar encontrar por nome se o ID falhar, ou remover o exercício.
          // Por ora, lançamos um erro mais específico para debugging.
          throw new Error (`IA gerou um exerciseId inválido: ${plannedExercise.exerciseId} para o exercício ${plannedExercise.name}. Verifique o prompt ou a lógica da IA.`);
        } else {
          // Garante que o nome e emoji do plano gerado correspondem à fonte de dados
          // para evitar inconsistências se a IA desviar.
          plannedExercise.name = sourceExercise.name;
          // O emoji não está no AISimplifiedExercise, então o que a IA gerar é o que temos.
          // Se estivesse, faríamos: plannedExercise.emoji = sourceExercise.emoji;
        }
      });
    });

    return output;
  }
);
