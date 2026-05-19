import os
from django.template.loader import render_to_string
from django.conf import settings
from django.core.mail import EmailMultiAlternatives


class EmailService:
    """Email service for sending notifications via SendGrid."""

    def __init__(self):
        """Initialize email service with SendGrid API key."""
        self.api_key = os.getenv("SENDGRID_API_KEY", "")
        self.from_email = os.getenv("SENDGRID_FROM_EMAIL", "noreply@softlearn.io")
        self.enabled = bool(self.api_key and self.api_key != "")

    def send_email(self, to_email: str, subject: str, template_name: str, context: dict) -> bool:
        """
        Send an email using SendGrid.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            template_name: Email template name (e.g., 'application_received.html')
            context: Context dict for template rendering
            
        Returns:
            True if successful, False otherwise
        """
        try:
            html_content = render_to_string(f"emails/{template_name}", context)

            if self.enabled:
                from sendgrid import SendGridAPIClient
                from sendgrid.helpers.mail import Mail

                message = Mail(
                    from_email=self.from_email,
                    to_emails=to_email,
                    subject=subject,
                    html_content=html_content,
                )

                sg = SendGridAPIClient(self.api_key)
                sg.send(message)
                return True

            plain_text_content = render_to_string(f"emails/{template_name}", context | {"plain_text": True})
            message = EmailMultiAlternatives(
                subject=subject,
                body=plain_text_content,
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", self.from_email),
                to=[to_email],
            )
            message.attach_alternative(html_content, "text/html")
            message.send(fail_silently=False)
            return True
        except Exception as e:
            print(f"Error sending email to {to_email}: {str(e)}")
            return False

    def send_application_received(self, student_email: str, vacancy_title: str, company_name: str) -> bool:
        """Send email when application is received."""
        context = {
            "student_name": "Student",
            "vacancy_title": vacancy_title,
            "company_name": company_name,
            "app_url": os.getenv("FRONTEND_URL", "http://localhost:5173"),
        }
        return self.send_email(
            student_email,
            f"Application Received - {vacancy_title}",
            "application_received.html",
            context,
        )

    def send_interview_scheduled(self, student_email: str, interview_date: str, company_name: str, meeting_link: str = "") -> bool:
        """Send email when interview is scheduled."""
        context = {
            "student_name": "Student",
            "interview_date": interview_date,
            "company_name": company_name,
            "meeting_link": meeting_link,
            "app_url": os.getenv("FRONTEND_URL", "http://localhost:5173"),
        }
        return self.send_email(
            student_email,
            f"Interview Scheduled - {company_name}",
            "interview_scheduled.html",
            context,
        )

    def send_interview_reminder(self, student_email: str, interview_date: str, company_name: str, meeting_link: str = "") -> bool:
        """Send email reminder 24h before interview."""
        context = {
            "student_name": "Student",
            "interview_date": interview_date,
            "company_name": company_name,
            "meeting_link": meeting_link,
            "app_url": os.getenv("FRONTEND_URL", "http://localhost:5173"),
        }
        return self.send_email(
            student_email,
            f"Interview Reminder - {company_name}",
            "interview_reminder.html",
            context,
        )

    def send_exam_result(self, student_email: str, exam_title: str, score: int) -> bool:
        """Send email when exam result is available."""
        context = {
            "student_name": "Student",
            "exam_title": exam_title,
            "score": score,
            "app_url": os.getenv("FRONTEND_URL", "http://localhost:5173"),
        }
        return self.send_email(
            student_email,
            f"Exam Result Available - {exam_title}",
            "exam_result.html",
            context,
        )

    def send_study_plan_ready(self, student_email: str, study_plan_title: str = "Your Study Plan") -> bool:
        """Send email when study plan is ready."""
        context = {
            "student_name": "Student",
            "study_plan_title": study_plan_title,
            "app_url": os.getenv("FRONTEND_URL", "http://localhost:5173"),
        }
        return self.send_email(
            student_email,
            "Your Personalized Study Plan is Ready",
            "study_plan_ready.html",
            context,
        )

    def send_password_reset(self, user_email: str, user_name: str, reset_url: str) -> bool:
        """Send password reset email."""
        context = {
            "user_name": user_name,
            "reset_url": reset_url,
            "app_url": getattr(settings, "FRONTEND_URL", os.getenv("FRONTEND_URL", "http://localhost:5173")),
        }
        return self.send_email(
            user_email,
            "Reset your Softlearn password",
            "password_reset.html",
            context,
        )


def get_email_service() -> EmailService:
    """Get email service instance."""
    return EmailService()
