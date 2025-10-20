# Claude Code MCP Server Setup

This guide explains how to configure MCP (Model Context Protocol) servers for Claude Code to match the same functionality available in Cursor.

## Configuration Files Created

I've created the following configuration files for you:

1. **`.claude.json`** - Main Claude Code configuration with all MCP servers
2. **`.claude.json.secure`** - Alternative configuration using environment variables

## MCP Servers Configured

The following MCP servers are now available in both Cursor and Claude Code:

### 🤖 Task Master AI
- **Purpose**: Project management and task automation
- **Environment Variables**: `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `OPENAI_API_KEY`

### 🐙 GitHub Integration
- **Purpose**: GitHub repository management and PR handling
- **Environment Variables**: `GITHUB_PERSONAL_ACCESS_TOKEN`

### 📁 Filesystem Access
- **Purpose**: Read/write access to project files
- **Path**: `/home/jitin-m-nair/Desktop/polaris-v3`

### 🧠 Memory Management
- **Purpose**: Persistent memory across conversations

### 🗄️ PostgreSQL Database
- **Purpose**: Direct database access and querying
- **Connection**: Supabase PostgreSQL instance

### 🌐 Web Automation
- **Purpose**: Browser automation and web scraping
- **Server**: Puppeteer MCP server

### 🧩 Sequential Thinking
- **Purpose**: Structured reasoning and planning

### 🎨 Shadcn/UI
- **Purpose**: Component library integration

### 🔍 ESLint Integration
- **Purpose**: Code linting and formatting

### 🔷 Supabase Tools
- **Purpose**: Database management and API access
- **Environment Variables**: Multiple Supabase keys

### 📊 Deep Graph MCP
- **Purpose**: Code analysis and dependency mapping
- **Repository**: `notjitin-1994/polaris-v3`

### 🦆 DuckDuckGo Search
- **Purpose**: Web search capabilities

### 📚 Context7
- **Purpose**: Documentation and knowledge base access
- **Environment Variables**: `CONTEXT7_API_KEY`

### 🌐 Fetch Server
- **Purpose**: HTTP request capabilities

## Setup Instructions

### Option 1: Direct Configuration (Recommended for development)

Use the `.claude.json` file I created, which has the API keys directly embedded. **Note**: This approach exposes API keys in the configuration file.

### Option 2: Environment Variable Configuration (More Secure)

1. Create a `.env` file in your project root with your API keys:
   ```bash
   cp .env.mcp.example .env
   # Edit .env with your actual API keys
   ```

2. Use the `.claude.json.secure` configuration which references environment variables using `"${VAR_NAME}"` syntax.

## Required API Keys

You'll need these API keys for full functionality:

### Required (for Task Master AI):
- `ANTHROPIC_API_KEY` - Claude API key
- `PERPLEXITY_API_KEY` - Perplexity AI key
- `OPENAI_API_KEY` - OpenAI API key

### Optional (for additional features):
- `GITHUB_PERSONAL_ACCESS_TOKEN` - GitHub integration
- `CONTEXT7_API_KEY` - Documentation access
- Various Supabase keys (already configured)

## How to Use

1. **In Claude Code terminal**, the MCP servers will be automatically available
2. **In Cursor**, MCP servers are already configured via `.cursor/mcp.json`
3. **Available tools**: All the same MCP tools you use in Cursor will be available in Claude Code

## Security Notes

- ⚠️ **Important**: The `.claude.json` file contains API keys in plain text
- 🔒 For production use, prefer the `.claude.json.secure` approach with environment variables
- 🔑 Never commit API keys to version control
- 🔄 Rotate API keys regularly for security

## Troubleshooting

If MCP servers don't work in Claude Code:

1. **Check API keys**: Ensure all required API keys are valid
2. **Restart Claude Code**: Sometimes a restart is needed for configuration changes
3. **Check logs**: Look for error messages in the Claude Code terminal
4. **Verify packages**: Ensure all MCP server packages are installed (`npm install` if needed)

## Next Steps

Now you have the same powerful MCP server capabilities in both Cursor and Claude Code! You can:

- Use Task Master for project management
- Access your Supabase database directly
- Search and browse the web
- Access documentation and knowledge bases
- Analyze your codebase structure
- And much more!

The configuration provides the same rich development environment across both tools.
