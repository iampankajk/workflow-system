import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  db,
} from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

export type WorkflowStatus = 'not_executed' | 'passed' | 'failed';

export type NodeData = {
  label?: string;
  description?: string;
  url?: string;
  method?: string;
  body?: string;
  headers?: Record<string, string>;
  email?: string;
  subject?: string;
  content?: string;
  text?: string;
  [key: string]: unknown;
};

export interface WorkflowStep {
  id: string;
  type: 'start' | 'end' | 'api' | 'email' | 'text_box' | string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  lastExecuted?: string;
  nodes: WorkflowStep[];
  edges: WorkflowConnection[];
  userId: string;
}

export type StepResult = {
  success: boolean;
  message: string;
  response?: unknown;
  error?: string;
  timestamp: string;
};

export interface ExecutionResult {
  success: boolean;
  message: string;
  stepResults: Record<string, StepResult>;
}

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchWorkflows = async () => {
      if (!currentUser) {
        setWorkflows([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const workflowsRef = collection(db, 'workflows');
        const q = query(
          workflowsRef,
          // Add a where clause to get only workflows for the current user
          // where('userId', '==', currentUser.uid),
          orderBy('updatedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const workflowsData: Workflow[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as Workflow;
          workflowsData.push(data);
        });

        setWorkflows(workflowsData);
      } catch (err) {
        console.error('Error fetching workflows:', err);
        setError('Failed to fetch workflows. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, [currentUser]);

  const getWorkflow = async (id: string): Promise<Workflow | null> => {
    if (!currentUser) return null;

    try {
      const workflowRef = doc(db, 'workflows', id);
      const workflowDoc = await getDoc(workflowRef);

      if (workflowDoc.exists()) {
        return workflowDoc.data() as Workflow;
      }

      return null;
    } catch (err) {
      console.error('Error fetching workflow:', err);
      throw new Error('Failed to fetch workflow');
    }
  };

  const createWorkflow = async (
    workflowData: Partial<Workflow>
  ): Promise<Workflow> => {
    if (!currentUser) throw new Error('User not authenticated');

    const workflowId = uuidv4();
    const now = new Date().toISOString();

    const newWorkflow: Workflow = {
      id: workflowId,
      name: workflowData.name || 'Untitled Workflow',
      description: workflowData.description || '',
      status: 'not_executed',
      createdAt: now,
      updatedAt: now,
      nodes: workflowData.nodes || [],
      edges: workflowData.edges || [],
      userId: currentUser.uid,
    };

    try {
      await setDoc(doc(db, 'workflows', workflowId), newWorkflow);

      setWorkflows((prev) => [newWorkflow, ...prev]);

      return newWorkflow;
    } catch (err) {
      console.error('Error creating workflow:', err);
      throw new Error('Failed to create workflow');
    }
  };

  const updateWorkflow = async (
    id: string,
    workflowData: Partial<Workflow>
  ): Promise<Workflow> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const workflowRef = doc(db, 'workflows', id);
      const workflowDoc = await getDoc(workflowRef);

      if (!workflowDoc.exists()) {
        throw new Error('Workflow not found');
      }

      const existingWorkflow = workflowDoc.data() as Workflow;

      // Make sure the workflow belongs to the current user
      if (existingWorkflow.userId !== currentUser.uid) {
        throw new Error('You do not have permission to update this workflow');
      }

      // Create update data without metadata fields
      const updateData = {
        ...workflowData,
        name: workflowData.name || existingWorkflow.name,
        description: workflowData.description || existingWorkflow.description,
        nodes: workflowData.nodes || existingWorkflow.nodes,
        edges: workflowData.edges || existingWorkflow.edges,
        status: workflowData.status || existingWorkflow.status,
        updatedAt: new Date().toISOString(),
      };

      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.userId;

      await updateDoc(workflowRef, updateData);

      const updatedWorkflow = {
        ...existingWorkflow,
        ...updateData,
      };

      setWorkflows((prev) =>
        prev.map((workflow) =>
          workflow.id === id ? updatedWorkflow : workflow
        )
      );

      return updatedWorkflow;
    } catch (err) {
      console.error('Error updating workflow:', err);
      throw new Error('Failed to update workflow');
    }
  };

  const deleteWorkflow = async (id: string): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const workflowRef = doc(db, 'workflows', id);
      const workflowDoc = await getDoc(workflowRef);

      if (!workflowDoc.exists()) {
        throw new Error('Workflow not found');
      }

      const existingWorkflow = workflowDoc.data() as Workflow;

      // Make sure the workflow belongs to the current user
      if (existingWorkflow.userId !== currentUser.uid) {
        throw new Error('You do not have permission to delete this workflow');
      }

      await deleteDoc(workflowRef);

      setWorkflows((prev) => prev.filter((workflow) => workflow.id !== id));
    } catch (err) {
      console.error('Error deleting workflow:', err);
      throw new Error('Failed to delete workflow');
    }
  };

  const executeWorkflow = async (id: string): Promise<ExecutionResult> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const workflow = await getWorkflow(id);

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Simple mock execution - in a real app, this would handle the actual workflow logic
      const success = Math.random() > 0.3; // 70% chance of success
      const executionResult: ExecutionResult = {
        success,
        message: success
          ? 'Workflow executed successfully'
          : 'Workflow execution failed',
        stepResults: {},
      };

      // Update the workflow status based on execution result
      await updateWorkflow(id, {
        status: success ? 'passed' : 'failed',
        lastExecuted: new Date().toISOString(),
      });

      return executionResult;
    } catch (err) {
      console.error('Error executing workflow:', err);
      throw new Error('Failed to execute workflow');
    }
  };

  return {
    workflows,
    loading,
    error,
    getWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
  };
};
