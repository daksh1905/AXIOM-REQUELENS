"""
Unit tests for Project Report Consolidated Deliverable exports (DOCX & PDF).
Tests in-process generation using real/mock project records.
"""

import unittest
import io
from backend.database.db import ProjectRepository
from backend.exports.export_service import ExportService

class TestProjectReportExports(unittest.TestCase):
    def setUp(self):
        self.project_id = "proj-fbf85b77"
        repo = ProjectRepository()
        self.project = repo.get_project(self.project_id)
        if not self.project:
            self.skipTest("Project proj-fbf85b77 not found in database")

    def test_generate_project_report_docx(self):
        """Tests that DOCX generation produces valid non-empty stream with PK zip signature."""
        docx_stream = ExportService.generate_project_report_docx(self.project, self.project.get("data", {}))
        self.assertIsInstance(docx_stream, io.BytesIO)
        docx_bytes = docx_stream.getvalue()
        self.assertGreater(len(docx_bytes), 1000)
        # DOCX files are zip archives starting with PK\x03\x04
        self.assertTrue(docx_bytes.startswith(b"PK\x03\x04"))

    def test_generate_project_report_pdf(self):
        """Tests that PDF generation produces valid non-empty stream with PDF signature."""
        pdf_stream = ExportService.generate_project_report_pdf(self.project, self.project.get("data", {}))
        self.assertIsInstance(pdf_stream, io.BytesIO)
        pdf_bytes = pdf_stream.getvalue()
        self.assertGreater(len(pdf_bytes), 500)
        # PDF files start with %PDF
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))

if __name__ == "__main__":
    unittest.main()
