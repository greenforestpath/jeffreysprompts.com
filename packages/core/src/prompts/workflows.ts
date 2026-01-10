// packages/core/src/prompts/workflows.ts
// Curated workflows - sequences of prompts for specific tasks

export interface WorkflowStep {
  id: string;
  promptId: string;
  note: string;
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  steps: WorkflowStep[];
  whenToUse: string[];
}

export const workflows: Workflow[] = [
  {
    id: "new-feature",
    title: "New Feature Development",
    description: "End-to-end workflow for implementing a new feature",
    whenToUse: [
      "When planning a new product feature",
      "When you need a repeatable prompt chain for delivery",
    ],
    steps: [
      {
        id: "ideate",
        promptId: "idea-wizard",
        note: "Generate and evaluate improvement ideas",
      },
      {
        id: "document",
        promptId: "readme-reviser",
        note: "Update documentation for new feature",
      },
    ],
  },
];

export function getWorkflow(id: string): Workflow | undefined {
  return workflows.find((w) => w.id === id);
}
