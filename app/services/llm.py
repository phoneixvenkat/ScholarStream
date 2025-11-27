"""
Multi-model LLM service using Ollama
Supports: Mistral, LLaMA3, Phi-3
"""
import ollama
from typing import Optional, Dict, Any

# Available models
AVAILABLE_MODELS = {
    "mistral": "mistral:latest",
    "llama3": "llama3:latest", 
    "phi3": "phi3:latest"
}

def get_available_models():
    """Return list of available models"""
    return list(AVAILABLE_MODELS.keys())

def generate_response(
    prompt: str,
    model_name: str = "mistral",
    max_tokens: int = 500,
    temperature: float = 0.7
) -> Dict[str, Any]:
    """
    Generate response from specified LLM model
    
    Args:
        prompt: The input prompt
        model_name: One of 'mistral', 'llama3', 'phi3'
        max_tokens: Maximum tokens to generate
        temperature: Sampling temperature
        
    Returns:
        Dict with 'response', 'model', 'success', 'error'
    """
    try:
        # Validate model
        if model_name not in AVAILABLE_MODELS:
            return {
                "success": False,
                "error": f"Model '{model_name}' not available. Choose from: {list(AVAILABLE_MODELS.keys())}",
                "model": model_name,
                "response": None
            }
        
        model_id = AVAILABLE_MODELS[model_name]
        
        # Generate response
        response = ollama.generate(
            model=model_id,
            prompt=prompt,
            options={
                "num_predict": max_tokens,
                "temperature": temperature
            }
        )
        
        return {
            "success": True,
            "response": response['response'],
            "model": model_name,
            "error": None
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "model": model_name,
            "response": None
        }

def generate_multi_model_responses(
    prompt: str,
    models: list = None,
    max_tokens: int = 500,
    temperature: float = 0.7
) -> Dict[str, Any]:
    """
    Generate responses from multiple models simultaneously
    
    Args:
        prompt: The input prompt
        models: List of model names (default: all available)
        max_tokens: Maximum tokens per model
        temperature: Sampling temperature
        
    Returns:
        Dict with responses from each model
    """
    if models is None:
        models = list(AVAILABLE_MODELS.keys())
    
    results = {}
    
    for model in models:
        result = generate_response(
            prompt=prompt,
            model_name=model,
            max_tokens=max_tokens,
            temperature=temperature
        )
        results[model] = result
    
    return {
        "prompt": prompt,
        "models_used": models,
        "responses": results
    }

def test_model_availability():
    """Test which models are actually available in Ollama"""
    available = []
    unavailable = []
    
    for model_name, model_id in AVAILABLE_MODELS.items():
        try:
            # Try a minimal generation
            ollama.generate(
                model=model_id,
                prompt="test",
                options={"num_predict": 1}
            )
            available.append(model_name)
        except Exception as e:
            unavailable.append({"model": model_name, "error": str(e)})
    
    return {
        "available": available,
        "unavailable": unavailable
    }