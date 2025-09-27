import { Blueprint } from '@/lib/ollama/schema';

export class MarkdownGeneratorService {
  // Helper function to escape markdown special characters
  private escapeMarkdown(text: string): string {
    return text
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/`/g, '\\`')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\|/g, '\\|')
      .replace(/#/g, '\\#')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  public generateMarkdown(blueprint: Blueprint): string {
    let markdown = `# ${this.escapeMarkdown(blueprint.title)}\n\n`;

    markdown += `## Overview\n\n${this.escapeMarkdown(blueprint.overview)}\n\n`;

    markdown += `## Learning Objectives\n\n`;
    blueprint.learningObjectives.forEach((objective) => {
      markdown += `- ${this.escapeMarkdown(objective)}\n`;
    });
    markdown += `\n`;

    markdown += `## Modules\n\n`;
    blueprint.modules.forEach((module) => {
      markdown += `### ${this.escapeMarkdown(module.title)}\n\n`;
      markdown += `- **Duration:** ${module.duration} hours\n`;
      markdown += `- **Topics:** ${module.topics.map((topic) => this.escapeMarkdown(topic)).join(', ')}\n`;
      markdown += `- **Activities:** ${module.activities.map((activity) => this.escapeMarkdown(activity)).join(', ')}\n`;
      markdown += `- **Assessments:** ${module.assessments.map((assessment) => this.escapeMarkdown(assessment)).join(', ')}\n\n`;
    });

    if (blueprint.timeline && Object.keys(blueprint.timeline).length > 0) {
      markdown += `## Timeline\n\n`;
      markdown += `| Week/Phase | Description |\n`;
      markdown += `|---|---|\n`;
      for (const [key, value] of Object.entries(blueprint.timeline)) {
        markdown += `| ${this.escapeMarkdown(key)} | ${this.escapeMarkdown(value)} |\n`;
      }
      markdown += `\n`;
    }

    if (blueprint.resources && blueprint.resources.length > 0) {
      markdown += `## Resources\n\n`;
      blueprint.resources.forEach((resource) => {
        markdown += `- [${this.escapeMarkdown(resource.name)} (${this.escapeMarkdown(resource.type)})](${resource.url || '#'})\n`;
      });
      markdown += `\n`;
    }

    return markdown;
  }
}

export const markdownGeneratorService = new MarkdownGeneratorService();
