import pytest
from backend.ingestion.normalizer import TextNormalizer

def test_normalize_empty_text() -> None:
    assert TextNormalizer.normalize_text("") == ""
    assert TextNormalizer.normalize_text("   ") == ""

def test_normalize_unicode() -> None:
    # \uFB01 is 'fi' ligature, \u00A0 is non-breaking space
    text = "of\uFB01ce\u00A0space"
    result = TextNormalizer.normalize_text(text)
    assert result == "office space"

def test_normalize_line_endings() -> None:
    text = "Line 1\r\nLine 2\rLine 3"
    result = TextNormalizer.normalize_text(text)
    assert result == "Line 1\nLine 2\nLine 3"

def test_normalize_multiple_newlines() -> None:
    text = "Paragraph 1\n\n\n\n\nParagraph 2\n\n\nParagraph 3"
    result = TextNormalizer.normalize_text(text)
    assert result == "Paragraph 1\n\nParagraph 2\n\nParagraph 3"

def test_normalize_inline_spaces() -> None:
    text = "Word 1    Word 2\t\tWord 3"
    result = TextNormalizer.normalize_text(text)
    assert result == "Word 1 Word 2 Word 3"

def test_normalize_complex() -> None:
    text = "   Title   \r\n\n\n\n   Paragraph 1 with  lots   of space  \n\n \n \t \n Paragraph 2   "
    result = TextNormalizer.normalize_text(text)
    expected = "Title\n\nParagraph 1 with lots of space\n\nParagraph 2"
    assert result == expected
