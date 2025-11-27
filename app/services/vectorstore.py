# app/services/vectorstore.py
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from typing import List, Dict, Any, Tuple, Union
import os

# Global vectorstore instance
_vectorstore = None


def get_vectorstore():
    """Get or create the global vectorstore instance"""
    global _vectorstore
    
    if _vectorstore is None:
        # Initialize embeddings
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        # Create persist directory if it doesn't exist
        persist_directory = "./chroma_db"
        os.makedirs(persist_directory, exist_ok=True)
        
        # Initialize Chroma
        _vectorstore = Chroma(
            embedding_function=embeddings,
            persist_directory=persist_directory
        )
    
    return _vectorstore


def add_documents(docs: Union[List[str], List[Dict[str, Any]]], metadatas: List[dict] = None):
    """
    Add documents to the vectorstore
    
    Args:
        docs: Either a list of strings OR a list of dicts with 'text' and 'meta' keys
        metadatas: Optional metadata (only used if docs is a list of strings)
    
    Returns:
        Tuple of (list of ids, collection info dict)
    """
    vectorstore = get_vectorstore()
    
    # Handle different input formats
    if docs and isinstance(docs[0], dict):
        # Format from storage.py: [{'id': ..., 'text': ..., 'meta': {...}}, ...]
        documents = []
        ids = []
        
        for doc_dict in docs:
            doc = Document(
                page_content=doc_dict['text'],
                metadata=doc_dict.get('meta', {})
            )
            documents.append(doc)
            ids.append(doc_dict.get('id', ''))
        
        # Add to vectorstore
        vectorstore.add_documents(documents)
        
        # Return format expected by storage.py
        collection_info = {
            'total_chunks': len(documents),
            'collection_name': 'default'
        }
        
        return ids, collection_info
        
    else:
        # Format: list of strings
        documents = [Document(page_content=text) for text in docs]
        
        if metadatas:
            for doc, metadata in zip(documents, metadatas):
                doc.metadata = metadata
        
        # Add to vectorstore
        vectorstore.add_documents(documents)
        
        ids = [f"doc_{i}" for i in range(len(documents))]
        collection_info = {
            'total_chunks': len(documents),
            'collection_name': 'default'
        }
        
        return ids, collection_info


def semantic_query(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Semantic search returning standardized format"""
    vectorstore = get_vectorstore()
    results = vectorstore.similarity_search_with_score(query, k=top_k)
    
    # Convert to standard format
    formatted_results = []
    for doc, score in results:
        formatted_results.append({
            'text': doc.page_content,
            'score': float(score),
            'meta': doc.metadata
        })
    
    return formatted_results


def search_documents(query: str, k: int = 5):
    """Search for relevant documents - returns LangChain Document objects"""
    vectorstore = get_vectorstore()
    results = vectorstore.similarity_search(query, k=k)
    return results


def clear_vectorstore():
    """Clear all documents from vectorstore"""
    global _vectorstore
    _vectorstore = None
    
    # Recreate empty vectorstore
    get_vectorstore()


# Backward compatibility aliases
def vs_add(docs: Union[List[str], List[Dict[str, Any]]], metadatas: List[dict] = None):
    """Alias for add_documents - handles both string lists and dict lists"""
    return add_documents(docs, metadatas)


def keyword_query(query: str, top_k: int = 5):
    """Keyword search - using similarity search as fallback"""
    return semantic_query(query, top_k)


def hybrid_query(query: str, top_k: int = 5):
    """Hybrid search - combines semantic and keyword"""
    return semantic_query(query, top_k)


def vs_query(query: str, k: int = 5, mode: str = "semantic"):
    """General query function with different modes"""
    if mode == "semantic":
        return semantic_query(query, k)
    elif mode == "keyword":
        return keyword_query(query, k)
    elif mode == "hybrid":
        return hybrid_query(query, k)
    else:
        return semantic_query(query, k)