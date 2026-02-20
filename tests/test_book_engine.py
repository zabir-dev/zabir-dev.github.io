from pathlib import Path

from app.book_engine import BookGenerator


def test_blueprint_contains_requested_structure():
    generator = BookGenerator(seed=7)
    blueprint = generator.generate_blueprint("Build a detailed treatise on climate-resilient urban infrastructure", chapter_count=24)

    assert len(blueprint.chapter_plans) == 24
    assert blueprint.title
    assert blueprint.premise.startswith("Build")


def test_pdf_generation(tmp_path: Path):
    generator = BookGenerator(seed=7)
    blueprint = generator.generate_blueprint("Prompt about deep systems and policy")
    output = tmp_path / "book.pdf"

    written = generator.write_pdf(blueprint, output, pages_target=20)
    assert written.exists()
    assert written.stat().st_size > 0
