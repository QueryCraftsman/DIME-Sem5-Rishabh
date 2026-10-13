"""
Text normalization utilities for the Document Intelligence Pipeline.
Ensures deterministic content representation before hashing and chunking.
"""

import re
import unicodedata


class TextNormalizer:
    """Provides text normalization rules."""

    @staticmethod
    def normalize_text(text: str | None) -> str:
        """
        Normalize textual content.
        - Normalizes Unicode (NFKC)
        - Normalizes line endings
        - Removes repeated empty lines
        - Strips leading/trailing whitespace
        """
        if not text:
            return ""

        # 1. Unicode Normalization (NFKC to fold compatible characters like ligatures/spaces)
        normalized = unicodedata.normalize("NFKC", text)

        # 2. Normalize line endings to \n
        normalized = normalized.replace("\r\n", "\n").replace("\r", "\n")

        # 3. Collapse multiple blank lines down to a maximum of 2 newlines (1 blank line)
        # We preserve paragraph boundaries but remove extreme vertical whitespace
        normalized = re.sub(r"\n{3,}", "\n\n", normalized)

        # 4. Collapse multiple inline spaces to a single space, but leave newlines alone
        # We avoid \s because it matches newlines too. Instead we match [ \t]+
        normalized = re.sub(r"[ \t]+", " ", normalized)

        # 5. Strip each line and rebuild, dropping trailing empty lines
        lines = [line.strip() for line in normalized.split("\n")]
        
        # 6. Rejoin and collapse newly formed multiple newlines
        normalized = "\n".join(lines).strip()
        normalized = re.sub(r"\n{3,}", "\n\n", normalized)

        return normalized
