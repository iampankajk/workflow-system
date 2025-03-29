'use client';

import type { NodeTypes, EdgeTypes } from 'reactflow';
import {
  StartNode,
  EndNode,
  ApiNode,
  EmailNode,
  TextBoxNode,
} from './CustomNodeStyles';
import { EdgeWithButton } from './EdgeWithButton';

export const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  api: ApiNode,
  email: EmailNode,
  text_box: TextBoxNode,
};

export const edgeTypes: EdgeTypes = {
  buttonedge: EdgeWithButton,
};
