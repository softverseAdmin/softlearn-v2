"""Bulk operations service for CSV import/export."""

import csv
import io
from datetime import datetime
from typing import Any, BinaryIO, Dict, List, Tuple

from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from django.db import transaction

from users.models import Company, Course, ExamCategory, User


class CSVExporter:
    """Export data to CSV format."""

    @staticmethod
    def export_users(queryset):
        """Export users to CSV with fields: id, email, full_name, role, status."""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['id', 'email', 'full_name', 'role', 'status', 'company', 'date_joined'])
        
        # Write data
        for user in queryset:
            company_name = user.company.name if user.company else ""
            status = "active" if user.is_active else "inactive"
            writer.writerow([
                user.id,
                user.email,
                user.full_name,
                user.role,
                status,
                company_name,
                user.date_joined.isoformat() if user.date_joined else "",
            ])
        
        return output.getvalue()
    
    @staticmethod
    def export_companies(queryset):
        """Export companies: id, name, industry, size, location, status."""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['id', 'name', 'description', 'status', 'member_count', 'vacancy_count', 'created_at'])
        
        # Write data
        for company in queryset:
            status = "active" if company.is_active else "inactive"
            member_count = company.members.count()
            vacancy_count = company.vacancies.count()
            writer.writerow([
                company.id,
                company.name,
                company.description,
                status,
                member_count,
                vacancy_count,
                company.created_at.isoformat() if company.created_at else "",
            ])
        
        return output.getvalue()
    
    @staticmethod
    def export_courses(queryset):
        """Export courses: id, title, category, difficulty, status."""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['id', 'title', 'description', 'category', 'difficulty_level', 'estimated_hours', 'status', 'created_at'])
        
        # Write data
        for course in queryset:
            writer.writerow([
                course.id,
                course.title,
                course.description,
                course.category,
                course.difficulty_level,
                course.estimated_hours,
                course.status,
                course.created_at.isoformat() if course.created_at else "",
            ])
        
        return output.getvalue()


