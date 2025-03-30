'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edge, Node } from 'reactflow';
import { WorkflowEditor } from '@/components/workflow/WorkflowEditor';
import {
  useWorkflows,
  WorkflowStep,
  WorkflowConnection,
} from '@/hooks/useWorkflows';
import { useToast } from '@/hooks/use-toast';

export default function CreateWorkflowPage() {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { createWorkflow } = useWorkflows();
  const { toast } = useToast();

  const handleSave = async (
    nodes: Node[],
    edges: Edge[],
    name: string,
    description: string
  ) => {
    try {
      setIsSaving(true);

      await createWorkflow({
        name,
        description,
        nodes: nodes as unknown as WorkflowStep[],
        edges: edges as unknown as WorkflowConnection[],
      });

      toast({
        title: 'Success',
        description: 'Workflow created successfully',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to create workflow',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-4'>
      <WorkflowEditor onSave={handleSave} />

      {isSaving && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center'>
          <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
        </div>
      )}
    </div>
  );
}
