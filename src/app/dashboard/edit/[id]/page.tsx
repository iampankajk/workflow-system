'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edge, Node } from 'reactflow';
import { Loader2 } from 'lucide-react';
import { WorkflowEditor } from '@/components/workflow/WorkflowEditor';
import {
  useWorkflows,
  WorkflowStep,
  WorkflowConnection,
} from '@/hooks/useWorkflows';
import { useToast } from '@/hooks/use-toast';

interface EditWorkflowPageProps {
  params: {
    id: string;
  };
}

export default function EditWorkflowPage() {
  const { id } = useParams() as { id: string };
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { getWorkflow, updateWorkflow, executeWorkflow } = useWorkflows();
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        setIsLoading(true);
        const workflow = await getWorkflow(id);

        if (!workflow) {
          setError('Workflow not found');
          return;
        }

        // Convert workflow nodes and edges to React Flow format
        setNodes(workflow.nodes as unknown as Node[]);
        setEdges(workflow.edges as unknown as Edge[]);
        setName(workflow.name);
        setDescription(workflow.description || '');
      } catch (error) {
        console.error('Error fetching workflow:', error);
        setError('Failed to load workflow');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [id]);

  const handleSave = async (
    nodes: Node[],
    edges: Edge[],
    name: string,
    description: string
  ) => {
    try {
      setIsSaving(true);

      await updateWorkflow(id, {
        name,
        description,
        nodes: nodes as unknown as WorkflowStep[],
        edges: edges as unknown as WorkflowConnection[],
      });

      toast({
        title: 'Success',
        description: 'Workflow updated successfully',
      });

      // Stay on the page after saving
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workflow',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    try {
      const result = await executeWorkflow(id);

      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to execute workflow',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[600px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[600px] space-y-4'>
        <p className='text-red-500'>{error}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className='text-primary hover:underline'
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold'>Edit Workflow</h1>
      <WorkflowEditor
        initialNodes={nodes}
        initialEdges={edges}
        name={name}
        description={description}
        onSave={handleSave}
        onExecute={handleExecute}
      />

      {isSaving && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center'>
          <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
        </div>
      )}
    </div>
  );
}
