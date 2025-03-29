'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edge, Node } from 'reactflow';
import { Loader2, ArrowLeft } from 'lucide-react';
import { WorkflowEditor } from '@/components/workflow/WorkflowEditor';
import { useWorkflows } from '@/hooks/useWorkflows';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ViewWorkflowPage() {
  const { id } = useParams() as { id: string };
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('');
  const [lastExecuted, setLastExecuted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { getWorkflow, executeWorkflow } = useWorkflows();

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
        // Add status to nodes based on execution results
        const enhancedNodes = workflow.nodes.map((node) => {
          // Here we would normally check for execution results to set node status
          // For now, we'll just use the workflow status for all nodes
          return {
            ...node,
            data: {
              ...node.data,
              status:
                workflow.status === 'passed'
                  ? 'success'
                  : workflow.status === 'failed'
                  ? 'error'
                  : null,
            },
          };
        });

        setNodes(enhancedNodes as unknown as Node[]);
        setEdges(workflow.edges as unknown as Edge[]);
        setName(workflow.name);
        setDescription(workflow.description || '');
        setStatus(workflow.status);
        setLastExecuted(workflow.lastExecuted || null);
      } catch (error) {
        console.error('Error fetching workflow:', error);
        setError('Failed to load workflow');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [id]);

  const handleBackClick = () => {
    router.push('/dashboard');
  };

  const handleReExecute = async () => {
    try {
      setIsLoading(true);
      await executeWorkflow(id);
      // Reload the page to get updated execution results
      window.location.reload();
    } catch (error) {
      console.error('Error executing workflow:', error);
      setError('Failed to execute workflow');
      setIsLoading(false);
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
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='icon' onClick={handleBackClick}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <h1 className='text-3xl font-bold'>View Workflow</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-4 justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>Status:</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  status === 'passed'
                    ? 'bg-green-100 text-green-800'
                    : status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {status}
              </span>
            </div>

            {lastExecuted && (
              <div>
                <p className='text-sm text-muted-foreground'>Last Executed:</p>
                <p className='text-sm'>
                  {new Date(lastExecuted).toLocaleString()}
                </p>
              </div>
            )}

            <Button onClick={handleReExecute}>Re-Execute Workflow</Button>
          </div>
        </CardContent>
      </Card>

      <WorkflowEditor
        initialNodes={nodes}
        initialEdges={edges}
        name={name}
        description={description}
        onSave={() => {}}
        readOnly={true}
      />
    </div>
  );
}
