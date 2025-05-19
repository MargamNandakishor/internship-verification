from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
from .services.document_analyzer import DocumentAnalyzer
import uuid

app = FastAPI(
    title="OfferGuard API",
    description="API for verifying the authenticity of offer letters and related documents",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize document analyzer
document_analyzer = DocumentAnalyzer()

# Request/Response models
class DocumentAnalysisRequest(BaseModel):
    text: str
    document_type: Optional[str] = None

class DocumentAnalysisResponse(BaseModel):
    id: str
    document_type: str
    legitimacy_score: float
    is_legitimate: bool
    confidence_score: float
    company_info: dict
    warnings: list[str]

@app.get("/")
async def root():
    return {"message": "Welcome to OfferGuard API"}

@app.post("/api/analyze/text", response_model=DocumentAnalysisResponse)
async def analyze_text(request: DocumentAnalysisRequest):
    """Analyze text content for legitimacy verification"""
    try:
        # Generate a unique ID for this analysis
        analysis_id = str(uuid.uuid4())
        
        # Analyze the text
        result = await document_analyzer.analyze_text(request.text)
        
        # Add the analysis ID to the result
        result["id"] = analysis_id
        
        return DocumentAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/document", response_model=DocumentAnalysisResponse)
async def analyze_document(file: UploadFile = File(...)):
    """Analyze uploaded document for legitimacy verification"""
    if not file.filename.endswith(('.pdf', '.doc', '.docx')):
        raise HTTPException(status_code=400, detail="Invalid file format")
    
    try:
        # Generate a unique ID for this analysis
        analysis_id = str(uuid.uuid4())
        
        # Save the file temporarily
        file_path = f"temp_{analysis_id}_{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Analyze the document
        result = await document_analyzer.analyze_pdf(file_path)
        
        # Add the analysis ID to the result
        result["id"] = analysis_id
        
        return DocumentAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temporary file
        import os
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/api/verify-company")
async def verify_company(company_name: str, domain: Optional[str] = None):
    """Verify company information using external APIs"""
    try:
        # Extract company info from the text
        company_info = await document_analyzer._extract_company_info(f"Company: {company_name}")
        
        return {
            "verified": company_info["verified"],
            "company_info": company_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-report/{analysis_id}")
async def generate_report(analysis_id: str):
    """Generate a detailed PDF report for the analysis"""
    # TODO: Implement report generation logic
    return {
        "report_url": f"/reports/{analysis_id}.pdf",
        "generated_at": "2024-01-20T12:00:00Z"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 