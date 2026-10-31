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

class NvidiaProvider(LLMProvider):
    """
    NVIDIA AI API Provider supporting NVIDIA NIM endpoints
    (e.g. meta/llama-3.3-70b-instruct, mistralai/mixtral-8x22b-instruct).
    """
    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "meta/llama-3.3-70b-instruct",
        base_url: str = "https://integrate.api.nvidia.com/v1"
    ):
        self.api_key = api_key or os.getenv("NVIDIA_API_KEY") or os.getenv("NV_API_KEY")
        self.model_name = os.getenv("NVIDIA_MODEL", model_name)
        self.base_url = (os.getenv("NVIDIA_BASE_URL") or base_url).rstrip("/")

    def generate_json(self, prompt: str, schema_class: Optional[Type[BaseModel]] = None, system_instruction: str = "") -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("NVIDIA AI API key is not configured (set NVIDIA_API_KEY in environment).")
        
        import requests
        
        full_system = (
            "You are an enterprise AI RFP Intelligence engine for RecLens / BidForge AI. "
            "You MUST respond ONLY with valid, raw JSON (no markdown backticks, no commentary). "
            "Follow strict evidence-first rules: Never invent requirements. Every requirement must cite page and section. "
            + system_instruction
        )
        
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": full_system},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "top_p": 0.7,
            "max_tokens": 4096,
            "response_format": {"type": "json_object"}
        }
        
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=90)
            resp.raise_for_status()
            data = resp.json()
            raw_content = data["choices"][0]["message"]["content"].strip()
            # Clean possible markdown json wrapper
            cleaned = re.sub(r"^```(?:json)?\s*", "", raw_content, flags=re.MULTILINE)
            cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE).strip()
            return json.loads(cleaned)
        except Exception as e:
            raise RuntimeError(f"NVIDIA AI API request failed: {e}")

class LLMFactory:
    @staticmethod
    def get_provider() -> Optional[LLMProvider]:
        provider_name = os.getenv("LLM_PROVIDER", "").lower()
        nvidia_key = os.getenv("NVIDIA_API_KEY") or os.getenv("NV_API_KEY")
        gemini_key = os.getenv("GEMINI_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")
        
        # Priority to NVIDIA if specified or if NVIDIA key exists
        if provider_name in ["nvidia", "nv"] or (nvidia_key and provider_name not in ["gemini", "openai"]):
            try:
                return NvidiaProvider()
            except Exception as e:
                print(f"[LLMFactory] NVIDIA AI init failed: {e}")
        
        if provider_name == "openai" or (openai_key and not gemini_key and not nvidia_key):
            try:
                return OpenAIProvider()
            except Exception as e:
                print(f"[LLMFactory] OpenAI init failed: {e}")
        
        if provider_name == "gemini" or gemini_key:
            try:
                return GeminiProvider()
            except Exception as e:
                print(f"[LLMFactory] Gemini init failed: {e}")

        # Fallback to Nvidia if key exists
        if nvidia_key:
            try:
                return NvidiaProvider()
            except Exception as e:
                print(f"[LLMFactory] NVIDIA AI fallback init failed: {e}")
                
        return None
