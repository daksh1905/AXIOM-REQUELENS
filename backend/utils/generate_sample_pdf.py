import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_sample_rfp(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=14
    )
    h1_style = ParagraphStyle(
        'SecHeading',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1e3a8a'),
        spaceBefore=14,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )

    story = []

    # PAGE 1: Overview & Timeline
    story.append(Paragraph("REQUEST FOR PROPOSAL (RFP) #2026-FIN-089", title_style))
    story.append(Paragraph("Omni-Channel Wealth Platform Modernization", styles['Heading3']))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Section 1.1 Project Objectives", h1_style))
    story.append(Paragraph("The Client seeks proposals from qualified system integrators to engineer, deploy, and maintain an institutional-grade wealth management platform. The platform shall support multi-factor authentication (MFA) for all administrative and client access sessions.", body_style))
    story.append(Paragraph("Section 1.2 Target Delivery Schedule", h1_style))
    story.append(Paragraph("The overall solution must be fully delivered, tested, and live in production within 8 weeks of contract signing. Time is strictly of the essence, and contractor shall achieve final production go-live without schedule deviation.", body_style))
    story.append(PageBreak())

    # PAGE 2: Hosting Mandate
    story.append(Paragraph("Section 2.0 Infrastructure Architecture", title_style))
    story.append(Paragraph("Section 2.1 Hosting & Deployment Boundary", h1_style))
    story.append(Paragraph("Hosting Mandate: Due to regulatory data secrecy covenants, all application compute workloads and primary persistent data stores must be deployed strictly on client-owned on-premise hardware inside our Frankfurt private data center.", body_style))
    story.append(Paragraph("Section 2.2 Directory Integration", h1_style))
    story.append(Paragraph("The solution must support single sign-on (SSO) integration with client's enterprise Azure Active Directory via SAML 2.0 and OpenID Connect protocols.", body_style))
    story.append(PageBreak())

    # PAGE 3: Integration & Migration
    story.append(Paragraph("Section 3.0 Core Integrations & Data Migration", title_style))
    story.append(Paragraph("Section 3.1 Legacy Banking Interfaces", h1_style))
    story.append(Paragraph("The platform must ingest, transform, and reconcile daily transaction feeds from three core banking ledger systems within a 2-hour batch window.", body_style))
    story.append(Paragraph("Section 3.4 Historical Data Migration", h1_style))
    story.append(Paragraph("Contractor is solely responsible for extracting, cleansing, and migrating 25 Terabytes of historical transactional records from legacy Oracle databases prior to cutover.", body_style))
    story.append(PageBreak())

    # PAGE 4: Cloud Database Mandate (Contradicts Page 2)
    story.append(Paragraph("Section 4.0 Persistence Architecture", title_style))
    story.append(Paragraph("Section 4.2 Managed Cloud Database Services", h1_style))
    story.append(Paragraph("All relational databases must utilize AWS RDS PostgreSQL in Multi-AZ configuration with automated snapshotting and continuous replication.", body_style))
    story.append(Paragraph("Section 4.3 High Availability Guarantees", h1_style))
    story.append(Paragraph("System must achieve 99.99% service availability during scheduled core business hours with automatic failover under 60 seconds.", body_style))
    story.append(PageBreak())

    # PAGE 5: Performance & Legal Terms
    story.append(Paragraph("Section 5.0 Performance & Contractual Terms", title_style))
    story.append(Paragraph("Section 5.1 General Performance Sizing", h1_style))
    story.append(Paragraph("Platform should support high traffic with sub-second API response latency under peak trading volumes.", body_style))
    story.append(Paragraph("Section 5.3 Contractor Indemnification & Liability", h1_style))
    story.append(Paragraph("Contractor accepts unlimited financial liability and agrees to fully indemnify the client against any direct or consequential damages, operational disruptions, or data loss.", body_style))

    doc.build(story)
    print(f"Sample multi-page RFP generated at: {output_path}")

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "..", "sample-data")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "sample_enterprise_rfp.pdf")
    create_sample_rfp(out_file)
