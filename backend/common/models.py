from django.db import models
from django.contrib.auth import get_user_model
import json

User = get_user_model()


class ApplicationLogEntry(models.Model):
    """Structured log entry for request/application logging"""
    
    LEVEL_CHOICES = [
        ('DEBUG', 'Debug'),
        ('INFO', 'Info'),
        ('WARNING', 'Warning'),
        ('ERROR', 'Error'),
        ('CRITICAL', 'Critical'),
    ]
    
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, db_index=True)
    service = models.CharField(max_length=50, db_index=True)  # e.g., 'api', 'frontend', 'scheduler'
    message = models.TextField()
    request_id = models.CharField(max_length=100, db_index=True, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_index=True, related_name='app_logs')
    request_method = models.CharField(max_length=10, null=True, blank=True)
    request_path = models.CharField(max_length=500, null=True, blank=True)
    response_status = models.IntegerField(null=True, blank=True)
    duration_ms = models.FloatField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at', 'level']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['request_id']),
        ]
    
    def __str__(self):
        return f"[{self.level}] {self.service} - {self.message[:100]}"


class ErrorReport(models.Model):
    """Error tracking and aggregation"""
    
    error_type = models.CharField(max_length=255, db_index=True)
    error_message = models.TextField()
    stack_trace = models.TextField(null=True, blank=True)
    request_id = models.CharField(max_length=100, db_index=True, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_index=True, related_name='error_reports')
    request_method = models.CharField(max_length=10, null=True, blank=True)
    request_path = models.CharField(max_length=500, null=True, blank=True)
    environment = models.CharField(max_length=20, default='production')
    metadata = models.JSONField(default=dict, blank=True)
    occurrence_count = models.IntegerField(default=1)
    first_occurrence = models.DateTimeField(auto_now_add=True)
    last_occurrence = models.DateTimeField(auto_now=True, db_index=True)
    is_resolved = models.BooleanField(default=False, db_index=True)
    
    class Meta:
        ordering = ['-last_occurrence']
        indexes = [
            models.Index(fields=['error_type', 'is_resolved']),
            models.Index(fields=['last_occurrence']),
        ]
    
    def __str__(self):
        return f"{self.error_type} - {self.occurrence_count} occurrences"
    
    def increment(self):
        """Increment occurrence count and update last_occurrence"""
        self.occurrence_count += 1
        self.save(update_fields=['occurrence_count', 'last_occurrence'])
