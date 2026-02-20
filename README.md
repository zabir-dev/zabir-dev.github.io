# Book Forge

Book Forge is a full-stack application that turns a single user prompt into a deeply structured, professionally formatted long-form PDF book (100+ pages by default).

## Features

- Prompt-to-book blueprint generation with themes, chapter plans, characters, and continuity facts.
- Multi-stage expansion from outline to sections and appendix continuity notes.
- Professional PDF formatting with title pages, table of contents, chapter headings, and pagination.
- Browser-based UI to submit prompts and download generated books.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000

## Test

```bash
pytest
```
