'use client';

import { useCallback } from 'react';
import { type EdgeProps, getSmoothStepPath } from 'reactflow';
import { Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function EdgeWithButton({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onAddNode = useCallback(
    (type: string, edgeId: string, position: { x: number; y: number }) => {
      const customEvent = new CustomEvent('addNodeInEdge', {
        detail: { edgeId, position, type },
      });
      window.dispatchEvent(customEvent);
    },
    []
  );

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#888',
        }}
        className='react-flow__edge-path'
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={20}
        height={20}
        x={labelX - 10}
        y={labelY - 10}
        className='edgebutton-foreignobject'
        requiredExtensions='http://www.w3.org/1999/xhtml'
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-300 hover:bg-gray-100 transition-colors'>
              <Plus className='w-3 h-3' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => onAddNode('api', id, { x: labelX, y: labelY })}
            >
              API Call
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAddNode('email', id, { x: labelX, y: labelY })}
            >
              Email
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onAddNode('text_box', id, { x: labelX, y: labelY })
              }
            >
              Text Box
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </foreignObject>
    </>
  );
}
