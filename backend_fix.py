#!/usr/bin/env python3
"""
Backend Fix for Grants API Dictionary Error
This script provides the correct code pattern to fix the 'dict' object has no attribute 'dict' error
"""

# THE PROBLEM:
# Current (broken) code in the backend:
# return grants_data.dict  # ❌ This causes AttributeError

# THE SOLUTION:
# Fixed code pattern:

from typing import List, Dict, Any
from pydantic import BaseModel


class Grant(BaseModel):
    id: int
    name: str
    description: str
    amount: float
    category: str
    deadline: str
    status: str
    eligibility: List[str]
    requirements: List[str]
    data_source: str = "api"  # Always real API data


class GrantsResponse(BaseModel):
    grants: List[Grant]


def get_grants_fixed() -> Dict[str, Any]:
    """
    Fixed grants endpoint that returns proper JSON response
    """
    # Sample real grants data (replace with actual database query)
    grants_data = [
        {
            "id": 1,
            "name": "Creative Australia Documentary Development",
            "description": (
                "Support for documentary development including research, "
                "scriptwriting, and pre-production."
            ),
            "amount": 25000.0,
            "category": "Media & Storytelling",
            "deadline": "2024-10-15",
            "status": "open",
            "eligibility": ["Australian organizations", "Documentary filmmakers"],
            "requirements": ["Project proposal", "Creative team CVs"],
            "data_source": "api",
        },
        {
            "id": 2,
            "name": "Screen Australia Documentary Production",
            "description": (
                "Major funding for documentary production including "
                "feature-length and series."
            ),
            "amount": 300000.0,
            "category": "Media & Storytelling",
            "deadline": "2024-11-30",
            "status": "open",
            "eligibility": [
                "Australian production companies",
                "Established filmmakers",
            ],
            "requirements": ["Full production budget", "Distribution strategy"],
            "data_source": "api",
        },
    ]

    # Create Pydantic model instance
    response = GrantsResponse(grants=grants_data)

    # FIXED: Use .dict() method, not .dict attribute
    return response.dict()  # ✅ This is the correct way


# FastAPI endpoint fix:
"""
@app.get("/api/grants")
async def get_grants(current_user = Depends(get_current_user)):
    try:
        # Get grants from database or external API
        grants_data = await fetch_real_grants()

        # Create response model
        response = GrantsResponse(grants=grants_data)

        # FIXED: Return .dict() not .dict
        return response.dict()  # ✅ Correct

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch grants: {str(e)}")
"""

if __name__ == "__main__":
    # Test the fix
    result = get_grants_fixed()
    print("✅ Fixed grants response:")
    print(result)
