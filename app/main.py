from __future__ import annotations

from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.book_engine import BookGenerator

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "generated_books"

app = FastAPI(title="Book Forge", version="1.0.0")
app.mount("/static", StaticFiles(directory=BASE_DIR / "app" / "static"), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "app" / "templates"))


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/generate", response_class=HTMLResponse)
async def generate(request: Request, prompt: str = Form(...), author: str = Form("AI Book Forge")):
    if len(prompt.strip()) < 20:
        raise HTTPException(status_code=400, detail="Please provide a richer prompt (at least 20 characters).")

    generator = BookGenerator(seed=int(datetime.utcnow().timestamp()) % 100_000)
    blueprint = generator.generate_blueprint(prompt=prompt)
    blueprint.author = author.strip() or blueprint.author

    slug = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    pdf_path = OUTPUT_DIR / f"book-{slug}.pdf"
    generator.write_pdf(blueprint, pdf_path)

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "success": True,
            "download_name": pdf_path.name,
            "title": blueprint.title,
        },
    )


@app.get("/download/{file_name}")
async def download(file_name: str):
    path = OUTPUT_DIR / file_name
    if not path.exists():
        raise HTTPException(status_code=404, detail="Generated file not found.")
    return FileResponse(path=str(path), media_type="application/pdf", filename=file_name)
