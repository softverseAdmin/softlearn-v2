from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import time

from users.models import (
    Company,
    Notification,
    NotificationDelivery,
    NotificationEvent,
    NotificationPreference,
    User as UserModel,
)

User = get_user_model()


class NotificationPreferenceModelTest(TestCase):
    """Test NotificationPreference model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            full_name="Test User",
            role=User.Role.STUDENT,
        )

    def test_create_notification_preference(self):
        """Test creating notification preference."""
        pref = NotificationPreference.objects.create(user=self.user)
        self.assertEqual(pref.user, self.user)
        self.assertTrue(pref.email_on_application)
        self.assertTrue(pref.email_on_interview)
        self.assertTrue(pref.email_on_exam_result)
        self.assertFalse(pref.email_on_study_plan)
        self.assertTrue(pref.app_notifications_enabled)

    def test_notification_preference_defaults(self):
        """Test notification preference default values."""
        pref = NotificationPreference.objects.create(user=self.user)
        self.assertFalse(pref.daily_digest)
        # digest_time default is "09:00" as a string
        self.assertEqual(str(pref.digest_time), "09:00")
        self.assertFalse(pref.unsubscribed)

    def test_notification_preference_one_to_one(self):
        """Test one-to-one relationship with user."""
        pref = NotificationPreference.objects.create(user=self.user)
        self.assertEqual(self.user.notification_preference, pref)


class NotificationEventModelTest(TestCase):
    """Test NotificationEvent model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            full_name="Test User",
            role=User.Role.STUDENT,
        )
        self.actor = User.objects.create_user(
            email="actor@example.com",
            password="testpass123",
            full_name="Actor User",
            role=User.Role.ADMIN,
        )

    def test_create_notification_event(self):
        """Test creating notification event."""
        event = NotificationEvent.objects.create(
            event_type=NotificationEvent.EventType.EXAM_RESULT_READY,
            user=self.user,
            actor=self.actor,
            metadata={"exam_title": "Test Exam", "score": 85},
        )
        self.assertEqual(event.event_type, NotificationEvent.EventType.EXAM_RESULT_READY)
        self.assertEqual(event.user, self.user)
        self.assertEqual(event.actor, self.actor)
        self.assertEqual(event.metadata["exam_title"], "Test Exam")

    def test_notification_event_ordering(self):
        """Test notification events are ordered by created_at."""
        event1 = NotificationEvent.objects.create(
            event_type=NotificationEvent.EventType.EXAM_RESULT_READY,
            user=self.user,
        )
        event2 = NotificationEvent.objects.create(
            event_type=NotificationEvent.EventType.STUDY_PLAN_READY,
            user=self.user,
        )
        events = NotificationEvent.objects.all()
        self.assertEqual(events[0], event2)  # Most recent first
        self.assertEqual(events[1], event1)


