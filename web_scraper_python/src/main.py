from fastapi import FastAPI
import pymongo

app = FastAPI()


@app.get("/cache")
def get_cached_materials(name: str, company: str):
    return {"name": name, "company": company}
