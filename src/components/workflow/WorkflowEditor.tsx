'use client';

import type React from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
  type Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  ReactFlowProvider,
  ConnectionMode,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Undo2, Redo2, ChevronLeft, FileText, Minus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { nodeTypes, edgeTypes } from './NodeTypes';
import { NodePropertiesModal } from './NodePropertiesModal';
import { useRouter } from 'next/navigation';

interface WorkflowEditorProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave: (
    nodes: Node[],
    edges: Edge[],
    name: string,
    description: string
  ) => void;
  onExecute?: () => void;
  readOnly?: boolean;
  name?: string;
  description?: string;
}

function WorkflowEditorContent({
  initialNodes = [],
  initialEdges = [],
  onSave,
  onExecute,
  readOnly = false,
  name: initialName = '',
  description: initialDescription = '',
}: WorkflowEditorProps) {
  const [nodes, setNodes] = useState<Node[]>(
    initialNodes.length
      ? initialNodes
      : [
          {
            id: 'start',
            type: 'start',
            position: { x: 250, y: 100 },
            data: { label: 'Start' },
          },
          {
            id: 'end',
            type: 'end',
            position: { x: 250, y: 300 },
            data: { label: 'End' },
          },
        ]
  );

  const [edges, setEdges] = useState<Edge[]>(
    initialEdges.length
      ? initialEdges
      : [
          {
            id: 'e1-2',
            source: 'start',
            target: 'end',
            type: 'buttonedge',
            animated: true,
          },
        ]
  );

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodePropertiesOpen, setIsNodePropertiesOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number[]>([1]);
  const router = useRouter();

  // Store history for undo/redo
  const historyRef = useRef<{
    past: { nodes: Node[]; edges: Edge[] }[];
    future: { nodes: Node[]; edges: Edge[] }[];
    present: { nodes: Node[]; edges: Edge[] } | null;
  }>({
    past: [],
    future: [],
    present: null,
  });

  const isFirstRender = useRef(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project, getZoom, setViewport, zoomTo } = useReactFlow();
  const nodeIdRef = useRef(1);

  // Initialize history
  useEffect(() => {
    if (isFirstRender.current) {
      historyRef.current.present = { nodes, edges };
      isFirstRender.current = false;
    }
  }, [nodes, edges]);

  // Handle adding node in the middle of an edge
  useEffect(() => {
    const handleAddNodeInEdge = (event: Event) => {
      const { edgeId, position, type } = (event as CustomEvent).detail;

      // Find the edge
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      // Create a new node
      const newNodeId = `${type}-${nodeIdRef.current++}`;
      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: {
          label:
            type === 'api'
              ? 'API Call'
              : type === 'email'
              ? 'Email'
              : 'Text Box',
        },
      };

      // Create new edges
      const newEdge1: Edge = {
        id: `e-${uuidv4()}`,
        source: edge.source,
        target: newNodeId,
        type: 'buttonedge',
        animated: true,
      };

      const newEdge2: Edge = {
        id: `e-${uuidv4()}`,
        source: newNodeId,
        target: edge.target,
        type: 'buttonedge',
        animated: true,
      };

      // Save current state to history
      const currentState = { nodes: [...nodes], edges: [...edges] };
      historyRef.current = {
        past: [...historyRef.current.past, currentState],
        present: {
          nodes: [...nodes, newNode],
          edges: edges
            .filter((e) => e.id !== edgeId)
            .concat([newEdge1, newEdge2]),
        },
        future: [],
      };

      // Remove the old edge and add the new node and edges
      setEdges((eds) =>
        eds.filter((e) => e.id !== edgeId).concat([newEdge1, newEdge2])
      );
      setNodes((nds) => [...nds, newNode]);
    };

    const handleDeleteNode = (event: Event) => {
      const { nodeId } = (event as CustomEvent).detail;

      // Find all edges connected to this node
      const connectedEdges = edges.filter(
        (edge) => edge.source === nodeId || edge.target === nodeId
      );

      // Find source and target nodes to reconnect
      let sourceNode = null;
      let targetNode = null;

      for (const edge of connectedEdges) {
        if (edge.target === nodeId) {
          sourceNode = edge.source;
        }
        if (edge.source === nodeId) {
          targetNode = edge.target;
        }
      }

      // Save current state to history
      const currentState = { nodes: [...nodes], edges: [...edges] };

      let newEdges = edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      );

      // Create a new edge connecting the source to target
      if (sourceNode && targetNode) {
        const newEdge: Edge = {
          id: `e-${uuidv4()}`,
          source: sourceNode,
          target: targetNode,
          type: 'buttonedge',
          animated: true,
        };

        newEdges = [...newEdges, newEdge];
      }

      historyRef.current = {
        past: [...historyRef.current.past, currentState],
        present: {
          nodes: nodes.filter((n) => n.id !== nodeId),
          edges: newEdges,
        },
        future: [],
      };

      // Remove the node
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));

      // Update edges
      setEdges(newEdges);
    };

    window.addEventListener('addNodeInEdge', handleAddNodeInEdge);
    window.addEventListener('deleteNode', handleDeleteNode);

    return () => {
      window.removeEventListener('addNodeInEdge', handleAddNodeInEdge);
      window.removeEventListener('deleteNode', handleDeleteNode);
    };
  }, [edges, nodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Save current state before applying changes
      if (changes.some((change) => change.type !== 'select')) {
        const currentState = { nodes: [...nodes], edges: [...edges] };
        historyRef.current = {
          past: [...historyRef.current.past, currentState],
          present: null,
          future: [],
        };
      }

      setNodes((nds) => {
        const updatedNodes = applyNodeChanges(changes, nds);
        historyRef.current.present = { nodes: updatedNodes, edges };
        return updatedNodes;
      });
    },
    [nodes, edges, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Save current state before applying changes
      if (changes.some((change) => change.type !== 'select')) {
        const currentState = { nodes: [...nodes], edges: [...edges] };
        historyRef.current = {
          past: [...historyRef.current.past, currentState],
          present: null,
          future: [],
        };
      }

      setEdges((eds) => {
        const updatedEdges = applyEdgeChanges(changes, eds);
        historyRef.current.present = { nodes, edges: updatedEdges };
        return updatedEdges;
      });
    },
    [nodes, edges, setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      // Save current state before connecting
      const currentState = { nodes: [...nodes], edges: [...edges] };

      setEdges((eds) => {
        const updatedEdges = addEdge(
          {
            ...connection,
            id: `e-${uuidv4()}`,
            type: 'buttonedge',
            animated: true,
          },
          eds
        );

        historyRef.current = {
          past: [...historyRef.current.past, currentState],
          present: { nodes, edges: updatedEdges },
          future: [],
        };

        return updatedEdges;
      });
    },
    [nodes, edges, setEdges]
  );

  const addNewNode = (type: string) => {
    const id = `${type}-${nodeIdRef.current++}`;
    const centerX = 250;
    const centerY = 200;

    const newNode: Node = {
      id,
      type,
      position: {
        x: centerX,
        y: centerY,
      },
      data: {
        label:
          type === 'api' ? 'API Call' : type === 'email' ? 'Email' : 'Text Box',
      },
    };

    // Save current state to history
    const currentState = { nodes: [...nodes], edges: [...edges] };
    historyRef.current = {
      past: [...historyRef.current.past, currentState],
      present: { nodes: [...nodes, newNode], edges },
      future: [],
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a workflow name');
      return;
    }
    onSave(nodes, edges, name, description);
  };

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (readOnly) return;
    if (node.type === 'start' || node.type === 'end') return;
    setSelectedNode(node);
    setIsNodePropertiesOpen(true);
  };

  const handleUpdateNodeData = (
    nodeId: string,
    data: Record<string, unknown>
  ) => {
    // Save current state to history
    const currentState = { nodes: [...nodes], edges: [...edges] };

    setNodes((nds) => {
      const updatedNodes = nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...data,
            },
          };
        }
        return node;
      });

      historyRef.current = {
        past: [...historyRef.current.past, currentState],
        present: { nodes: updatedNodes, edges },
        future: [],
      };

      return updatedNodes;
    });
  };

  const handleUndo = () => {
    const { past, present, future } = historyRef.current;

    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    historyRef.current = {
      past: newPast,
      present: previous,
      future: present ? [present, ...future] : future,
    };

    setNodes(previous.nodes);
    setEdges(previous.edges);
  };

  const handleRedo = () => {
    const { past, present, future } = historyRef.current;

    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    historyRef.current = {
      past: present ? [...past, present] : past,
      present: next,
      future: newFuture,
    };

    setNodes(next.nodes);
    setEdges(next.edges);
  };

  const handleZoomChange = (value: number[]) => {
    setZoomLevel(value);
    zoomTo(value[0]);
  };

  const zoomIn = () => {
    const zoom = getZoom();
    const newZoom = Math.min(zoom + 0.1, 2);
    setZoomLevel([newZoom]);
    zoomTo(newZoom);
  };

  const zoomOut = () => {
    const zoom = getZoom();
    const newZoom = Math.max(zoom - 0.1, 0.2);
    setZoomLevel([newZoom]);
    zoomTo(newZoom);
  };

  return (
    <div
      className='h-[600px] w-full border rounded-md bg-[#f5f5f0] relative'
      ref={reactFlowWrapper}
    >
      <div className='absolute top-0 left-0 z-10 p-4 w-full flex justify-between items-center gap-4 bg-white border-b'>
        <div className='flex gap-2 flex-1 max-w-md'>
          <Button
            variant='ghost'
            size='sm'
            className='gap-1'
            onClick={() => {
              router.push('/dashboard');
            }}
          >
            <ChevronLeft className='h-4 w-4' />
            Go Back
          </Button>
          <Input
            placeholder='Workflow Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={readOnly}
            className='font-medium'
          />
          <Input
            placeholder='Description (optional)'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={readOnly}
            className='text-sm resize-none'
          />
        </div>

        <div className='flex items-center gap-2'>
          {!readOnly && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='bg-white hover:bg-gray-50'
                >
                  <Plus className='h-4 w-4 mr-2' /> Add Step
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => addNewNode('api')}>
                  API Call
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addNewNode('email')}>
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addNewNode('text_box')}>
                  Text Box
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!readOnly && (
            <Button variant='destructive' size='sm'>
              Delete
            </Button>
          )}

          {!readOnly && (
            <Button
              variant='default'
              size='sm'
              onClick={handleSave}
              className='bg-red-500 hover:bg-red-600 text-white'
            >
              Save
            </Button>
          )}
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        fitView
        deleteKeyCode='Delete'
        multiSelectionKeyCode='Control'
        selectionKeyCode='Shift'
        className='pt-16'
        minZoom={0.2}
        maxZoom={4}
        defaultEdgeOptions={{
          animated: true,
          type: 'buttonedge',
        }}
        connectionMode={ConnectionMode.Loose}
      >
        <Panel
          position='bottom-left'
          className='flex items-center gap-2 p-2 bg-white rounded-md shadow-sm'
        >
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8 rounded-md bg-white'
            onClick={handleUndo}
          >
            <Undo2 className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8 rounded-md bg-white'
            onClick={handleRedo}
          >
            <Redo2 className='h-4 w-4' />
          </Button>
        </Panel>

        <Panel
          position='bottom-right'
          className='flex items-center gap-2 p-2 bg-white rounded-md shadow-sm w-64'
        >
          <div className='flex items-center gap-2 w-full'>
            <Button
              variant='outline'
              size='icon'
              className='h-6 w-6 rounded-full bg-green-100 border-none'
            >
              <div className='h-2 w-2 bg-green-500 rounded-full'></div>
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='h-6 w-6 rounded-full bg-white'
              onClick={zoomOut}
            >
              <Minus className='h-3 w-3' />
            </Button>
            <Slider
              value={zoomLevel}
              onValueChange={handleZoomChange}
              min={0.2}
              max={2}
              step={0.1}
              className='w-full'
            />
            <Button
              variant='outline'
              size='icon'
              className='h-6 w-6 rounded-full bg-white'
              onClick={zoomIn}
            >
              <Plus className='h-3 w-3' />
            </Button>
          </div>
        </Panel>

        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          color='#e0e0e0'
        />
      </ReactFlow>

      {selectedNode && (
        <NodePropertiesModal
          isOpen={isNodePropertiesOpen}
          onClose={() => setIsNodePropertiesOpen(false)}
          node={selectedNode}
          onUpdateNodeData={handleUpdateNodeData}
        />
      )}
    </div>
  );
}

export function WorkflowEditor(props: WorkflowEditorProps) {
  return (
    <ReactFlowProvider>
      <WorkflowEditorContent {...props} />
    </ReactFlowProvider>
  );
}
