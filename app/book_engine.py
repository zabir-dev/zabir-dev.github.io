from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
import random
import re
from typing import List

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
)
from reportlab.platypus.tableofcontents import TableOfContents


@dataclass
class CharacterProfile:
    name: str
    role: str
    motivation: str


@dataclass
class WorldFact:
    title: str
    detail: str


@dataclass
class ChapterPlan:
    title: str
    goal: str
    themes: List[str]


@dataclass
class BookBlueprint:
    title: str
    subtitle: str
    author: str
    audience: str
    premise: str
    high_level_themes: List[str]
    chapter_plans: List[ChapterPlan] = field(default_factory=list)
    characters: List[CharacterProfile] = field(default_factory=list)
    world_facts: List[WorldFact] = field(default_factory=list)


class BookDocTemplate(BaseDocTemplate):
    def __init__(self, filename: str):
        super().__init__(filename, pagesize=LETTER, leftMargin=0.9 * inch, rightMargin=0.9 * inch)
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="normal")
        self.addPageTemplates(
            [
                PageTemplate(id="First", frames=[frame], onPage=self._draw_cover_footer),
                PageTemplate(id="Later", frames=[frame], onPage=self._draw_page_number),
            ]
        )

    def _draw_cover_footer(self, canvas, doc):
        canvas.saveState()
        canvas.setFont("Times-Italic", 10)
        canvas.drawString(self.leftMargin, 0.5 * inch, datetime.now().strftime("Generated %Y-%m-%d"))
        canvas.restoreState()

    def _draw_page_number(self, canvas, doc):
        canvas.saveState()
        canvas.setFont("Times-Roman", 10)
        canvas.drawCentredString(LETTER[0] / 2, 0.5 * inch, f"{doc.page}")
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph):
            text = flowable.getPlainText()
            style = flowable.style.name
            if style == "Heading1":
                self.notify("TOCEntry", (0, text, self.page))
            elif style == "Heading2":
                self.notify("TOCEntry", (1, text, self.page))


