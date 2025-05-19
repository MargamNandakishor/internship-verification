# OfferGuard 🛡️

A professional web application that verifies the authenticity of offer letters, internship letters, and call letters using advanced NLP and document analysis.

## Features

- 📄 Document Upload & Text Analysis
- 🔍 Letter Type Classification (Offer/Internship/Call)
- ✅ Legitimacy Verification
- 🏢 Company Information Validation
- 📊 Detailed Analysis Reports
- 🔒 Secure Document Handling

## Tech Stack

### Frontend
- React.js
- Material-UI
- Axios
- React Router

### Backend
- FastAPI
- PyMuPDF (document parsing)
- Transformers (BERT for classification)
- SQLite (database)
- WeasyPrint (PDF report generation)

## Project Structure

```
offerguard/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── services/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
└── README.md
```

## Setup Instructions

### Backend Setup
1. Create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## API Documentation

Once the backend server is running, visit:
- API Documentation: http://localhost:8000/docs
- Alternative Documentation: http://localhost:8000/redoc

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 