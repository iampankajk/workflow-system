import { Node } from 'reactflow';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NodePropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: Node | null;
  onUpdateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
}

// Define form schemas for each node type
const baseSchema = z.object({
  label: z.string().optional(),
  description: z.string().optional(),
});

const apiSchema = baseSchema.extend({
  url: z.string().url({ message: 'Please enter a valid URL' }).optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  body: z.string().optional(),
  headers: z.string().optional(),
});

const emailSchema = baseSchema.extend({
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .optional(),
  subject: z.string().optional(),
  content: z.string().optional(),
});

const textSchema = baseSchema.extend({
  text: z.string().optional(),
});

export function NodePropertiesModal({
  isOpen,
  onClose,
  node,
  onUpdateNodeData,
}: NodePropertiesModalProps) {
  if (!node) return null;

  const nodeType = node.type || '';

  const ApiNodeForm = () => {
    const form = useForm<z.infer<typeof apiSchema>>({
      resolver: zodResolver(apiSchema),
      defaultValues: {
        label: node.data.label || '',
        description: node.data.description || '',
        url: node.data.url || '',
        method: node.data.method || 'GET',
        body: node.data.body || '',
        headers: node.data.headers ? JSON.stringify(node.data.headers) : '',
      },
    });

    const onSubmit = (values: z.infer<typeof apiSchema>) => {
      let headers = {};
      if (values.headers) {
        try {
          headers = JSON.parse(values.headers);
        } catch (e) {
          // Invalid JSON, use as string
          headers = { 'Content-Type': 'application/json' };
        }
      }

      onUpdateNodeData(node.id, {
        ...values,
        headers,
      });
      onClose();
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
          <FormField
            control={form.control}
            name='label'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input placeholder='API Call' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder='API description' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='url'
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://api.example.com/endpoint'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='method'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select HTTP method' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='GET'>GET</SelectItem>
                    <SelectItem value='POST'>POST</SelectItem>
                    <SelectItem value='PUT'>PUT</SelectItem>
                    <SelectItem value='DELETE'>DELETE</SelectItem>
                    <SelectItem value='PATCH'>PATCH</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='body'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Request Body (JSON)</FormLabel>
                <FormControl>
                  <Textarea placeholder='{}' className='font-mono' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='headers'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Headers (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{"Content-Type": "application/json"}'
                    className='font-mono'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>Save Changes</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  const EmailNodeForm = () => {
    const form = useForm<z.infer<typeof emailSchema>>({
      resolver: zodResolver(emailSchema),
      defaultValues: {
        label: node.data.label || '',
        description: node.data.description || '',
        email: node.data.email || '',
        subject: node.data.subject || '',
        content: node.data.content || '',
      },
    });

    const onSubmit = (values: z.infer<typeof emailSchema>) => {
      onUpdateNodeData(node.id, values);
      onClose();
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
          <FormField
            control={form.control}
            name='label'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input placeholder='Send Email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder='Email description' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient Email</FormLabel>
                <FormControl>
                  <Input placeholder='recipient@example.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='subject'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input placeholder='Email subject' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='content'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Content</FormLabel>
                <FormControl>
                  <Textarea placeholder='Email content' {...field} rows={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>Save Changes</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  const TextNodeForm = () => {
    const form = useForm<z.infer<typeof textSchema>>({
      resolver: zodResolver(textSchema),
      defaultValues: {
        label: node.data.label || '',
        description: node.data.description || '',
        text: node.data.text || '',
      },
    });

    const onSubmit = (values: z.infer<typeof textSchema>) => {
      onUpdateNodeData(node.id, values);
      onClose();
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
          <FormField
            control={form.control}
            name='label'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input placeholder='Text Box' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder='Text box description' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='text'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text Content</FormLabel>
                <FormControl>
                  <Textarea placeholder='Text content' {...field} rows={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>Save Changes</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  const SimpleNodeForm = () => {
    const form = useForm<z.infer<typeof baseSchema>>({
      resolver: zodResolver(baseSchema),
      defaultValues: {
        label: node.data.label || '',
        description: node.data.description || '',
      },
    });

    const onSubmit = (values: z.infer<typeof baseSchema>) => {
      onUpdateNodeData(node.id, values);
      onClose();
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
          <FormField
            control={form.control}
            name='label'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input placeholder='Node Label' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder='Node description' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>Save Changes</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  const renderForm = () => {
    switch (nodeType) {
      case 'api':
        return <ApiNodeForm />;
      case 'email':
        return <EmailNodeForm />;
      case 'text_box':
        return <TextNodeForm />;
      default:
        return <SimpleNodeForm />;
    }
  };

  const getNodeTypeLabel = () => {
    switch (nodeType) {
      case 'start':
        return 'Start Node';
      case 'end':
        return 'End Node';
      case 'api':
        return 'API Call';
      case 'email':
        return 'Email';
      case 'text_box':
        return 'Text Box';
      default:
        return 'Node';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle>Edit {getNodeTypeLabel()} Properties</DialogTitle>
          <DialogDescription>
            Configure the properties for this node in the workflow.
          </DialogDescription>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
