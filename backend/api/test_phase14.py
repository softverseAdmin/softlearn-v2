import json
from django.test import Client, TestCase
from django.utils import timezone
from datetime import timedelta

from users.models import (
    Exam,
    ExamCategory,
    ExamQuestion,
    ExamAnswerOption,
    Course,
    Lesson,
    MockExam,
    PracticeQuestion,
    PracticeQuestionOption,
    StudentProfile,
    StudyPlan,
    StudyPlanItem,
    StudentPerformanceMetric,
    User,
)


class Phase14TestCase(TestCase):
    """Test suite for Phase 14: Learning Enhancements"""
    
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        # Create test users
        self.student_user = User.objects.create_user(
            email="student@test.com",
            password="testpass123",
            role=User.Role.STUDENT,
            full_name="Test Student",
        )
        self.admin_user = User.objects.create_user(
            email="admin@test.com",
            password="testpass123",
            role=User.Role.ADMIN,
            full_name="Test Admin",
            is_staff=True,
        )
        
        # Create student profile
        self.student_profile = StudentProfile.objects.create(user=self.student_user)
        
        # Create exam category
        self.category = ExamCategory.objects.create(
            name="Python Basics",
            description="Basic Python Programming",
            icon="python",
            order=1,
            active=True,
        )
        
        # Create exam
        self.exam = Exam.objects.create(
            title="Python Fundamentals",
            description="Test your Python knowledge",
            category="Python",
            category_fk=self.category,
            duration_minutes=60,
            passing_score_percent=70,
            question_count=20,
            status=Exam.Status.ACTIVE,
        )
        
        # Create practice question
        self.question = PracticeQuestion.objects.create(
            exam=self.exam,
            question_text="What is the output of print(2 ** 3)?",
            explanation="2 ** 3 = 8",
            difficulty=PracticeQuestion.DifficultyChoices.EASY,
            topic="Operators",
        )
        
        # Create options
        PracticeQuestionOption.objects.create(
            question=self.question,
            option_text="6",
            is_correct=False,
        )
        PracticeQuestionOption.objects.create(
            question=self.question,
            option_text="8",
            is_correct=True,
            explanation="Correct! 2 to the power of 3 is 8",
        )
        
        # Create mock exam
        self.mock_exam = MockExam.objects.create(
            exam=self.exam,
            title="Python Practice Test",
            description="Full practice test",
            duration_minutes=60,
        )
        
        # Create course and lesson for study plan
        self.course = Course.objects.create(
            title="Python Fundamentals Course",
            category="Programming",
            status=Course.Status.ACTIVE,
        )
        self.lesson = Lesson.objects.create(
            course=self.course,
            title="Introduction to Python",
            sequence_number=1,
            status=Lesson.Status.ACTIVE,
        )
    
    # U14-1: Exam Categories Tests
    def test_list_exam_categories(self):
        """Test GET /api/v1/exam-categories/"""
        response = self.client.get("/api/v1/exam-categories")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)["data"]
        self.assertEqual(len(data["categories"]), 1)
        self.assertEqual(data["categories"][0]["name"], "Python Basics")
    
    def test_create_exam_category_admin_only(self):
        """Test POST /api/v1/exam-categories/ - admin only"""
        # Non-admin should fail
        self.client.login(email="student@test.com", password="testpass123")
        response = self.client.post(
            "/api/v1/exam-categories",
            data=json.dumps({
                "name": "JavaScript Basics",
                "description": "JS Programming",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)
        
        # Admin should succeed
        self.client.logout()
        self.client.login(email="admin@test.com", password="testpass123")
        response = self.client.post(
            "/api/v1/exam-categories",
            data=json.dumps({
                "name": "JavaScript Basics",
                "description": "JS Programming",
                "icon": "js",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content)["data"]
        self.assertEqual(data["name"], "JavaScript Basics")
    
    def test_get_exam_category_detail(self):
        """Test GET /api/v1/exam-categories/{id}/"""
        response = self.client.get(f"/api/v1/exam-categories/{self.category.id}")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)["data"]
        self.assertEqual(data["category"]["name"], "Python Basics")
        self.assertEqual(len(data["exams"]), 1)
    
    def test_update_exam_category(self):
        """Test PUT /api/v1/exam-categories/{id}/"""
        self.client.login(email="admin@test.com", password="testpass123")
        response = self.client.put(
            f"/api/v1/exam-categories/{self.category.id}",
            data=json.dumps({
                "name": "Advanced Python",
                "order": 2,
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)["data"]
        self.assertEqual(data["name"], "Advanced Python")
        self.assertEqual(data["order"], 2)
    
    def test_delete_exam_category(self):
        """Test DELETE /api/v1/exam-categories/{id}/"""
        # Create a new category without exams
        empty_cat = ExamCategory.objects.create(name="Empty Category")
        
        self.client.login(email="admin@test.com", password="testpass123")
        response = self.client.delete(f"/api/v1/exam-categories/{empty_cat.id}")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(ExamCategory.objects.filter(id=empty_cat.id).exists())
    
    # U14-2: Practice Questions Tests
    def test_list_practice_questions(self):
        """Test GET /api/v1/exams/{exam_id}/practice-questions/"""
        response = self.client.get(f"/api/v1/exams/{self.exam.id}/practice-questions")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)["data"]
        self.assertEqual(len(data["questions"]), 1)
        self.assertEqual(data["questions"][0]["question_text"], "What is the output of print(2 ** 3)?")
    
    def test_create_practice_question(self):
        """Test POST /api/v1/exams/{exam_id}/practice-questions/"""
        self.client.login(email="admin@test.com", password="testpass123")
        response = self.client.post(
            f"/api/v1/exams/{self.exam.id}/practice-questions",
            data=json.dumps({
                "question_text": "What is a list in Python?",
                "explanation": "A list is an ordered, mutable collection",
                "difficulty": "medium",
                "topic": "Data Structures",
                "options": [
                    {"option_text": "An immutable sequence", "is_correct": False},
                    {"option_text": "An ordered collection", "is_correct": True},
                ],
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content)["data"]
        self.assertEqual(data["question_text"], "What is a list in Python?")
    
    def test_get_practice_question_detail(self):
        """Test GET /api/v1/practice-questions/{id}/"""
        response = self.client.get(f"/api/v1/practice-questions/{self.question.id}")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)["data"]
        self.assertEqual(data["id"], self.question.id)
        self.assertEqual(len(data["options"]), 2)
    
    def test_answer_practice_question(self):
        """Test POST /api/v1/practice-questions/{id}/ - answer submission"""
        self.client.login(email="student@test.com", password="testpass123")
        
        # Get correct option
        correct_option = self.question.options.filter(is_correct=True).first()
        
        response = self.client.post(
            f"/api/v1/practice-questions/{self.question.id}",
            data=json.dumps({
                "selected_option_id": correct_option.id,
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)["data"]
        self.assertTrue(data["is_correct"])
    
    # U14-3: Mock Exams Tests
    def test_list_mock_exams(self):
        """Test GET /api/v1/exams/{exam_id}/mock-exams/"""
        response = self.client.get(f"/api/v1/exams/{self.exam.id}/mock-exams")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)["data"]
        self.assertEqual(len(data["mock_exams"]), 1)
        self.assertEqual(data["mock_exams"][0]["title"], "Python Practice Test")
    
    def test_create_mock_exam(self):
        """Test POST /api/v1/exams/{exam_id}/mock-exams/"""
        self.client.login(email="admin@test.com", password="testpass123")
        response = self.client.post(
            f"/api/v1/exams/{self.exam.id}/mock-exams",
            data=json.dumps({
                "title": "Advanced Python Test",
                "description": "Advanced level mock test",
                "duration_minutes": 90,
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content)["data"]
        self.assertEqual(data["title"], "Advanced Python Test")
        self.assertEqual(data["duration_minutes"], 90)
    
    # U14-4: Study Plans Tests
    def test_get_study_plan(self):
        """Test GET /api/v1/study-plan/"""
        # Create a study plan
        study_plan = StudyPlan.objects.create(
            student=self.student_profile,
            exam=self.exam,
        )
        
        self.client.login(email="student@test.com", password="testpass123")
        response = self.client.get("/api/v1/study-plan")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)["data"]
        self.assertEqual(data["plan"]["exam_id"], self.exam.id)
    
    # U14-5: Performance Metrics Tests
    def test_get_student_performance(self):
        """Test GET /api/v1/student/performance/"""
        # Create a performance metric
        StudentPerformanceMetric.objects.create(
            student=self.student_profile,
            exam=self.exam,
            metric_type=StudentPerformanceMetric.MetricTypeChoices.AVERAGE_SCORE,
            value=85.5,
            trend=StudentPerformanceMetric.TrendChoices.UP,
        )
        
        self.client.login(email="student@test.com", password="testpass123")
        response = self.client.get("/api/v1/student/performance")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)["data"]
        self.assertEqual(len(data["metrics"]), 1)
        self.assertEqual(data["metrics"][0]["value"], 85.5)
    
    def test_get_student_performance_by_exam(self):
        """Test GET /api/v1/student/performance/{exam_id}/"""
        # Create a performance metric
        metric = StudentPerformanceMetric.objects.create(
            student=self.student_profile,
            exam=self.exam,
            metric_type=StudentPerformanceMetric.MetricTypeChoices.BEST_SCORE,
            value=92.0,
        )
        
        self.client.login(email="student@test.com", password="testpass123")
        response = self.client.get(f"/api/v1/student/performance/{self.exam.id}")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)["data"]
        self.assertEqual(len(data["metrics"]), 1)
        self.assertEqual(data["metrics"][0]["value"], 92.0)
