'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, PlayCircle, Edit, Trash2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useWorkflows } from '@/hooks/useWorkflows';

// Sample workflow for new users
const SAMPLE_WORKFLOW = {
  name: 'Welcome Workflow',
  description: 'A simple example workflow to help you get started',
  nodes: [
    {
      id: 'start',
      type: 'start',
      position: { x: 250, y: 50 },
      data: { label: 'Start' },
    },
    {
      id: 'api-1',
      type: 'api',
      position: { x: 250, y: 150 },
      data: {
        label: 'Get User Data',
        url: 'https://jsonplaceholder.typicode.com/users/1',
        method: 'GET',
        description: 'Fetch sample user data',
      },
    },
    {
      id: 'email-1',
      type: 'email',
      position: { x: 250, y: 250 },
      data: {
        label: 'Send Email',
        email: 'user@example.com',
        subject: 'Welcome to Workflow Manager',
        description: 'Sends a welcome email',
      },
    },
    {
      id: 'end',
      type: 'end',
      position: { x: 250, y: 350 },
      data: { label: 'End' },
    },
  ],
  edges: [
    {
      id: 'e1',
      source: 'start',
      target: 'api-1',
      animated: true,
    },
    {
      id: 'e2',
      source: 'api-1',
      target: 'email-1',
      animated: true,
    },
    {
      id: 'e3',
      source: 'email-1',
      target: 'end',
      animated: true,
    },
  ],
};

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    workflows,
    createWorkflow,
    executeWorkflow,
    deleteWorkflow,
    loading,
    error,
  } = useWorkflows();
  const { toast } = useToast();
  const [filteredWorkflows, setFilteredWorkflows] = useState(workflows);
  const [isInitialized, setIsInitialized] = useState(false);

  // Create sample workflow for new users
  useEffect(() => {
    const initializeForNewUser = async () => {
      if (!loading && !isInitialized && workflows.length === 0) {
        try {
          await createWorkflow(SAMPLE_WORKFLOW);
          setIsInitialized(true);
          toast({
            title: 'Welcome to Workflow Manager!',
            description:
              "We've created a sample workflow to help you get started.",
          });
        } catch (err) {
          console.error('Error creating sample workflow:', err);
        }
      } else if (!loading) {
        setIsInitialized(true);
      }
    };

    initializeForNewUser();
  }, [loading, workflows.length, createWorkflow, isInitialized, toast]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWorkflows(workflows);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = workflows.filter(
        (workflow) =>
          workflow.name.toLowerCase().includes(lowerCaseQuery) ||
          workflow.id.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredWorkflows(filtered);
    }
  }, [searchQuery, workflows]);

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      await executeWorkflow(workflowId);
      toast({
        title: 'Workflow executed',
        description: 'The workflow has been executed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to execute the workflow',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      await deleteWorkflow(workflowId);
      toast({
        title: 'Workflow deleted',
        description: 'The workflow has been deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete the workflow',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Workflows</h1>
        <Button asChild>
          <Link href='/dashboard/create'>
            <Plus className='mr-2 h-4 w-4' /> Create New Process
          </Link>
        </Button>
      </div>

      <div className='flex items-center'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search workflows by name or ID'
            className='pl-10'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center py-10'>
          <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
        </div>
      ) : error ? (
        <div className='py-10 text-center text-red-500'>{error}</div>
      ) : filteredWorkflows.length === 0 ? (
        <div className='py-10 text-center text-muted-foreground'>
          {searchQuery
            ? 'No workflows match your search query'
            : 'No workflows found. Create your first workflow!'}
        </div>
      ) : (
        <Table>
          <TableCaption>List of your workflows</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Executed</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkflows.map((workflow) => (
              <TableRow key={workflow.id}>
                <TableCell className='font-medium'>{workflow.name}</TableCell>
                <TableCell>{workflow.id}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      workflow.status === 'passed'
                        ? 'bg-green-100 text-green-800'
                        : workflow.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {workflow.status}
                  </span>
                </TableCell>
                <TableCell>
                  {workflow.lastExecuted
                    ? new Date(workflow.lastExecuted).toLocaleString()
                    : 'Never'}
                </TableCell>
                <TableCell className='text-right space-x-2'>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant='outline' size='icon'>
                        <PlayCircle className='h-4 w-4' />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Execute Workflow</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to execute this workflow? This
                          will run all steps in the workflow.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleExecuteWorkflow(workflow.id)}
                        >
                          Execute
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button variant='outline' size='icon' asChild>
                    <Link href={`/dashboard/view/${workflow.id}`}>
                      <Eye className='h-4 w-4' />
                    </Link>
                  </Button>

                  <Button variant='outline' size='icon' asChild>
                    <Link href={`/dashboard/edit/${workflow.id}`}>
                      <Edit className='h-4 w-4' />
                    </Link>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant='outline' size='icon'>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this workflow? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className='bg-red-600 hover:bg-red-700'
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
