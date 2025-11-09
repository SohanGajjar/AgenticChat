export interface Message {
  type: "user" | "ai" | "system";
  content: string;
}

export interface EventMessage {
  type:
    | "reasoning"
    | "tool_call"
    | "tool_result"
    | "response_start"
    | "response_chunk"
    | "response_end"
    | "response"
    | "done"
    | "error";
  content?: string;
  tool?: string;
  input?: string;
  output?: string;
}