class NotificationAPITest(TestCase):
    """Test notification API endpoints."""

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            full_name="Test User",
            role=User.Role.STUDENT,
        )
        self.client.login(email="test@example.com", password="testpass123")

    def test_get_notification_preferences(self):
        """Test getting notification preferences."""
        NotificationPreference.objects.create(user=self.user)
        response = self.client.get('/api/v1/notification-preferences')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('data', data)
        self.assertTrue(data['data']['email_on_application'])

    def test_update_notification_preferences(self):
        """Test updating notification preferences."""
        NotificationPreference.objects.create(user=self.user)
        response = self.client.put(
            '/api/v1/notification-preferences/update',
            data={'email_on_study_plan': True, 'daily_digest': True},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        pref = NotificationPreference.objects.get(user=self.user)
        self.assertTrue(pref.email_on_study_plan)
        self.assertTrue(pref.daily_digest)

    def test_notification_list(self):
        """Test listing notifications."""
        notification = Notification.objects.create(
            recipient=self.user,
            notification_type=Notification.Type.EXAM_RESULT_AVAILABLE,
            title="Exam Result",
            message="Your exam is ready",
            entity_type="exam",
            entity_id=1,
            event_key="exam-1",
        )
        response = self.client.get('/api/v1/notifications')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['data']['notifications']), 1)
        self.assertEqual(data['data']['unread_count'], 1)

    def test_mark_notification_as_read(self):
        """Test marking notification as read."""
        notification = Notification.objects.create(
            recipient=self.user,
            notification_type=Notification.Type.EXAM_RESULT_AVAILABLE,
            title="Exam Result",
            message="Your exam is ready",
            entity_type="exam",
            entity_id=1,
            event_key="exam-1",
        )
        response = self.client.post(f'/api/v1/notifications/{notification.id}/read')
        self.assertEqual(response.status_code, 200)
        notification.refresh_from_db()
        self.assertIsNotNone(notification.read_at)

    def test_mark_all_notifications_as_read(self):
        """Test marking all notifications as read."""
        Notification.objects.create(
            recipient=self.user,
            notification_type=Notification.Type.EXAM_RESULT_AVAILABLE,
            title="Exam 1",
            message="Result 1",
            entity_type="exam",
            entity_id=1,
            event_key="exam-1",
        )
        Notification.objects.create(
            recipient=self.user,
            notification_type=Notification.Type.EXAM_RESULT_AVAILABLE,
            title="Exam 2",
            message="Result 2",
            entity_type="exam",
            entity_id=2,
            event_key="exam-2",
        )
        response = self.client.post('/api/v1/notifications/read-all')
        self.assertEqual(response.status_code, 200)
        unread = Notification.objects.filter(recipient=self.user, read_at__isnull=True)
        self.assertEqual(unread.count(), 0)

    def test_notifications_require_authentication(self):
        """Test that notification endpoints require authentication."""
        self.client.logout()
        response = self.client.get('/api/v1/notifications')
        self.assertNotEqual(response.status_code, 200)


class NotificationDeliveryTest(TestCase):
    """Test NotificationDelivery model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            full_name="Test User",
            role=User.Role.STUDENT,
        )
        self.notification = Notification.objects.create(
            recipient=self.user,
            notification_type=Notification.Type.EXAM_RESULT_AVAILABLE,
            title="Exam Result",
            message="Your exam is ready",
            entity_type="exam",
            entity_id=1,
            event_key="exam-1",
        )

    def test_create_notification_delivery(self):
        """Test creating notification delivery."""
        delivery = NotificationDelivery.objects.create(
            notification=self.notification,
            channel=NotificationDelivery.Channel.EMAIL,
            status=NotificationDelivery.Status.LOGGED,
        )
        self.assertEqual(delivery.notification, self.notification)
        self.assertEqual(delivery.channel, NotificationDelivery.Channel.EMAIL)
        self.assertEqual(delivery.status, NotificationDelivery.Status.LOGGED)

    def test_unique_notification_delivery(self):
        """Test unique constraint on notification delivery."""
        NotificationDelivery.objects.create(
            notification=self.notification,
            channel=NotificationDelivery.Channel.EMAIL,
            status=NotificationDelivery.Status.LOGGED,
        )
        with self.assertRaises(Exception):
            NotificationDelivery.objects.create(
                notification=self.notification,
                channel=NotificationDelivery.Channel.EMAIL,
                status=NotificationDelivery.Status.LOGGED,
            )


class NotificationTest(TestCase):
    """Test Notification model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            full_name="Test User",
            role=User.Role.STUDENT,
        )

    def test_notification_is_read_property(self):
        """Test is_read property."""
        notification = Notification.objects.create(
            recipient=self.user,
            notification_type=Notification.Type.EXAM_RESULT_AVAILABLE,
            title="Exam Result",
            message="Your exam is ready",
            entity_type="exam",
            entity_id=1,
            event_key="exam-1",
        )
        self.assertFalse(notification.is_read)
        notification.mark_read()
        self.assertTrue(notification.is_read)

    def test_notification_mark_read(self):
        """Test mark_read method."""
        notification = Notification.objects.create(
            recipient=self.user,
            notification_type=Notification.Type.EXAM_RESULT_AVAILABLE,
            title="Exam Result",
            message="Your exam is ready",
            entity_type="exam",
            entity_id=1,
            event_key="exam-1",
        )
        self.assertIsNone(notification.read_at)
        notification.mark_read()
        self.assertIsNotNone(notification.read_at)
