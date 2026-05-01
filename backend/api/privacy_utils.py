"""
Privacy and data access utilities for enforcing consent and permission checks.
"""

from django.core.exceptions import ValidationError
from users.models import DataConsent, StudentDataAccessLog, User


def get_client_ip(request) -> str:
    """Extract client IP from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def check_student_data_access(requesting_user: User, student: User, access_type: str = 'profile') -> bool:
    """
    Check if user can access student data based on:
    1. User role (company, admin, student)
    2. Student's consent for data sharing
    3. Valid relationship

    Args:
        requesting_user: User attempting to access the data
        student: Student whose data is being accessed
        access_type: Type of data being accessed ('profile', 'learning_record', etc.)

    Returns:
        True if access is allowed, False otherwise

    Raises:
        ValidationError if student is not a student user
    """
    if student.role != User.Role.STUDENT:
        raise ValidationError("Target user must be a student.")

    # Student can see their own data
    if requesting_user.id == student.id:
        return True

    # Admins can see all data
    if requesting_user.role == User.Role.ADMIN:
        return True

    # Company users need consent
    if requesting_user.role == User.Role.COMPANY:
        company = requesting_user.company

        if not company:
            return False

        # Check consent based on access type
        consent_type_map = {
            'profile': 'share_profile_with_company',
            'learning_record': 'share_learning_with_company',
            'exam_results': 'share_exam_results_with_company',
            'resume': 'share_profile_with_company',
            'all_data': 'share_profile_with_company',
        }

        required_consent = consent_type_map.get(access_type, 'share_profile_with_company')

        consent = DataConsent.objects.filter(
            student=student,
            consent_type=required_consent,
            company=company,
            given=True
        ).exists()

        return consent

    return False


def log_student_data_access(
    student: User,
    accessed_by: User,
    access_type: str,
    ip_address: str,
    reason: str = "",
) -> StudentDataAccessLog:
    """
    Create a log entry for student data access.

    Args:
        student: Student whose data was accessed
        accessed_by: User who accessed the data
        access_type: Type of data accessed
        ip_address: IP address of the requester
        reason: Optional reason for access

    Returns:
        Created StudentDataAccessLog instance
    """
    log_entry = StudentDataAccessLog.objects.create(
        student=student,
        accessed_by=accessed_by,
        accessed_by_company=accessed_by.company if accessed_by.role == User.Role.COMPANY else None,
        access_type=access_type,
        reason=reason,
        ip_address=ip_address,
    )
    return log_entry


def get_user_consent_for_company(student: User, company=None) -> dict:
    """
    Get all consent statuses for a student and specific company.

    Args:
        student: Student user
        company: Company object (optional, if None returns all consents)

    Returns:
        Dictionary mapping consent types to their status
    """
    if student.role != User.Role.STUDENT:
        return {}

    query = DataConsent.objects.filter(student=student)

    if company:
        query = query.filter(company=company)

    consents = {}
    for consent in query:
        key = f"{consent.consent_type}"
        if company:
            consents[key] = consent.given
        else:
            if consent.company:
                key = f"{consent.consent_type}__{consent.company.id}"
            consents[key] = {
                'given': consent.given,
                'company_id': consent.company_id,
                'company_name': consent.company.name if consent.company else None,
                'given_at': consent.given_at.isoformat() if consent.given_at else None,
            }

    return consents
