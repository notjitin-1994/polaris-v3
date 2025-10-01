/**
 * Blueprint to Markdown Conversion Service
 * Converts blueprint JSON to formatted markdown document
 */

import { formatSectionTitle, formatDate, formatCurrency } from '@/components/blueprint/utils';
import type { BlueprintJSON } from '@/components/blueprint/types';

/**
 * Convert blueprint JSON to markdown
 */
export function convertBlueprintToMarkdown(blueprint: BlueprintJSON): string {
  let md = '';

  // Title and Metadata
  md += `# ${blueprint.metadata.title}\n\n`;
  md += `**Organization:** ${blueprint.metadata.organization}\n\n`;
  md += `**Role:** ${blueprint.metadata.role}\n\n`;
  md += `**Generated:** ${formatDate(blueprint.metadata.generated_at)}\n\n`;
  md += `**Version:** ${blueprint.metadata.version}\n\n`;
  md += `---\n\n`;

  // Convert each section
  for (const [key, section] of Object.entries(blueprint)) {
    if (key === 'metadata' || key.startsWith('_')) continue;

    md += `## ${formatSectionTitle(key)}\n\n`;
    md += convertSectionToMarkdown(section);
    md += `\n---\n\n`;
  }

  return md;
}

/**
 * Convert individual section to markdown
 */
function convertSectionToMarkdown(section: any): string {
  if (!section) return '';

  // Handle content field
  if (section.content) {
    return `${section.content}\n\n`;
  }

  // Handle overview field
  if (section.overview) {
    return `${section.overview}\n\n`;
  }

  // Handle objectives
  if (section.objectives && Array.isArray(section.objectives)) {
    let md = '';
    section.objectives.forEach((obj: any, index: number) => {
      md += `### ${index + 1}. ${obj.title}\n\n`;
      md += `${obj.description}\n\n`;
      md += `**Metric:** ${obj.metric}\n\n`;
      md += `**Baseline:** ${obj.baseline} | **Target:** ${obj.target}\n\n`;
      md += `**Due Date:** ${formatDate(obj.due_date)}\n\n`;
    });
    return md;
  }

  // Handle modules
  if (section.modules && Array.isArray(section.modules)) {
    let md = '';
    section.modules.forEach((module: any) => {
      md += `### ${module.title}\n\n`;
      md += `${module.description}\n\n`;
      md += `**Duration:** ${module.duration}\n\n`;
      md += `**Delivery Method:** ${module.delivery_method}\n\n`;
      if (module.topics && module.topics.length > 0) {
        md += `**Topics:**\n\n`;
        module.topics.forEach((topic: string) => {
          md += `- ${topic}\n`;
        });
        md += '\n';
      }
    });
    return md;
  }

  // Handle KPIs
  if (section.kpis && Array.isArray(section.kpis)) {
    let md = section.overview ? `${section.overview}\n\n### Key Performance Indicators\n\n` : '';

    md += '| Metric | Target | Measurement Method | Frequency |\n';
    md += '|--------|--------|-------------------|----------|\n';
    section.kpis.forEach((kpi: any) => {
      md += `| ${kpi.metric} | ${kpi.target} | ${kpi.measurement_method} | ${kpi.frequency} |\n`;
    });
    md += '\n';
    return md;
  }

  // Handle metrics
  if (section.metrics && Array.isArray(section.metrics)) {
    let md = '| Metric | Current Baseline | Target | Measurement Method | Timeline |\n';
    md += '|--------|-----------------|--------|-------------------|----------|\n';
    section.metrics.forEach((metric: any) => {
      md += `| ${metric.metric} | ${metric.current_baseline} | ${metric.target} | ${metric.measurement_method} | ${metric.timeline} |\n`;
    });
    md += '\n';
    return md;
  }

  // Handle risks
  if (section.risks && Array.isArray(section.risks)) {
    let md = '| Risk | Probability | Impact | Mitigation Strategy |\n';
    md += '|------|-------------|--------|--------------------|\n';
    section.risks.forEach((risk: any) => {
      md += `| ${risk.risk} | ${risk.probability} | ${risk.impact} | ${risk.mitigation_strategy} |\n`;
    });
    md += '\n';
    return md;
  }

  // Handle phases
  if (section.phases && Array.isArray(section.phases)) {
    let md = '';
    section.phases.forEach((phase: any) => {
      md += `### ${phase.phase}\n\n`;
      md += `**Period:** ${formatDate(phase.start_date)} - ${formatDate(phase.end_date)}\n\n`;
      if (phase.milestones && phase.milestones.length > 0) {
        md += `**Milestones:**\n\n`;
        phase.milestones.forEach((milestone: string) => {
          md += `- ${milestone}\n`;
        });
        md += '\n';
      }
    });
    return md;
  }

  // Handle resources
  if (section.human_resources || section.tools_and_platforms || section.budget) {
    let md = '';

    if (section.human_resources) {
      md += '### Human Resources\n\n';
      md += '| Role | FTE | Duration |\n';
      md += '|------|-----|----------|\n';
      section.human_resources.forEach((hr: any) => {
        md += `| ${hr.role} | ${hr.fte} | ${hr.duration} |\n`;
      });
      md += '\n';
    }

    if (section.tools_and_platforms) {
      md += '### Tools & Platforms\n\n';
      md += '| Category | Name | Cost Type |\n';
      md += '|----------|------|----------|\n';
      section.tools_and_platforms.forEach((tool: any) => {
        md += `| ${tool.category} | ${tool.name} | ${tool.cost_type} |\n`;
      });
      md += '\n';
    }

    if (section.budget) {
      md += '### Budget\n\n';
      if (section.budget.items) {
        md += '| Item | Amount |\n';
        md += '|------|--------|\n';
        section.budget.items.forEach((item: any) => {
          md += `| ${item.item} | ${formatCurrency(item.amount, section.budget.currency)} |\n`;
        });
        md += '\n';
      }
      md += `**Total Budget:** ${formatCurrency(section.budget.total, section.budget.currency)}\n\n`;
    }

    return md;
  }

  // Fallback: JSON stringify
  return `\`\`\`json\n${JSON.stringify(section, null, 2)}\n\`\`\`\n\n`;
}

/**
 * Export for use in API routes
 */
export const blueprintMarkdownConverter = {
  convertBlueprintToMarkdown,
};
