import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import * as backend from './backend.js';

const server = new Server(
  { name: 'bakery-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

const tools = [
  {
    name: 'get_recipes',
    description: 'Query all bread recipes (dough formulations)',
    inputSchema: z.object({ type: z.enum(['dough', 'preparation']).optional() }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
    },
    handler: async (args: any) => backend.getRecipes(args?.type),
  },
  {
    name: 'get_recipe_detail',
    description: 'Get detailed recipe information by ID',
    inputSchema: z.object({ id: z.number() }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
    },
    handler: async (args: any) => backend.getRecipeDetail(args.id),
  },
  {
    name: 'get_records',
    description: 'Query mixing records',
    inputSchema: z.object({ limit: z.number().optional().default(50), offset: z.number().optional().default(0) }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
    },
    handler: async (args: any) => backend.getRecords(args),
  },
  {
    name: 'get_materials',
    description: 'Query all materials (unified registry)',
    inputSchema: z.object({}),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
    },
    handler: async () => backend.getMaterials(),
  },
  {
    name: 'get_preparations',
    description: 'Query all preparation recipes (semi-finished products)',
    inputSchema: z.object({}),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
    },
    handler: async () => backend.getPreparations(),
  },
  {
    name: 'create_record',
    description: 'Create a new mixing record. Requires confirm: true to proceed.',
    inputSchema: backend.CreateRecordInput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
    },
    handler: async (args: any) => {
      if (!args.confirm) {
        return { warning: 'This is a write operation. Please set confirm: true to proceed.', data: args };
      }
      return backend.createRecord(args);
    },
  },
  {
    name: 'update_record',
    description: 'Update an existing mixing record. Requires confirm: true to proceed.',
    inputSchema: backend.UpdateRecordInput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
    },
    handler: async (args: any) => {
      if (!args.confirm) {
        return { warning: 'This is a write operation. Please set confirm: true to proceed.', data: args };
      }
      return backend.updateRecord(args.batch_number, args);
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map(t => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
    annotations: t.annotations,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const tool = tools.find(t => t.name === name);
  if (!tool) {
    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  }
  try {
    const result = await tool.handler(args);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Bakery MCP Server started');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
