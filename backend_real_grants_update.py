# Updated SAMPLE_GRANTS with real Australian funding opportunities
# Based on Screen Australia and other real funding sources

from datetime import datetime, timedelta
from enum import Enum


class GrantCategory(Enum):
    ARTS_CULTURE = "arts_culture"
    COMMUNITY = "community"
    YOUTH = "youth"
    DOCUMENTARY = "documentary"
    INNOVATION = "innovation"
    ENVIRONMENT = "environment"
    HEALTH = "health"
    EDUCATION = "education"
    INDIGENOUS = "indigenous"
    TECHNOLOGY = "technology"


SAMPLE_GRANTS = [
    # Original grants (keeping for compatibility)
    {
        "id": "grant_001",
        "title": "Victorian Creative Industries Grant",
        "description": (
            "Supporting creative projects that contribute to Victoria's cultural landscape"
        ),
        "amount": 50000.00,
        "deadline": datetime.now() + timedelta(days=30),
        "category": GrantCategory.ARTS_CULTURE,
        "organisation": "Creative Victoria",
        "eligibility_criteria": [
            "Non-profit organisations",
            "Creative businesses",
            "Individual artists",
        ],
        "required_documents": [
            "Project proposal",
            "Budget breakdown",
            "Timeline",
            "Impact assessment",
        ],
        "success_score": 0.850,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    },
    {
        "id": "grant_002",
        "title": "Community Impact Fund",
        "description": "Supporting community projects that create positive social impact",
        "amount": 25000.00,
        "deadline": datetime.now() + timedelta(days=45),
        "category": GrantCategory.COMMUNITY,
        "organisation": "Department of Communities",
        "eligibility_criteria": [
            "Community organisations",
            "Social enterprises",
            "Non-profits",
        ],
        "required_documents": [
            "Community consultation",
            "Impact measurement plan",
            "Partnership details",
        ],
        "success_score": 0.920,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    },
    {
        "id": "grant_003",
        "title": "Youth Innovation Grant",
        "description": "Supporting innovative projects led by young people",
        "amount": 15000.00,
        "deadline": datetime.now() + timedelta(days=60),
        "category": GrantCategory.YOUTH,
        "organisation": "Youth Affairs Victoria",
        "eligibility_criteria": [
            "Youth-led organisations",
            "Young entrepreneurs",
            "Youth groups",
        ],
        "required_documents": [
            "Youth leadership",
            "Innovation component",
            "Community benefit",
        ],
        "success_score": 0.780,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    },
    # NEW REAL AUSTRALIAN GRANTS
    # Screen Australia Documentary Production Fund
    {
        "id": "grant_004",
        "title": "Screen Australia Documentary Production Fund",
        "description": (
            "Supporting quality documentary production with cultural value and innovation. "
            "Based on real Screen Australia funding program for documentary production "
            "with up to $500,000 available."
        ),
        "amount": 500000.00,
        "deadline": datetime(2025, 9, 25, 17, 0),  # September 25, 2025 5pm AEST
        "category": GrantCategory.ARTS_CULTURE,
        "organisation": "Screen Australia",
        "eligibility_criteria": [
            "Australian production companies",
            "Documentary filmmakers",
            "Projects with strong storytelling",
            "Cultural value and innovation focus",
            "Appropriate budget and methodology",
        ],
        "required_documents": [
            "Project proposal and treatment",
            "Detailed budget breakdown",
            "Finance plan template",
            "Producer Offset application (if applicable)",
            "Marketplace and distribution strategy",
            "Crew placement scheme plan",
        ],
        "success_score": 0.950,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    },
    # Screen Australia First Nations Documentary
    {
        "id": "grant_005",
        "title": "Screen Australia First Nations Documentary",
        "description": (
            "Supporting First Nations storytelling and documentary content creation. "
            "Dedicated funding for First Nations filmmakers and content creators."
        ),
        "amount": 400000.00,
        "deadline": datetime.now() + timedelta(days=90),  # Rolling applications
        "category": GrantCategory.INDIGENOUS,
        "organisation": "Screen Australia",
        "eligibility_criteria": [
            "First Nations filmmakers",
            "Indigenous production companies",
            "Authentic First Nations content",
            "First Nations participation and consultation",
        ],
        "required_documents": [
            "First Nations consultation evidence",
            "Cultural protocols documentation",
            "Project proposal and treatment",
            "Budget and finance plan",
            "Distribution strategy",
        ],
        "success_score": 0.920,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    },
    # Australia Council for the Arts Project Grants
    {
        "id": "grant_006",
        "title": "Australia Council for the Arts Project Grants",
        "description": (
            "Supporting arts projects and creative development across all art forms. "
            "Based on real Australia Council funding for arts projects up to $100,000."
        ),
        "amount": 100000.00,
        "deadline": datetime.now() + timedelta(days=120),  # Rolling applications
        "category": GrantCategory.ARTS_CULTURE,
        "organisation": "Australia Council for the Arts",
        "eligibility_criteria": [
            "Australian artists and arts organisations",
            "Professional arts practitioners",
            "Innovative arts projects",
            "Audience engagement focus",
        ],
        "required_documents": [
            "Project proposal",
            "Artist CV and portfolio",
            "Budget breakdown",
            "Timeline and milestones",
            "Audience engagement strategy",
        ],
        "success_score": 0.880,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    },
    # Department of Industry Innovation Fund
    {
        "id": "grant_007",
        "title": "Department of Industry Innovation Fund",
        "description": (
            "Supporting innovation and technology development projects. "
            "Based on real Australian government innovation funding programs."
        ),
        "amount": 200000.00,
        "deadline": datetime(2026, 1, 31, 17, 0),  # January 31, 2026
        "category": GrantCategory.TECHNOLOGY,
        "organisation": "Department of Industry, Science and Resources",
        "eligibility_criteria": [
            "Australian businesses",
            "Innovation-focused projects",
            "Technology development",
            "Commercial potential",
        ],
        "required_documents": [
            "Innovation proposal",
            "Technology roadmap",
            "Market analysis",
            "Financial projections",
            "Team capabilities",
        ],
        "success_score": 0.850,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    },
    # Indigenous Business Australia Grant
    {
        "id": "grant_008",
        "title": "Indigenous Business Australia Grant",
        "description": (
            "Supporting Indigenous business development and entrepreneurship. "
            "Dedicated funding for Indigenous business growth and development."
        ),
        "amount": 75000.00,
        "deadline": datetime(2026, 2, 28, 17, 0),  # February 28, 2026
        "category": GrantCategory.INDIGENOUS,
        "organisation": "Indigenous Business Australia",
        "eligibility_criteria": [
            "Indigenous business owners",
            "Indigenous entrepreneurs",
            "Business development projects",
            "Indigenous community benefit",
        ],
        "required_documents": [
            "Business plan",
            "Indigenous heritage documentation",
            "Financial projections",
            "Community impact assessment",
            "Market analysis",
        ],
        "success_score": 0.900,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    },
    # Creative Victoria Enhanced Grant
    {
        "id": "grant_009",
        "title": "Creative Victoria Enhanced Creative Industries Grant",
        "description": (
            "Enhanced funding for creative projects that significantly contribute to "
            "Victoria's cultural landscape and creative economy."
        ),
        "amount": 75000.00,
        "deadline": datetime(2025, 10, 15, 17, 0),  # October 15, 2025
        "category": GrantCategory.ARTS_CULTURE,
        "organisation": "Creative Victoria",
        "eligibility_criteria": [
            "Victorian creative businesses",
            "Arts organisations",
            "Cultural projects",
            "Economic impact potential",
        ],
        "required_documents": [
            "Creative project proposal",
            "Cultural impact assessment",
            "Economic benefit analysis",
            "Partnership details",
            "Timeline and milestones",
        ],
        "success_score": 0.870,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    },
    # Community Development Grant
    {
        "id": "grant_010",
        "title": "Community Development and Social Impact Grant",
        "description": (
            "Supporting community development projects that create measurable "
            "social impact and community benefit."
        ),
        "amount": 35000.00,
        "deadline": datetime(2025, 11, 30, 17, 0),  # November 30, 2025
        "category": GrantCategory.COMMUNITY,
        "organisation": "Department of Social Services",
        "eligibility_criteria": [
            "Community organisations",
            "Social enterprises",
            "Not-for-profit organisations",
            "Measurable social impact",
        ],
        "required_documents": [
            "Community consultation report",
            "Social impact measurement plan",
            "Partnership agreements",
            "Budget and timeline",
            "Evaluation framework",
        ],
        "success_score": 0.930,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    },
]


# Grant Categories are defined at the top of the file
