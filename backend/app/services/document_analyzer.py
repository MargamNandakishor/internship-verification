import fitz  # PyMuPDF
from typing import Dict, List, Tuple
import re
import whois
from datetime import datetime

class DocumentAnalyzer:
    def __init__(self):
        # Document type patterns
        self.doc_type_patterns = {
            "offer_letter": [
                r"offer\s+letter",
                r"employment\s+offer",
                r"job\s+offer",
                r"position\s+offer"
            ],
            "internship_letter": [
                r"internship\s+letter",
                r"intern\s+offer",
                r"internship\s+program"
            ],
            "call_letter": [
                r"call\s+letter",
                r"interview\s+call",
                r"selection\s+letter"
            ]
        }
        
        # Suspicious patterns (including fee/payment related)
        self.suspicious_patterns = [
            r'urgent\s+job\s+offer',
            r'immediate\s+joining',
            r'work\s+from\s+home.*\$\d+',
            r'payment\s+required',
            r'application\s+fee',
            r'processing\s+fee',
            r'security\s+deposit',
            r'need\s+to\s+pay',
            r'gmail\.com|yahoo\.com|hotmail\.com',  # Non-corporate emails
        ]

    async def analyze_text(self, text: str) -> Dict:
        """Analyze text content for legitimacy"""
        doc_type = await self._classify_document_type(text)
        company_info = await self._extract_company_info(text)
        legitimacy_score, warnings = await self._calculate_legitimacy_score(text, company_info)
        
        return {
            "document_type": doc_type,
            "legitimacy_score": legitimacy_score,
            "is_legitimate": legitimacy_score > 0.5, # Keep threshold at 0.5
            "confidence_score": legitimacy_score, # Confidence can be the score itself now
            "company_info": company_info,
            "warnings": warnings
        }

    async def analyze_pdf(self, file_path: str) -> Dict:
        """Extract and analyze text from PDF"""
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            return await self.analyze_text(text)
        except Exception as e:
            raise ValueError(f"Error processing PDF: {str(e)}")

    async def _classify_document_type(self, text: str) -> str:
        """Classify the type of document using pattern matching"""
        text = text.lower()
        max_matches = 0
        best_type = "offer_letter"  # default type
        
        for doc_type, patterns in self.doc_type_patterns.items():
            matches = sum(1 for pattern in patterns if re.search(pattern, text, re.IGNORECASE))
            if matches > max_matches:
                max_matches = matches
                best_type = doc_type
        
        return best_type

    async def _extract_company_info(self, text: str) -> Dict:
        """Extract and verify company information"""
        company_pattern = r'(?i)(?:from|at|with)\s+([A-Z][A-Za-z0-9\s&]+(?:Inc\.|LLC|Ltd\.|Limited|Corp\.)?)'
        company_match = re.search(company_pattern, text)
        email_pattern = r'[\w\.-]+@([\w\.-]+)'
        email_match = re.search(email_pattern, text)
        
        company_name = company_match.group(1).strip() if company_match else None
        domain_name = email_match.group(1) if email_match else None
        
        company_info = {
            "name": company_name,
            "domain": domain_name,
            "verified": False,
            "registration_date": None
        }
        
        if domain_name:
            try:
                domain_info = whois.whois(domain_name)
                if domain_info.domain_name:
                    company_info["verified"] = True
                    company_info["registration_date"] = domain_info.creation_date
                    # Handle potential list format for date
                    if isinstance(company_info["registration_date"], list):
                         if company_info["registration_date"]:
                            company_info["registration_date"] = company_info["registration_date"][0]
                         else:
                            company_info["registration_date"] = None # Handle empty list case
            except Exception:
                company_info["verified"] = False # Keep verified as False on error
        
        return company_info

    async def _calculate_legitimacy_score(self, text: str, company_info: Dict) -> Tuple[float, List[str]]:
        """Calculate legitimacy score based on specific deductions."""
        score = 1.0
        warnings = []

        # 1. Domain Verification Check (-0.5 if not verified)
        if not company_info["verified"]:
            score -= 0.5
            warnings.append("Company domain could not be verified or does not exist (-50% score)")
        else:
            # 2. Domain Age Check (only if verified, -0.1 if new)
            reg_date = company_info.get("registration_date")
            if reg_date:
                 # Ensure reg_date is a datetime object
                if isinstance(reg_date, list):
                    if reg_date: # Check if list is not empty
                        reg_date = reg_date[0]
                    else:
                         reg_date = None # Set to None if list is empty

                if isinstance(reg_date, datetime):
                    domain_age = (datetime.now() - reg_date).days
                    if domain_age < 90:
                        score -= 0.1
                        warnings.append("Company domain is relatively new (< 90 days old) (-10% score)")
                else:
                    # warning if date format is unexpected but domain is verified
                    warnings.append("Could not determine domain registration date format.")
            else:
                 warnings.append("Domain registration date not found, skipping age check.")


        # 3. Company Name Check (-0.3 if not detected)
        if not company_info["name"]:
            score -= 0.3
            warnings.append("Company name could not be detected in the text (-30% score)")

        # 4. Suspicious Patterns Check (-0.2 for each)
        num_suspicious = 0
        for pattern in self.suspicious_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                score -= 0.2
                num_suspicious += 1
                # Add specific warning for fee/payment patterns
                if 'fee' in pattern or 'deposit' in pattern or 'pay' in pattern or 'payment' in pattern:
                     warnings.append(f"Critical Warning: Suspicious pattern '{pattern}' detected (potential scam indicator) (-20% score)")
                else:
                    warnings.append(f"Suspicious pattern '{pattern}' detected (-20% score)")
        
        if num_suspicious > 0:
            warnings.append(f"Total score reduction from {num_suspicious} suspicious patterns: -{num_suspicious * 20}%")


        # Ensure score stays within [0, 1]
        final_score = max(0.0, min(1.0, score))
        
        return final_score, warnings 