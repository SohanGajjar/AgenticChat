// Message types for streaming
export type MessageType = 'reasoning' | 'tool_call' | 'response' | 'error';

// Streaming message structure
export interface StreamMessage {
  type: MessageType;
  content?: string;
  tool?: string;
  input?: string;
  output?: string;
}

// Chat request from frontend
export interface ChatRequest {
  query: string;
}

// Chat response
export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Tool result structure
export interface ToolResult {
  tool: string;
  input: string;
  output: string;
}