class CSVImporter:
    """Import data from CSV format."""

    @staticmethod
    def import_users(csv_file: BinaryIO) -> Dict[str, Any]:
        """
        Bulk create users from CSV.
        
        Expected columns: email, full_name, role, password, company_id (optional)
        Returns: {created: int, skipped: int, errors: list}
        """
        result = {"created": 0, "skipped": 0, "errors": []}
        
        # Decode CSV content
        text_file = io.TextIOWrapper(csv_file, encoding='utf-8')
        reader = csv.DictReader(text_file)
        
        if not reader.fieldnames:
            result["errors"].append("CSV file is empty or invalid")
            return result
        
        required_fields = {'email', 'full_name', 'role', 'password'}
        missing = required_fields - set(reader.fieldnames or [])
        if missing:
            result["errors"].append(f"Missing required columns: {', '.join(missing)}")
            return result
        
        with transaction.atomic():
            for row_num, row in enumerate(reader, start=2):
                try:
                    email = row.get('email', '').strip()
                    full_name = row.get('full_name', '').strip()
                    role = row.get('role', '').strip()
                    password = row.get('password', '').strip()
                    company_id = row.get('company_id', '').strip()
                    
                    # Validate required fields
                    if not all([email, full_name, role, password]):
                        result["errors"].append(f"Row {row_num}: Missing required field(s)")
                        result["skipped"] += 1
                        continue
                    
                    # Validate role
                    if role not in [User.Role.STUDENT, User.Role.COMPANY, User.Role.TEACHER, User.Role.ADMIN]:
                        result["errors"].append(f"Row {row_num}: Invalid role '{role}'")
                        result["skipped"] += 1
                        continue
                    
                    # Check for duplicate email
                    if User.objects.filter(email=email).exists():
                        result["errors"].append(f"Row {row_num}: Email '{email}' already exists")
                        result["skipped"] += 1
                        continue
                    
                    # Validate company_id if provided or required
                    company = None
                    if role == User.Role.COMPANY:
                        if not company_id:
                            result["errors"].append(f"Row {row_num}: Company users must have a company_id")
                            result["skipped"] += 1
                            continue
                        try:
                            company = Company.objects.get(id=int(company_id))
                        except (Company.DoesNotExist, ValueError):
                            result["errors"].append(f"Row {row_num}: Invalid company ID '{company_id}'")
                            result["skipped"] += 1
                            continue
                    elif company_id:
                        try:
                            company = Company.objects.get(id=int(company_id))
                        except (Company.DoesNotExist, ValueError):
                            result["errors"].append(f"Row {row_num}: Invalid company ID '{company_id}'")
                            result["skipped"] += 1
                            continue
                    
                    # Create user
                    user = User.objects.create_user(
                        email=email,
                        password=password,
                        full_name=full_name,
                        role=role,
                        company=company,
                    )
                    result["created"] += 1
                
                except Exception as e:
                    result["errors"].append(f"Row {row_num}: {str(e)}")
                    result["skipped"] += 1
        
        return result
    
    @staticmethod
    def import_courses(csv_file: BinaryIO) -> Dict[str, Any]:
        """
        Bulk create courses from CSV.
        
        Expected columns: title, description, category, difficulty_level, estimated_hours
        Returns: {created: int, skipped: int, errors: list}
        """
        result = {"created": 0, "skipped": 0, "errors": []}
        
        # Decode CSV content
        text_file = io.TextIOWrapper(csv_file, encoding='utf-8')
        reader = csv.DictReader(text_file)
        
        if not reader.fieldnames:
            result["errors"].append("CSV file is empty or invalid")
            return result
        
        required_fields = {'title', 'description', 'category', 'difficulty_level', 'estimated_hours'}
        missing = required_fields - set(reader.fieldnames or [])
        if missing:
            result["errors"].append(f"Missing required columns: {', '.join(missing)}")
            return result
        
        with transaction.atomic():
            for row_num, row in enumerate(reader, start=2):
                try:
                    title = row.get('title', '').strip()
                    description = row.get('description', '').strip()
                    category = row.get('category', '').strip()
                    difficulty_level = row.get('difficulty_level', '').strip()
                    estimated_hours = row.get('estimated_hours', '').strip()
                    
                    # Validate required fields
                    if not all([title, description, category, difficulty_level, estimated_hours]):
                        result["errors"].append(f"Row {row_num}: Missing required field(s)")
                        result["skipped"] += 1
                        continue
                    
                    # Validate difficulty level
                    valid_levels = ['beginner', 'intermediate', 'advanced', 'expert']
                    if difficulty_level not in valid_levels:
                        result["errors"].append(f"Row {row_num}: Invalid difficulty level '{difficulty_level}'")
                        result["skipped"] += 1
                        continue
                    
                    # Validate hours
                    try:
                        hours = float(estimated_hours)
                        if hours <= 0:
                            raise ValueError("must be positive")
                    except (ValueError, TypeError) as e:
                        result["errors"].append(f"Row {row_num}: Invalid estimated_hours '{estimated_hours}'")
                        result["skipped"] += 1
                        continue
                    
                    # Check for duplicate
                    if Course.objects.filter(title=title).exists():
                        result["errors"].append(f"Row {row_num}: Course '{title}' already exists")
                        result["skipped"] += 1
                        continue
                    
                    # Create course
                    course = Course.objects.create(
                        title=title,
                        description=description,
                        category=category,
                        difficulty_level=difficulty_level,
                        estimated_hours=hours,
                        status=Course.Status.ACTIVE,
                    )
                    result["created"] += 1
                
                except Exception as e:
                    result["errors"].append(f"Row {row_num}: {str(e)}")
                    result["skipped"] += 1
        
        return result
    
    @staticmethod
    def get_user_import_template() -> str:
        """Return a CSV template for user import."""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['email', 'full_name', 'role', 'password', 'company_id'])
        writer.writerow(['john@example.com', 'John Doe', 'student', 'SecurePass123!', ''])
        writer.writerow(['jane@example.com', 'Jane Smith', 'company', 'CompanyPass123!', '1'])
        return output.getvalue()
    
    @staticmethod
    def get_course_import_template() -> str:
        """Return a CSV template for course import."""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['title', 'description', 'category', 'difficulty_level', 'estimated_hours'])
        writer.writerow(['Python Basics', 'Learn Python fundamentals', 'Programming', 'beginner', '20'])
        writer.writerow(['Advanced JavaScript', 'Master JavaScript for web apps', 'Programming', 'advanced', '40'])
        return output.getvalue()
