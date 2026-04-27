# Bakery MCP Server

Enables LLMs to query and manipulate bakery production data via Model Context Protocol.

## Features

- Query recipes, mixing records, materials, and preparations
- Create and update mixing records (with confirmation)
- Bearer Token authentication
- stdio transport for secure communication

## Setup

1. **Run database migrations:**
   ```bash
   cd backend
   node setup-api-token.js
   ```

2. **Get the generated token** from the migration output (printed to console)

3. **Build the MCP server:**
   ```bash
   cd mcp-server
   npm install
   npm run build
   ```

4. **Configure your LLM client** (see examples/ directory)

## Tools

| Tool | Description | Type |
|------|-------------|------|
| get_recipes | Query all recipes | Read |
| get_recipe_detail | Get recipe details by ID | Read |
| get_records | Query mixing records | Read |
| get_materials | Query materials registry | Read |
| get_preparations | Query preparation recipes | Read |
| create_record | Create mixing record | Write (confirm required) |
| update_record | Update mixing record | Write (confirm required) |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| BAKERY_API_TOKEN | API token from llm user | Yes |
| BAKERY_API_URL | Backend URL (default: http://backend:8080) | No |

## Client Configuration

See examples/ directory for Claude Desktop, Cursor, VS Code, and OpenCode configs.

## Security

- Tokens are stored in plain text in the database
- Each request must include: `Authorization: Bearer <token>`
- Write operations require explicit `confirm: true` parameter

## Error Handling

The MCP Server handles backend errors using a structured format:

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

**Common Error Codes:**
| Code | Meaning |
|------|---------|
| `UNAUTHORIZED` | Invalid or missing API token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Requested resource not found |
| `BAD_REQUEST` | Invalid request parameters |
| `INTERNAL_ERROR` | Server-side error |

## Troubleshooting

### "BAKERY_API_TOKEN environment variable is required"
Make sure the environment variable is set in your client configuration.

### "Unauthorized" errors
Verify the token matches what was generated during migration.

### Connection refused
Ensure the backend is running and BAKERY_API_URL is correct.
