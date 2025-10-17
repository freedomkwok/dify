from collections.abc import Generator
from typing import Any
import httpx
import json

from core.tools.builtin_tool.tool import BuiltinTool
from core.tools.entities.tool_entities import ToolInvokeMessage
from core.tools.errors import ToolInvokeError
from core.helper import ssrf_proxy


class CustomWebserverTool(BuiltinTool):
    """
    Custom tool that uses Dify's LLM interface but calls your web server
    """
    
    def _invoke(
        self,
        user_id: str,
        tool_parameters: dict[str, Any],
        conversation_id: str | None = None,
        app_id: str | None = None,
        message_id: str | None = None,
    ) -> Generator[ToolInvokeMessage, None, None]:
        """
        Invoke the custom tool with web server backend
        """
        try:
            # Get parameters from the tool call
            query = tool_parameters.get("query", "")
            server_url = tool_parameters.get("server_url", "http://localhost:8000")
            endpoint = tool_parameters.get("endpoint", "/api/process")
            
            if not query:
                yield self.create_text_message("Please provide a query parameter")
                return
            
            # Prepare the request to your web server
            request_data = {
                "query": query,
                "user_id": user_id,
                "conversation_id": conversation_id,
                "app_id": app_id,
                "message_id": message_id,
                "context": {
                    "tenant_id": self.runtime.tenant_id if self.runtime else None,
                    "tool_name": self.entity.identity.name
                }
            }
            
            # Make HTTP request to your web server
            full_url = f"{server_url.rstrip('/')}/{endpoint.lstrip('/')}"
            
            response = ssrf_proxy.post(
                full_url,
                json=request_data,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "Dify-Custom-Tool/1.0"
                },
                timeout=(10, 60)  # 10s connect, 60s read
            )
            
            if response.status_code != 200:
                yield self.create_text_message(f"Error: Server returned status {response.status_code}")
                return
            
            # Parse response from your web server
            try:
                server_response = response.json()
            except json.JSONDecodeError:
                yield self.create_text_message(f"Error: Invalid JSON response from server")
                return
            
            # Process the response using Dify's LLM if needed
            if tool_parameters.get("use_llm_processing", True):
                # Use Dify's LLM to process the server response
                processed_result = self._process_with_llm(
                    user_id=user_id,
                    original_query=query,
                    server_response=server_response,
                    processing_instruction=tool_parameters.get("processing_instruction", "")
                )
                yield self.create_text_message(processed_result)
            else:
                # Return raw server response
                yield self.create_text_message(json.dumps(server_response, indent=2))
                
        except httpx.TimeoutException:
            yield self.create_text_message("Error: Request to web server timed out")
        except httpx.ConnectError:
            yield self.create_text_message("Error: Could not connect to web server")
        except Exception as e:
            raise ToolInvokeError(f"Custom webserver tool error: {str(e)}")
    
    def _process_with_llm(
        self, 
        user_id: str, 
        original_query: str, 
        server_response: dict, 
        processing_instruction: str = ""
    ) -> str:
        """
        Use Dify's LLM to process the web server response
        """
        # Create a prompt for the LLM to process the server response
        system_prompt = f"""You are a helpful assistant that processes responses from a custom web server.

{processing_instruction}

Your task is to:
1. Understand the user's original query: "{original_query}"
2. Process the server response data
3. Provide a clear, helpful response to the user

Server Response Data:
{json.dumps(server_response, indent=2)}

Please provide a natural, conversational response that addresses the user's query using the server data."""

        user_prompt = f"Original user query: {original_query}"
        
        # Use Dify's LLM to process the response
        llm_result = self.invoke_model(
            user_id=user_id,
            prompt_messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            stop=[]
        )
        
        return llm_result.message.content
