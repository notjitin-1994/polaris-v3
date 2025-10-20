import type { SupabaseClient } from '@supabase/supabase-js';

export interface BlueprintUsageInfo {
  creationCount: number;
  savingCount: number;
  creationLimit: number;
  savingLimit: number;
  isExempt: boolean;
  exemptionReason?: string;
  lastCreation?: string;
  lastSaving?: string;
}

export class BlueprintUsageService {
  /**
   * Get blueprint usage information for a user
   */
  static async getBlueprintUsageInfo(
    supabase: SupabaseClient,
    userId: string
  ): Promise<BlueprintUsageInfo> {
    const { data, error } = await supabase.rpc('get_blueprint_usage_info', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching blueprint usage info:', error);
      throw new Error('Failed to fetch blueprint usage information');
    }

    return {
      creationCount: data.creation_count || 0,
      savingCount: data.saving_count || 0,
      creationLimit: data.creation_limit || 2,
      savingLimit: data.saving_limit || 2,
      isExempt: data.is_exempt || false,
      exemptionReason: data.exemption_reason,
      lastCreation: data.last_creation,
      lastSaving: data.last_saving,
    };
  }

  /**
   * Get raw blueprint counts for debugging (bypasses exemption logic)
   */
  static async getRawBlueprintCounts(
    supabase: SupabaseClient,
    userId: string
  ): Promise<{
    totalBlueprints: number;
    completedBlueprints: number;
    draftBlueprints: number;
  }> {
    const { data: blueprints, error } = await supabase
      .from('blueprint_generator')
      .select('status')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching raw blueprint counts:', error);
      throw new Error('Failed to fetch blueprint counts');
    }

    const totalBlueprints = blueprints?.length || 0;
    const completedBlueprints = blueprints?.filter((b) => b.status === 'completed').length || 0;
    const draftBlueprints = blueprints?.filter((b) => b.status === 'draft').length || 0;

    return {
      totalBlueprints,
      completedBlueprints,
      draftBlueprints,
    };
  }

  /**
   * Check if user can create a blueprint
   */
  static async canCreateBlueprint(
    supabase: SupabaseClient,
    userId: string
  ): Promise<{ canCreate: boolean; reason?: string }> {
    const usage = await this.getBlueprintUsageInfo(supabase, userId);

    if (usage.isExempt) {
      return { canCreate: true };
    }

    if (usage.creationCount >= usage.creationLimit) {
      return {
        canCreate: false,
        reason: `You've reached your limit of ${usage.creationLimit} blueprint creations. Upgrade your subscription to create more.`,
      };
    }

    return { canCreate: true };
  }

  /**
   * Check if user can save a blueprint
   */
  static async canSaveBlueprint(
    supabase: SupabaseClient,
    userId: string
  ): Promise<{ canSave: boolean; reason?: string }> {
    const usage = await this.getBlueprintUsageInfo(supabase, userId);

    if (usage.isExempt) {
      return { canSave: true };
    }

    if (usage.savingCount >= usage.savingLimit) {
      return {
        canSave: false,
        reason: `You've reached your limit of ${usage.savingLimit} blueprint saves. Upgrade your subscription to save more.`,
      };
    }

    return { canSave: true };
  }

  /**
   * Increment blueprint creation count
   */
  static async incrementCreationCount(supabase: SupabaseClient, userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('increment_blueprint_creation_count', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error incrementing blueprint creation count:', error);
      throw new Error('Failed to increment blueprint creation count');
    }

    return data;
  }

  /**
   * Increment blueprint saving count
   */
  static async incrementSavingCount(supabase: SupabaseClient, userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('increment_blueprint_saving_count', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error incrementing blueprint saving count:', error);
      throw new Error('Failed to increment blueprint saving count');
    }

    return data;
  }

  /**
   * Exempt a user from blueprint limits (admin function)
   */
  static async exemptUserFromLimits(
    supabase: SupabaseClient,
    userId: string,
    reason: string = 'Developer exemption'
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('exempt_user_from_blueprint_limits', {
      p_user_id: userId,
      p_reason: reason,
    });

    if (error) {
      console.error('Error exempting user from blueprint limits:', error);
      throw new Error('Failed to exempt user from blueprint limits');
    }

    return data;
  }
}
