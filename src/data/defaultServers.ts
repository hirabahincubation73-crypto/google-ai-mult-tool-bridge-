import { MCPServerConfig } from '../types/mcp';

export const DEFAULT_SERVERS: MCPServerConfig[] = [
  {
    id: 'mcp-filesystem',
    name: 'Filesystem Server',
    description: 'Direct secure access to local directories, reading/writing files, directory tree inspection, and search.',
    category: 'filesystem',
    author: 'Anthropic & MCP Core',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/workspace'],
    env: {
      ALLOWED_DIRECTORIES: '/workspace,/app/applet',
    },
    iconName: 'FolderTree',
    version: '0.6.2',
    isInstalled: true,
    isEnabled: true,
    status: 'connected',
    latencyMs: 14,
    lastPing: 'Just now',
    tools: [
      {
        name: 'read_file',
        description: 'Read the complete contents of a file from the allowed filesystem path.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to the file to read (relative or absolute)' },
          },
          required: ['path'],
        },
      },
      {
        name: 'write_file',
        description: 'Create a new file or completely overwrite an existing file with new content.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to the file to write' },
            content: { type: 'string', description: 'Content to write into the file' },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'list_directory',
        description: 'Get a detailed list of all files and subdirectories in a directory path.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Directory path to inspect (defaults to root)' },
          },
        },
      },
      {
        name: 'search_files',
        description: 'Search for files matching a glob pattern or keyword.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Starting directory for search' },
            pattern: { type: 'string', description: 'Search query or glob pattern' },
          },
          required: ['pattern'],
        },
      },
    ],
    resources: [
      { uri: 'file:///workspace/package.json', name: 'package.json', mimeType: 'application/json' },
      { uri: 'file:///workspace/README.md', name: 'README.md', mimeType: 'text/markdown' },
    ],
  },
  {
    id: 'mcp-github',
    name: 'GitHub Server',
    description: 'Integrates with GitHub API to search repositories, inspect issues, pull requests, file trees, and commits.',
    category: 'developer',
    author: 'Model Context Protocol',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: 'ghp_sampleTokenStoredSecurely',
    },
    iconName: 'Github',
    version: '0.4.1',
    isInstalled: true,
    isEnabled: true,
    status: 'connected',
    latencyMs: 42,
    lastPing: '1m ago',
    tools: [
      {
        name: 'search_repositories',
        description: 'Search for GitHub repositories via keywords, topics, or language.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term or query e.g. "mcp servers language:typescript"' },
            sort: { type: 'string', description: 'Sort criteria: stars, forks, or updated', enum: ['stars', 'forks', 'updated'] },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_repository',
        description: 'Get metadata, stats, stars, open issues and topics for a specific repository.',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'GitHub username or organization' },
            repo: { type: 'string', description: 'Repository name' },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'list_issues',
        description: 'List issues and PRs for a repository with optional state filter.',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            state: { type: 'string', enum: ['open', 'closed', 'all'], description: 'Issue state filter' },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'get_file_contents',
        description: 'Fetch the raw contents of a specific file on a branch or commit.',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            path: { type: 'string', description: 'Path to file in repo' },
            branch: { type: 'string', description: 'Branch name (defaults to main)' },
          },
          required: ['owner', 'repo', 'path'],
        },
      },
    ],
  },
  {
    id: 'mcp-fetch',
    name: 'Fetch & Web Scraper',
    description: 'Converts any web page or REST API response to clean LLM-ready markdown or text for grounding.',
    category: 'web',
    author: 'MCP Community',
    transport: 'stdio',
    command: 'uvx',
    args: ['mcp-server-fetch'],
    iconName: 'Globe',
    version: '0.2.0',
    isInstalled: true,
    isEnabled: true,
    status: 'connected',
    latencyMs: 85,
    lastPing: 'Just now',
    tools: [
      {
        name: 'fetch_url',
        description: 'Fetches content from a web URL and returns markdown-converted text.',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'The HTTP or HTTPS URL to fetch' },
            max_length: { type: 'number', description: 'Maximum characters to retrieve (default 8000)' },
            raw: { type: 'boolean', description: 'Return raw HTML instead of Markdown' },
          },
          required: ['url'],
        },
      },
    ],
  },
  {
    id: 'mcp-sqlite',
    name: 'SQLite Database',
    description: 'Direct SQL query execution, schema inspection, and analytics over local SQLite databases.',
    category: 'database',
    author: 'Model Context Protocol',
    transport: 'stdio',
    command: 'uvx',
    args: ['mcp-server-sqlite', '--db-path', './data/analytics.db'],
    iconName: 'Database',
    version: '0.3.1',
    isInstalled: true,
    isEnabled: true,
    status: 'connected',
    latencyMs: 8,
    lastPing: '2m ago',
    tools: [
      {
        name: 'read_query',
        description: 'Execute a read-only SELECT query against the SQLite database.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'SQL SELECT query to execute' },
          },
          required: ['query'],
        },
      },
      {
        name: 'write_query',
        description: 'Execute an INSERT, UPDATE, or DELETE query against the database.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'SQL mutation statement' },
          },
          required: ['query'],
        },
      },
      {
        name: 'describe_tables',
        description: 'Inspect tables and their schemas, columns, types, and primary keys.',
        inputSchema: {
          type: 'object',
          properties: {
            table_name: { type: 'string', description: 'Optional table name to filter schema' },
          },
        },
      },
    ],
  },
  {
    id: 'mcp-memory',
    name: 'Knowledge Graph Memory',
    description: 'Maintains long-term stateful memory graph with entities, relations, and observations across sessions.',
    category: 'productivity',
    author: 'Anthropic Core',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    iconName: 'BrainCircuit',
    version: '0.5.0',
    isInstalled: true,
    isEnabled: true,
    status: 'connected',
    latencyMs: 19,
    lastPing: 'Just now',
    tools: [
      {
        name: 'create_entities',
        description: 'Create multiple new entities in the persistent knowledge graph.',
        inputSchema: {
          type: 'object',
          properties: {
            entities: {
              type: 'string',
              description: 'JSON array of entities with name, entityType, and observations',
            },
          },
          required: ['entities'],
        },
      },
      {
        name: 'create_relations',
        description: 'Create directional relationships between existing entities in the graph.',
        inputSchema: {
          type: 'object',
          properties: {
            relations: {
              type: 'string',
              description: 'JSON array of relations with from, to, and relationType',
            },
          },
          required: ['relations'],
        },
      },
      {
        name: 'search_nodes',
        description: 'Search entities and observations in the knowledge graph.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Keywords to search knowledge nodes' },
          },
          required: ['query'],
        },
      },
      {
        name: 'read_graph',
        description: 'Reads the entire knowledge graph data structure.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  },
  {
    id: 'mcp-brave-search',
    name: 'Brave Search Engine',
    description: 'Real-time web search and local business directory search using Brave API index.',
    category: 'web',
    author: 'Brave Software',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    env: {
      BRAVE_API_KEY: 'BSA_sampleKeyConfigured',
    },
    iconName: 'Compass',
    version: '0.2.1',
    isInstalled: false,
    isEnabled: false,
    status: 'idle',
    tools: [
      {
        name: 'brave_web_search',
        description: 'Execute a web search using Brave Search API with ranked results.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Web search query' },
            count: { type: 'number', description: 'Number of results to return (default 5)' },
          },
          required: ['query'],
        },
      },
    ],
  },
  {
    id: 'mcp-postgres',
    name: 'PostgreSQL Server',
    description: 'PostgreSQL connection inspector with read-only transaction isolation and schema browsing.',
    category: 'database',
    author: 'Model Context Protocol',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://user:pass@localhost:5432/main'],
    iconName: 'Server',
    version: '0.4.0',
    isInstalled: false,
    isEnabled: false,
    status: 'stopped',
    tools: [
      {
        name: 'query',
        description: 'Run SQL query in read-only transaction.',
        inputSchema: {
          type: 'object',
          properties: {
            sql: { type: 'string', description: 'SQL query' },
          },
          required: ['sql'],
        },
      },
    ],
  },
  {
    id: 'mcp-slack',
    name: 'Slack Gateway',
    description: 'Interact with Slack workspace channels, threads, user directories, and post updates.',
    category: 'productivity',
    author: 'Model Context Protocol',
    transport: 'sse',
    url: 'https://mcp.internal.company.net/slack/sse',
    iconName: 'MessageSquare',
    version: '0.1.9',
    isInstalled: false,
    isEnabled: false,
    status: 'idle',
    tools: [
      {
        name: 'post_message',
        description: 'Post a chat message to a Slack channel.',
        inputSchema: {
          type: 'object',
          properties: {
            channel_id: { type: 'string', description: 'Slack channel ID e.g. C01234567' },
            text: { type: 'string', description: 'Message text content' },
          },
          required: ['channel_id', 'text'],
        },
      },
      {
        name: 'list_channels',
        description: 'List public and joined private channels.',
        inputSchema: {
          type: 'object',
          properties: {
            types: { type: 'string', description: 'public_channel,private_channel' },
          },
        },
      },
    ],
  },
];
