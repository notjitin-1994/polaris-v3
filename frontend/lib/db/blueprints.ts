import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import { Blueprint } from '@/lib/ollama/schema';
import { AggregatedAnswer } from '@/lib/services/answerAggregation';

export type BlueprintInsert = Database['public']['Tables']['blueprint_generator']['Insert'];
export type BlueprintRow = Database['public']['Tables']['blueprint_generator']['Row'];

export class BlueprintService {
  private supabase = getSupabaseBrowserClient();

  /**
   * Saves a new blueprint or updates an existing one, incrementing the version.
   * @param userId The ID of the user.
   * @param blueprintJson The generated blueprint in JSON format.
   * @param blueprintMarkdown The generated blueprint in Markdown format.
   * @param aggregatedAnswers The aggregated static and dynamic answers.
   * @param existingBlueprintId Optional. The ID of an existing blueprint to update.
   * @returns The saved or updated blueprint row.
   */
  public async saveBlueprint(
    userId: string,
    blueprintJson: Blueprint,
    blueprintMarkdown: string,
    aggregatedAnswers: AggregatedAnswer,
    existingBlueprintId?: string,
  ): Promise<BlueprintRow> {
    const staticAnswers = aggregatedAnswers.staticResponses;
    const dynamicAnswers = aggregatedAnswers.dynamicResponses;
    // Note: dynamic_questions is not directly available here; assuming it was used to generate dynamic_answers
    // and might be stored separately if needed for historical context.

    if (existingBlueprintId) {
      // Update existing blueprint and increment version
      const { data, error } = await this.supabase.rpc('increment_blueprint_version', {
        blueprint_id_input: existingBlueprintId,
        new_blueprint_json: blueprintJson,
        new_blueprint_markdown: blueprintMarkdown,
        new_static_answers: staticAnswers,
        new_dynamic_answers: dynamicAnswers,
        new_status: 'completed', // Assuming update means completion
      });

      if (error) {
        console.error('Error incrementing blueprint version:', error);
        throw new Error(error.message);
      }
      // The RPC returns a single blueprint row if successful
      return data as BlueprintRow;
    } else {
      // Insert a new blueprint
      const { data, error } = await this.supabase
        .from('blueprint_generator')
        .insert({
          user_id: userId,
          blueprint_json: blueprintJson,
          blueprint_markdown: blueprintMarkdown,
          static_answers: staticAnswers,
          dynamic_answers: dynamicAnswers,
          status: 'completed',
          version: 1, // Initial version
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving new blueprint:', error);
        throw new Error(error.message);
      }
      return data;
    }
  }

  /**
   * Fetches a specific version of a blueprint.
   * @param blueprintId The ID of the blueprint.
   * @param version Optional. The specific version number to fetch. If not provided, fetches the latest.
   * @returns The blueprint row for the specified version.
   */
  public async getBlueprint(blueprintId: string, version?: number): Promise<BlueprintRow | null> {
    let query = this.supabase.from('blueprint_generator').select('*').eq('id', blueprintId);

    if (version !== undefined) {
      query = query.eq('version', version);
    } else {
      // Order by version descending and take the first one to get the latest
      query = query.order('version', { ascending: false }).limit(1);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is 'No rows found'
      console.error('Error fetching blueprint:', error);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Fetches all versions of a blueprint.
   * @param blueprintId The ID of the blueprint.
   * @returns An array of blueprint rows, ordered by version.
   */
  public async getBlueprintVersions(blueprintId: string): Promise<BlueprintRow[]> {
    const { data, error } = await this.supabase
      .from('blueprint_generator')
      .select('*')
      .eq('id', blueprintId)
      .order('version', { ascending: true });

    if (error) {
      console.error('Error fetching blueprint versions:', error);
      throw new Error(error.message);
    }
    return data || [];
  }

  /**
   * Fetches all blueprints for a specific user.
   * @param userId The ID of the user.
   * @returns An array of blueprint rows, ordered by creation date descending.
   */
  public async getBlueprintsByUser(userId: string): Promise<BlueprintRow[]> {
    const { data, error } = await this.supabase
      .from('blueprint_generator')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blueprints by user:', error);
      throw new Error(error.message);
    }
    return data || [];
  }

  /**
   * Creates a new blueprint draft with static answers.
   * @param userId The ID of the user.
   * @param staticAnswers The static answers from the wizard.
   * @returns The created blueprint row.
   */
  public async createBlueprintDraft(
    userId: string,
    staticAnswers: Record<string, unknown>,
  ): Promise<BlueprintRow> {
    const { data, error } = await this.supabase
      .from('blueprint_generator')
      .insert({
        user_id: userId,
        static_answers: staticAnswers,
        dynamic_questions: [],
        dynamic_answers: {},
        blueprint_json: {},
        blueprint_markdown: null,
        status: 'draft',
        version: 1,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blueprint draft:', error);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Checks if a blueprint already has a completed generation.
   * @param blueprintId The ID of the blueprint to check.
   * @returns True if the blueprint has a completed generation, false otherwise.
   */
  public async hasCompletedGeneration(blueprintId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('blueprint_generator')
      .select('status')
      .eq('id', blueprintId)
      .eq('status', 'completed')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking blueprint completion status:', error);
      throw new Error(error.message);
    }

    return !!data;
  }

  /**
   * Checks if a blueprint's static questionnaire is complete.
   * @param blueprintId The ID of the blueprint to check.
   * @returns True if the static questionnaire is complete, false otherwise.
   */
  public async isStaticQuestionnaireComplete(blueprintId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('blueprint_generator')
      .select('static_answers')
      .eq('id', blueprintId)
      .single();

    if (error) {
      console.error('Error checking static questionnaire completion:', error);
      return false;
    }

    if (!data?.static_answers) {
      return false;
    }

    const answers = data.static_answers as Record<string, unknown>;
    
    // Check if all required fields are present and not empty
    const requiredFields = [
      'learningObjective',
      'targetAudience', 
      'deliveryMethod',
      'duration',
      'assessmentType'
    ];

    return requiredFields.every(field => {
      const value = answers[field];
      return value !== null && value !== undefined && value !== '';
    });
  }

  /**
   * Removes duplicate generations for a blueprint, keeping only the latest completed version.
   * @param blueprintId The ID of the blueprint to clean up.
   * @returns The number of duplicate records removed.
   */
  public async removeDuplicateGenerations(blueprintId: string): Promise<number> {
    // Get all versions of the blueprint
    const { data: allVersions, error: fetchError } = await this.supabase
      .from('blueprint_generator')
      .select('id, version, status, created_at')
      .eq('id', blueprintId)
      .order('version', { ascending: false });

    if (fetchError) {
      console.error('Error fetching blueprint versions:', fetchError);
      throw new Error(fetchError.message);
    }

    if (!allVersions || allVersions.length <= 1) {
      return 0; // No duplicates to remove
    }

    // Find the latest completed version
    const latestCompleted = allVersions.find(v => v.status === 'completed');
    if (!latestCompleted) {
      return 0; // No completed versions to keep
    }

    // Delete all other versions (keep only the latest completed)
    const versionsToDelete = allVersions
      .filter(v => v.id !== latestCompleted.id)
      .map(v => v.id);

    if (versionsToDelete.length === 0) {
      return 0;
    }

    const { error: deleteError } = await this.supabase
      .from('blueprint_generator')
      .delete()
      .in('id', versionsToDelete);

    if (deleteError) {
      console.error('Error deleting duplicate generations:', deleteError);
      throw new Error(deleteError.message);
    }

    return versionsToDelete.length;
  }

  /**
   * Updates a blueprint with generated dynamic questions.
   * @param blueprintId The ID of the blueprint to update.
   * @param dynamicQuestions The generated dynamic questions.
   * @returns The updated blueprint row.
   */
  public async updateDynamicQuestions(
    blueprintId: string,
    dynamicQuestions: unknown[],
  ): Promise<BlueprintRow> {
    const { data, error } = await this.supabase
      .from('blueprint_generator')
      .update({
        dynamic_questions: dynamicQuestions,
        status: 'draft', // Keep as draft until dynamic questions are answered
      })
      .eq('id', blueprintId)
      .select()
      .single();

    if (error) {
      console.error('Error updating dynamic questions:', error);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Updates a blueprint with dynamic answers.
   * @param blueprintId The ID of the blueprint to update.
   * @param dynamicAnswers The dynamic answers from the form.
   * @returns The updated blueprint row.
   */
  public async updateDynamicAnswers(
    blueprintId: string,
    dynamicAnswers: Record<string, unknown>,
  ): Promise<BlueprintRow> {
    const { data, error } = await this.supabase
      .from('blueprint_generator')
      .update({
        dynamic_answers: dynamicAnswers,
        status: 'draft', // Keep as draft until blueprint is generated
      })
      .eq('id', blueprintId)
      .select()
      .single();

    if (error) {
      console.error('Error updating dynamic answers:', error);
      throw new Error(error.message);
    }
    return data;
  }
}

export const blueprintService = new BlueprintService();