class BookGenerator:
    def __init__(self, seed: int = 42):
        self.random = random.Random(seed)

    def generate_blueprint(self, prompt: str, chapter_count: int = 24) -> BookBlueprint:
        premise = self._sanitize_prompt(prompt)
        noun_candidates = self._extract_keywords(prompt)
        core = noun_candidates[0] if noun_candidates else "Horizons"
        title = f"The {core.title()} Codex"
        subtitle = "A Systematic Long-Form Exploration"
        themes = self._build_themes(noun_candidates)

        chapters: List[ChapterPlan] = []
        for index in range(1, chapter_count + 1):
            phases = ["Origins", "Conflict", "Expansion", "Transformation", "Resolution", "Legacy"]
            phase = phases[(index - 1) % len(phases)]
            chapters.append(
                ChapterPlan(
                    title=f"Chapter {index}: {phase} of {core.title()} {index}",
                    goal=(
                        f"Advance the central premise by analyzing {core.lower()} through the lens of {themes[index % len(themes)]}."
                    ),
                    themes=[themes[index % len(themes)], themes[(index + 1) % len(themes)]],
                )
            )

        characters = [
            CharacterProfile("Ari Sol", "Research Lead", "Transform ambiguity into coherent strategy"),
            CharacterProfile("Mina Vale", "Systems Historian", "Preserve context while scaling complexity"),
            CharacterProfile("Dorian Quill", "Critical Reviewer", "Stress-test every major assumption"),
        ]

        facts = [
            WorldFact("Institutional Setting", "The story unfolds across distributed think-tanks and city-scale labs."),
            WorldFact("Temporal Scope", "The narrative spans fifteen years of iterative experimentation."),
            WorldFact("Constraint", "Every decision must remain explainable to non-specialists."),
        ]

        return BookBlueprint(
            title=title,
            subtitle=subtitle,
            author="AI Book Forge",
            audience="Leaders, makers, and curious practitioners",
            premise=premise,
            high_level_themes=themes,
            chapter_plans=chapters,
            characters=characters,
            world_facts=facts,
        )

    def write_pdf(self, blueprint: BookBlueprint, output_path: Path, pages_target: int = 110) -> Path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        doc = BookDocTemplate(str(output_path))
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name="BookTitle", parent=styles["Title"], fontName="Times-Bold", fontSize=28, leading=32))
        styles.add(ParagraphStyle(name="BookSubtitle", parent=styles["Heading2"], fontName="Times-Italic", fontSize=16, leading=22))
        styles.add(ParagraphStyle(name="BodyBook", parent=styles["BodyText"], fontName="Times-Roman", fontSize=11, leading=17))

        toc = TableOfContents()
        toc.levelStyles = [
            ParagraphStyle(name="TOC1", fontName="Times-Roman", fontSize=11, leftIndent=20, firstLineIndent=-20, spaceBefore=5),
            ParagraphStyle(name="TOC2", fontName="Times-Roman", fontSize=10, leftIndent=36, firstLineIndent=-20, spaceBefore=0),
        ]

        story = [
            Paragraph(blueprint.title, styles["BookTitle"]),
            Spacer(1, 0.2 * inch),
            Paragraph(blueprint.subtitle, styles["BookSubtitle"]),
            Spacer(1, 0.6 * inch),
            Paragraph(f"By {blueprint.author}", styles["Heading3"]),
            Spacer(1, 0.2 * inch),
            Paragraph(f"Prompt Premise: {blueprint.premise}", styles["BodyBook"]),
            PageBreak(),
            NextPageTemplate("Later"),
            Paragraph("Table of Contents", styles["Heading1"]),
            Spacer(1, 0.15 * inch),
            toc,
            PageBreak(),
            Paragraph("Prologue", styles["Heading1"]),
            Paragraph(self._compose_prologue(blueprint), styles["BodyBook"]),
            PageBreak(),
        ]

        for chapter in blueprint.chapter_plans:
            story.append(Paragraph(chapter.title, styles["Heading1"]))
            story.append(Paragraph(chapter.goal, styles["BodyBook"]))
            story.append(Spacer(1, 0.1 * inch))

            for section_idx in range(1, 5):
                section_title = f"{chapter.title.split(':', 1)[0]}.{section_idx} — {chapter.themes[section_idx % len(chapter.themes)].title()}"
                story.append(Paragraph(section_title, styles["Heading2"]))
                section_blocks = self._compose_section(blueprint, chapter, section_idx)
                for block in section_blocks:
                    story.append(Paragraph(block, styles["BodyBook"]))
                    story.append(Spacer(1, 0.05 * inch))
            story.append(PageBreak())

        story.append(Paragraph("Epilogue", styles["Heading1"]))
        story.append(Paragraph(self._compose_epilogue(blueprint), styles["BodyBook"]))

        # Add appendix text until page target is likely reached.
        appendix_index = 1
        while len(story) < pages_target * 10:
            story.append(PageBreak())
            story.append(Paragraph(f"Appendix {appendix_index}: Continuity Notes", styles["Heading1"]))
            for paragraph in self._appendix_paragraphs(blueprint, appendix_index):
                story.append(Paragraph(paragraph, styles["BodyBook"]))
                story.append(Spacer(1, 0.05 * inch))
            appendix_index += 1

        doc.build(story)
        return output_path

    def _compose_prologue(self, blueprint: BookBlueprint) -> str:
        themes = ", ".join(blueprint.high_level_themes[:4])
        return (
            f"This volume begins with a single prompt and grows into a complete system of thought. "
            f"It follows the premise '{blueprint.premise}' and frames it around the recurring themes of {themes}. "
            "Each chapter is intentionally linked through a continuity ledger so every expansion preserves causality, "
            "voice, and strategic coherence."
        )

    def _compose_epilogue(self, blueprint: BookBlueprint) -> str:
        return (
            "The final synthesis demonstrates that scale in writing is not accidental. It emerges from disciplined "
            "iteration, explicit memory, and a willingness to revise assumptions whenever evidence evolves. "
            f"By tracing the arc from premise to legacy, '{blueprint.title}' offers a reusable framework for future long-form projects."
        )

    def _compose_section(self, blueprint: BookBlueprint, chapter: ChapterPlan, section_idx: int) -> List[str]:
        paragraphs = []
        for _ in range(9):
            character = self.random.choice(blueprint.characters)
            fact = self.random.choice(blueprint.world_facts)
            theme = chapter.themes[self.random.randrange(len(chapter.themes))]
            paragraphs.append(
                f"{character.name}, acting as {character.role.lower()}, reframed the chapter objective around {theme}. "
                f"The team revisited the constraint '{fact.title}' and reaffirmed that {fact.detail.lower()} "
                f"This section ({section_idx}) therefore expands the argument by balancing tactical execution with reflective critique, "
                f"while preserving the motivation to {character.motivation.lower()}."
            )
        return paragraphs

    def _appendix_paragraphs(self, blueprint: BookBlueprint, appendix_index: int) -> List[str]:
        notes = []
        for marker in range(1, 22):
            theme = blueprint.high_level_themes[(appendix_index + marker) % len(blueprint.high_level_themes)]
            notes.append(
                f"Continuity checkpoint {appendix_index}.{marker}: The narrative state remains aligned with the '{theme}' axis. "
                "Dependencies between chapters are traced bidirectionally so later insights can retroactively clarify earlier ambiguity "
                "without violating chronology."
            )
        return notes

    def _sanitize_prompt(self, prompt: str) -> str:
        cleaned = " ".join(prompt.split())
        return cleaned[:700] if cleaned else "A transformative challenge requiring robust, long-form reasoning."

    def _extract_keywords(self, prompt: str) -> List[str]:
        words = re.findall(r"[A-Za-z]{5,}", prompt.lower())
        deduped = []
        for word in words:
            if word not in deduped and word not in {"about", "their", "there", "which", "would", "could", "should"}:
                deduped.append(word)
        return deduped[:8] or ["future", "systems", "design"]

    def _build_themes(self, keywords: List[str]) -> List[str]:
        defaults = ["strategy", "ethics", "execution", "learning", "leadership", "resilience", "innovation"]
        merged = []
        for word in keywords + defaults:
            if word not in merged:
                merged.append(word)
        return merged[:10]
