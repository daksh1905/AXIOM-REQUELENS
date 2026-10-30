import os
import json
import re
from typing import Dict, Any, Optional, Type
from pydantic import BaseModel

class LLMProvider:
    """Base interface for LLM providers."""
    def generate_json(self, prompt: str, schema_class: Optional[Type[BaseModel]] = None, system_instruction: str = "") -> Dict[str, Any]:
        raise NotImplementedError

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = os.getenv("GEMINI_MODEL", model_name)
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[GeminiProvider] Init warning: {e}")

    def generate_json(self, prompt: str, schema_class: Optional[Type[BaseModel]] = None, system_instruction: str = "") -> Dict[str, Any]:
        if not self.client:
            raise ValueError("Gemini API key is not configured.")
        
        full_system = (
            "You are an enterprise AI RFP Intelligence engine for RecLens. "
            "You MUST respond ONLY with valid, raw JSON (no markdown fences, no explanatory text outside the JSON). "
            "Follow evidence-first rules: Never invent requirements. Every requirement must cite page and section. "
            + system_instruction
        )
        
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config={
                "system_instruction": full_system,
                "response_mime_type": "application/json"
            }
        )
        
        text = response.text.strip()
        # Clean json backticks if any
        text = re.sub(r"^```(?:json)?", "", text, flags=re.MULTILINE).strip("`").strip()
        return json.loads(text)

class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gpt-4o"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model_name = os.getenv("OPENAI_MODEL", model_name)
        self.client = None
        if self.api_key:
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=self.api_key)
            except Exception as e:
                print(f"[OpenAIProvider] Init warning: {e}")

    def generate_json(self, prompt: str, schema_class: Optional[Type[BaseModel]] = None, system_instruction: str = "") -> Dict[str, Any]:
        if not self.client:
            raise ValueError("OpenAI API key is not configured.")
            
        full_system = (
            "You are an enterprise AI RFP Intelligence engine for RecLens. "
            "You MUST respond ONLY with valid, raw JSON. "
            "Follow evidence-first rules: Never invent requirements. Every requirement must cite page and section. "
            + system_instruction
        )
        
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": full_system},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content.strip()
        return json.loads(content)

class LLMFactory:
    @staticmethod
    def get_provider() -> Optional[LLMProvider]:
        provider_name = os.getenv("LLM_PROVIDER", "").lower()
        gemini_key = os.getenv("GEMINI_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")
        
        if provider_name == "openai" or (openai_key and not gemini_key):
            try:
                return OpenAIProvider()
            except Exception as e:
                print(f"[LLMFactory] OpenAI init failed: {e}")
        
        if provider_name == "gemini" or gemini_key:
            try:
                return GeminiProvider()
            except Exception as e:
                print(f"[LLMFactory] Gemini init failed: {e}")
                
        return None

