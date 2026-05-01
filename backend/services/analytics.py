from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta

from users.models import (
    StudentProfile,
    Company,
    StudentDashboardMetric,
    CompanyDashboardMetric,
    LearningRecord,
    ExamResult,
    Application,
    Interview,
    StudentSkill,
    Vacancy,
    CandidateNote,
)


class AnalyticsService:
    """Service for calculating and aggregating analytics metrics"""
    
    @staticmethod
    def calculate_student_metrics(student_profile: StudentProfile) -> StudentDashboardMetric:
        """Calculate all metrics for a student and update/create dashboard metric record"""
        
        student_user = student_profile.user
        
        # Learning metrics
        courses_in_progress = LearningRecord.objects.filter(
            student=student_user,
            status=LearningRecord.Status.IN_PROGRESS
        ).count()
        
        courses_completed = LearningRecord.objects.filter(
            student=student_user,
            status=LearningRecord.Status.COMPLETED
        ).count()
        
        exams_attempted = ExamResult.objects.filter(student=student_user).count()
        
        avg_exam_score = ExamResult.objects.filter(student=student_user).aggregate(
            avg=Avg('score_percent')
        )['avg'] or 0.0
        
        # Application metrics
        applications = Application.objects.filter(student=student_user)
        applications_submitted = applications.count()
        applications_accepted = applications.filter(
            status__in=['shortlisted', 'accepted']
        ).count()
        applications_rejected = applications.filter(
            status=Application.Status.REJECTED
        ).count()
        
        # Interview metrics
        interviews = Interview.objects.filter(student=student_user)
        interviews_scheduled = interviews.filter(
            status__in=[Interview.Status.CONFIRMED, Interview.Status.RESCHEDULED]
        ).count()
        interviews_completed = interviews.filter(
            status=Interview.Status.COMPLETED
        ).count()
        
        # Skill metrics
        skills = StudentSkill.objects.filter(student=student_user)
        skills_total = skills.count()
        # For now, using all skills as "endorsed" - can be enhanced with endorsement model
        skills_endorsed = skills_total
        
        # Update or create metric
        metric, _ = StudentDashboardMetric.objects.update_or_create(
            student=student_profile,
            defaults={
                'courses_in_progress': courses_in_progress,
                'courses_completed': courses_completed,
                'exams_attempted': exams_attempted,
                'average_exam_score': avg_exam_score,
                'applications_submitted': applications_submitted,
                'applications_accepted': applications_accepted,
                'applications_rejected': applications_rejected,
                'interviews_scheduled': interviews_scheduled,
                'interviews_completed': interviews_completed,
                'skills_total': skills_total,
                'skills_endorsed': skills_endorsed,
            }
        )
        
        return metric
    
    @staticmethod
    def calculate_company_metrics(company: Company) -> CompanyDashboardMetric:
        """Calculate all metrics for a company and update/create dashboard metric record"""
        
        # Hiring overview
        open_vacancies = company.vacancies.filter(
            status=Vacancy.Status.ACTIVE
        ).count()
        
        applications = Application.objects.filter(company=company)
        total_applications = applications.count()
        
        interviews = Interview.objects.filter(company=company)
        interviews_scheduled = interviews.filter(
            status__in=[Interview.Status.CONFIRMED, Interview.Status.RESCHEDULED]
        ).count()
        
        # For offers, we'll count shortlisted applications as proxy
        offers_made = applications.filter(
            status__in=['shortlisted', 'accepted']
        ).count()
        
        # Pipeline metrics
        seven_days_ago = timezone.now() - timedelta(days=7)
        new_applications_7days = applications.filter(
            created_at__gte=seven_days_ago
        ).count()
        
        # Interview conversion rate: interviews / applications
        interview_conversion_rate = 0.0
        if total_applications > 0:
            interview_conversion_rate = (interviews.count() / total_applications) * 100
        
        # Average time to hire (simplified)
        completed_interviews = interviews.filter(
            status=Interview.Status.COMPLETED
        )
        average_time_to_hire = 0
        if completed_interviews.exists():
            total_days = sum([
                (interview.completed_at - interview.created_at).days
                for interview in completed_interviews
                if interview.completed_at
            ])
            average_time_to_hire = total_days // completed_interviews.count() if completed_interviews.count() > 0 else 0
        
        # Shortlist ratio
        shortlisted_count = applications.filter(
            status=Application.Status.SHORTLISTED
        ).count()
        shortlist_ratio = 0.0
        if total_applications > 0:
            shortlist_ratio = (shortlisted_count / total_applications) * 100
        
        # Recent activity (last 7 days)
        recent_interviews_completed = interviews.filter(
            status=Interview.Status.COMPLETED,
            completed_at__gte=seven_days_ago
        ).count()
        
        from users.models import CandidateShortlist
        recent_candidates_shortlisted = CandidateShortlist.objects.filter(
            company=company,
            created_at__gte=seven_days_ago
        ).count()
        
        recent_notes_added = CandidateNote.objects.filter(
            company=company,
            created_at__gte=seven_days_ago
        ).count()
        
        # Update or create metric
        metric, _ = CompanyDashboardMetric.objects.update_or_create(
            company=company,
            defaults={
                'open_vacancies': open_vacancies,
                'total_applications': total_applications,
                'interviews_scheduled': interviews_scheduled,
                'offers_made': offers_made,
                'new_applications_7days': new_applications_7days,
                'interview_conversion_rate': interview_conversion_rate,
                'average_time_to_hire_days': average_time_to_hire,
                'shortlist_ratio': shortlist_ratio,
                'recent_interviews_completed': recent_interviews_completed,
                'recent_candidates_shortlisted': recent_candidates_shortlisted,
                'recent_notes_added': recent_notes_added,
            }
        )
        
        return metric
    
    @staticmethod
    def get_student_dashboard_data(student_profile: StudentProfile) -> dict:
        """Aggregate all data for student dashboard - includes current metrics and historical data"""
        
        metric = AnalyticsService.calculate_student_metrics(student_profile)
        student_user = student_profile.user
        
        # Get exam score history for chart data
        exam_results = ExamResult.objects.filter(student=student_user).order_by('taken_at')[:30]
        score_history = [
            {
                'date': result.taken_at.strftime('%Y-%m-%d'),
                'score': result.score_percent,
                'exam': result.exam_title
            }
            for result in exam_results
        ]
        
        # Get learning progress data
        learning_records = LearningRecord.objects.filter(student=student_user)
        learning_status = {
            'not_started': learning_records.filter(status=LearningRecord.Status.NOT_STARTED).count(),
            'in_progress': learning_records.filter(status=LearningRecord.Status.IN_PROGRESS).count(),
            'completed': learning_records.filter(status=LearningRecord.Status.COMPLETED).count(),
        }
        
        # Get upcoming interviews
        upcoming_interviews = Interview.objects.filter(
            student=student_user,
            status__in=[Interview.Status.REQUESTED, Interview.Status.CONFIRMED, Interview.Status.RESCHEDULED],
            scheduled_start__isnull=False
        ).order_by('scheduled_start')[:3]
        
        interviews_data = [
            {
                'id': interview.id,
                'company': interview.company.name,
                'purpose': interview.purpose,
                'scheduled_start': interview.scheduled_start.isoformat() if interview.scheduled_start else None,
                'status': interview.status,
                'meeting_url': interview.meeting_url
            }
            for interview in upcoming_interviews
        ]
        
        # Get application breakdown
        applications = Application.objects.filter(student=student_user)
        application_status = {
            'submitted': applications.filter(status=Application.Status.SUBMITTED).count(),
            'under_review': applications.filter(status=Application.Status.UNDER_REVIEW).count(),
            'shortlisted': applications.filter(status=Application.Status.SHORTLISTED).count(),
            'rejected': applications.filter(status=Application.Status.REJECTED).count(),
            'withdrawn': applications.filter(status=Application.Status.WITHDRAWN).count(),
        }
        
        return {
            'metrics': {
                'courses_in_progress': metric.courses_in_progress,
                'courses_completed': metric.courses_completed,
                'exams_attempted': metric.exams_attempted,
                'average_exam_score': round(metric.average_exam_score, 2),
                'applications_submitted': metric.applications_submitted,
                'applications_accepted': metric.applications_accepted,
                'applications_rejected': metric.applications_rejected,
                'interviews_scheduled': metric.interviews_scheduled,
                'interviews_completed': metric.interviews_completed,
                'skills_total': metric.skills_total,
                'skills_endorsed': metric.skills_endorsed,
            },
            'score_history': score_history,
            'learning_status': learning_status,
            'upcoming_interviews': interviews_data,
            'application_status': application_status,
            'last_updated': metric.updated_at.isoformat(),
        }
    
    @staticmethod
    def get_company_dashboard_data(company: Company) -> dict:
        """Aggregate all data for company dashboard"""
        
        metric = AnalyticsService.calculate_company_metrics(company)
        
        # Get vacancy performance data
        vacancies = company.vacancies.filter(status=Vacancy.Status.ACTIVE)
        vacancy_performance = []
        for vacancy in vacancies[:10]:  # Top 10 vacancies
            app_count = Application.objects.filter(vacancy=vacancy).count()
            vacancy_performance.append({
                'id': vacancy.id,
                'title': vacancy.title,
                'applications': app_count,
                'active': True
            })
        
        # Get application funnel data
        all_applications = Application.objects.filter(company=company)
        funnel_data = [
            {
                'stage': 'Applications',
                'count': all_applications.count()
            },
            {
                'stage': 'Under Review',
                'count': all_applications.filter(status=Application.Status.UNDER_REVIEW).count()
            },
            {
                'stage': 'Shortlisted',
                'count': all_applications.filter(status=Application.Status.SHORTLISTED).count()
            },
            {
                'stage': 'Interviews',
                'count': Interview.objects.filter(company=company).count()
            }
        ]
        
        # Get recent activity
        seven_days_ago = timezone.now() - timedelta(days=7)
        daily_activity = {}
        for i in range(7):
            date = (timezone.now() - timedelta(days=i)).date()
            date_str = date.strftime('%Y-%m-%d')
            daily_activity[date_str] = {
                'applications': all_applications.filter(created_at__date=date).count(),
                'interviews': Interview.objects.filter(company=company, created_at__date=date).count(),
            }
        
        return {
            'metrics': {
                'open_vacancies': metric.open_vacancies,
                'total_applications': metric.total_applications,
                'interviews_scheduled': metric.interviews_scheduled,
                'offers_made': metric.offers_made,
                'new_applications_7days': metric.new_applications_7days,
                'interview_conversion_rate': round(metric.interview_conversion_rate, 1),
                'average_time_to_hire_days': metric.average_time_to_hire_days,
                'shortlist_ratio': round(metric.shortlist_ratio, 1),
                'recent_interviews_completed': metric.recent_interviews_completed,
                'recent_candidates_shortlisted': metric.recent_candidates_shortlisted,
                'recent_notes_added': metric.recent_notes_added,
            },
            'vacancy_performance': vacancy_performance,
            'funnel_data': funnel_data,
            'daily_activity': daily_activity,
            'last_updated': metric.updated_at.isoformat(),
        }
    
    @staticmethod
    def get_admin_dashboard_data() -> dict:
        """Aggregate platform-wide metrics for admin dashboard"""
        
        from users.models import User
        
        # User metrics
        total_students = User.objects.filter(role=User.Role.STUDENT).count()
        total_companies = Company.objects.count()
        total_admins = User.objects.filter(role=User.Role.ADMIN).count()
        
        # Active users (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        active_users = User.objects.filter(last_login__gte=thirty_days_ago).count()
        
        # New signups this month
        first_of_month = timezone.now().replace(day=1, hour=0, minute=0, second=0)
        new_signups = User.objects.filter(date_joined__gte=first_of_month).count()
        
        # Platform activity
        applications_created = Application.objects.filter(
            created_at__gte=thirty_days_ago
        ).count()
        
        interviews_completed = Interview.objects.filter(
            status=Interview.Status.COMPLETED,
            completed_at__gte=thirty_days_ago
        ).count()
        
        exams_taken = ExamResult.objects.filter(
            created_at__gte=thirty_days_ago
        ).count()
        
        courses_started = LearningRecord.objects.filter(
            created_at__gte=thirty_days_ago
        ).count()
        
        # Content metrics
        total_courses = Company.objects.count()  # Placeholder
        from users.models import Exam, Course
        total_exams = Exam.objects.count()
        total_vacancies = Vacancy.objects.count()
        
        # User growth data (last 12 months)
        user_growth = []
        for i in range(12):
            month_start = timezone.now() - timedelta(days=30*i)
            month_end = month_start + timedelta(days=30)
            count = User.objects.filter(
                date_joined__range=[month_start, month_end]
            ).count()
            user_growth.append({
                'month': month_start.strftime('%Y-%m'),
                'users': count
            })
        
        return {
            'platform_overview': {
                'total_students': total_students,
                'total_companies': total_companies,
                'total_admins': total_admins,
                'active_users_30d': active_users,
                'new_signups_this_month': new_signups,
            },
            'platform_activity': {
                'applications_created_30d': applications_created,
                'interviews_completed_30d': interviews_completed,
                'exams_taken_30d': exams_taken,
                'courses_started_30d': courses_started,
            },
            'content_metrics': {
                'total_courses': total_courses,
                'total_exams': total_exams,
                'total_vacancies': total_vacancies,
            },
            'user_growth': user_growth,
            'last_updated': timezone.now().isoformat(),
        }
