'use client';

import type React from 'react';

import { Handle, Position, type NodeProps } from 'reactflow';
import { CircleDot, XCircle, Trash2 } from 'lucide-react';

export function StartNode({ data }: NodeProps) {
  return (
    <div className='relative flex items-center justify-center w-16 h-16 rounded-full border-2 border-green-600 bg-green-100 text-green-800'>
      <CircleDot className='w-6 h-6 text-green-600' />
      <div className='absolute -bottom-6 text-xs font-medium text-center w-full'>
        Start
      </div>
      <Handle
        type='source'
        position={Position.Bottom}
        className='w-3 h-3 bg-green-600'
      />
    </div>
  );
}

export function EndNode({ data }: NodeProps) {
  return (
    <div className='relative flex items-center justify-center w-16 h-16 rounded-full border-2 border-red-600 bg-red-100 text-red-800'>
      <XCircle className='w-6 h-6 text-red-600' />
      <div className='absolute -bottom-6 text-xs font-medium text-center w-full'>
        End
      </div>
      <Handle
        type='target'
        position={Position.Top}
        className='w-3 h-3 bg-red-600'
      />
    </div>
  );
}

export function ApiNode({ data, id }: NodeProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const customEvent = new CustomEvent('deleteNode', {
      detail: { nodeId: id },
    });
    window.dispatchEvent(customEvent);
  };

  return (
    <div className='flex items-center justify-between px-4 py-2 rounded-md border border-gray-200 bg-white shadow-sm min-w-[180px]'>
      <div className='font-medium text-sm'>{data.label || 'API Call'}</div>
      <button
        onClick={handleDelete}
        className='text-red-500 hover:text-red-700'
      >
        <Trash2 className='w-4 h-4' />
      </button>
      <Handle
        type='target'
        position={Position.Top}
        className='w-3 h-3 bg-gray-400'
      />
      <Handle
        type='source'
        position={Position.Bottom}
        className='w-3 h-3 bg-gray-400'
      />
    </div>
  );
}

export function EmailNode({ data, id }: NodeProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const customEvent = new CustomEvent('deleteNode', {
      detail: { nodeId: id },
    });
    window.dispatchEvent(customEvent);
  };

  return (
    <div className='flex items-center justify-between px-4 py-2 rounded-md border border-gray-200 bg-white shadow-sm min-w-[180px]'>
      <div className='font-medium text-sm'>{data.label || 'Email'}</div>
      <button
        onClick={handleDelete}
        className='text-red-500 hover:text-red-700'
      >
        <Trash2 className='w-4 h-4' />
      </button>
      <Handle
        type='target'
        position={Position.Top}
        className='w-3 h-3 bg-gray-400'
      />
      <Handle
        type='source'
        position={Position.Bottom}
        className='w-3 h-3 bg-gray-400'
      />
    </div>
  );
}

export function TextBoxNode({ data, id }: NodeProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const customEvent = new CustomEvent('deleteNode', {
      detail: { nodeId: id },
    });
    window.dispatchEvent(customEvent);
  };

  return (
    <div className='flex items-center justify-between px-4 py-2 rounded-md border border-gray-200 bg-white shadow-sm min-w-[180px]'>
      <div className='font-medium text-sm'>{data.label || 'Text Box'}</div>
      <button
        onClick={handleDelete}
        className='text-red-500 hover:text-red-700'
      >
        <Trash2 className='w-4 h-4' />
      </button>
      <Handle
        type='target'
        position={Position.Top}
        className='w-3 h-3 bg-gray-400'
      />
      <Handle
        type='source'
        position={Position.Bottom}
        className='w-3 h-3 bg-gray-400'
      />
    </div>
  );
}
