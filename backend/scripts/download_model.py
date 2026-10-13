"""
DIME Backend — Pre-download Embedding Model
Run this script during Docker build or deployment to ensure the model is cached.
"""

import logging
from backend.core.embeddings import SentenceTransformerProvider
from backend.core.config import get_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("Pre-downloading embedding model...")
    try:
        provider = SentenceTransformerProvider()
        # Do a dummy embed to ensure it's fully initialized
        provider.embed("DIME initialization test.")
        logger.info(f"Model '{provider.model_name}' successfully cached. Dimension: {provider.dimension}")
        
        logger.info("Pre-downloading reranker model...")
        from sentence_transformers import CrossEncoder
        settings = get_settings()
        # Load the cross encoder
        reranker = CrossEncoder(settings.reranker_model_name, device=settings.reranker_device)
        logger.info(f"Reranker model '{settings.reranker_model_name}' successfully cached.")
        
    except Exception as e:
        logger.error(f"Failed to cache models: {e}")
        exit(1)
