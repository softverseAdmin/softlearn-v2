import json
from unittest.mock import patch

from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils import timezone

from api.views import build_course_assessment_generation_source, ensure_default_course_assessment_questions
from services.gemini import GeminiExamGenerationError, GeminiExamQuestion, GeminiExamQuestionOption
from users.models import (
    Company,
    Course,
    CourseAssessment,
    CourseAssessmentAttempt,
    CourseAssessmentAttemptSelection,
    CourseAssessmentOption,
    CourseAssessmentQuestion,
    LearningRecord,
    Lesson,
    LessonProgress,
    User,
)


@override_settings(
    GEMINI_API_KEY="test-key",
    GEMINI_MODEL="gemini-1.5-flash",
    GEMINI_EXAM_GENERATION_ENABLED=True,
    GEMINI_EXAM_REQUEST_TIMEOUT_SECONDS=15,
    GEMINI_EXAM_MAX_OUTPUT_TOKENS=768,
    GEMINI_EXAM_SOURCE_CHAR_LIMIT=4000,
    GEMINI_EXAM_DEFAULT_QUESTION_COUNT=5,
    GEMINI_EXAM_FINAL_QUESTION_COUNT=15,
)
class CourseGeminiAssessmentTests(TestCase):
    def setUp(self):
        cache.clear()
        self.company = Company.objects.create(name="Softverse")
        self.company_user = User.objects.create_user(
            email="company@example.com",
            password="testpass123",
            role=User.Role.COMPANY,
            full_name="Company User",
            company=self.company,
        )
        self.student_user = User.objects.create_user(
            email="student@example.com",
            password="testpass123",
            role=User.Role.STUDENT,
            full_name="Student User",
        )
        self.course = Course.objects.create(
            title="React Fundamentals",
            description="Learn core React ideas with practical examples.",
            category="frontend",
            difficulty_level="beginner",
            estimated_hours=4,
            status=Course.Status.ACTIVE,
            company=self.company,
            created_by=self.company_user,
        )
        self.lesson = Lesson.objects.create(
            course=self.course,
            title="Understanding Hooks",
            summary="Hooks help manage state and effects.",
            content="React hooks let you reuse logic and manage state in function components.",
            transcript="Hooks let you reuse stateful logic. Use useState for state and useEffect for side effects."
            * 8,
            sequence_number=1,
            status=Lesson.Status.ACTIVE,
        )
        self.second_lesson = Lesson.objects.create(
            course=self.course,
            title="Managing Complex State",
            summary="Reducer patterns organize multi-step state updates.",
            content="Reducers and context help coordinate application state across multiple components.",
            transcript="Reducers make complex state predictable. Context shares stateful data through a component tree."
            * 6,
            sequence_number=2,
            status=Lesson.Status.ACTIVE,
        )
        self.assessment = CourseAssessment.objects.create(
            course=self.course,
            lesson=self.lesson,
            title="Lesson 1 Exam",
            description="Check lesson understanding.",
            kind=CourseAssessment.Kind.LESSON,
            passing_score_percent=80,
            status=CourseAssessment.Status.ACTIVE,
        )
        self.final_assessment = CourseAssessment.objects.create(
            course=self.course,
            title="Final Course Exam",
            description="Assess understanding across the full course.",
            kind=CourseAssessment.Kind.FINAL,
            passing_score_percent=80,
            status=CourseAssessment.Status.ACTIVE,
        )

    def generated_questions(self):
        return [
            GeminiExamQuestion(
                prompt="What do hooks allow in React?",
                instructions="Choose one answer.",
                question_type="single_choice",
                options=(
                    GeminiExamQuestionOption(
                        option_text="State in function components",
                        is_correct=True,
                    ),
                    GeminiExamQuestionOption(
                        option_text="Only server rendering",
                        is_correct=False,
                    ),
                    GeminiExamQuestionOption(
                        option_text="Only CSS processing",
                        is_correct=False,
                    ),
                    GeminiExamQuestionOption(
                        option_text="Direct database access",
                        is_correct=False,
                    ),
                ),
            )
        ]

    def test_generation_source_includes_filtered_transcript_and_stays_compact(self):
        source_text = build_course_assessment_generation_source(self.assessment)

        self.assertIn("Lesson transcript:", source_text)
        self.assertIn("useState for state", source_text)
        self.assertNotIn("Managing Complex State", source_text)
        self.assertLessEqual(len(source_text), 2600)

    def test_second_lesson_generation_source_uses_only_that_lesson(self):
        second_assessment = CourseAssessment.objects.create(
            course=self.course,
            lesson=self.second_lesson,
            title="Lesson 2 Exam",
            description="Check complex state understanding.",
            kind=CourseAssessment.Kind.LESSON,
            passing_score_percent=80,
            status=CourseAssessment.Status.ACTIVE,
        )

        source_text = build_course_assessment_generation_source(second_assessment)

        self.assertIn("Managing Complex State", source_text)
        self.assertIn("Reducers and context help coordinate application state", source_text)
        self.assertNotIn("Understanding Hooks", source_text)
        self.assertNotIn("useState for state", source_text)

    def test_lesson_generation_source_does_not_fall_back_to_all_lessons_when_lesson_relation_is_missing(self):
        detached_assessment = CourseAssessment(
            course=self.course,
            lesson_id=self.second_lesson.id,
            title="Detached Lesson 2 Exam",
            description="Generated from only lesson 2.",
            kind=CourseAssessment.Kind.LESSON,
            passing_score_percent=80,
            status=CourseAssessment.Status.ACTIVE,
        )

        source_text = build_course_assessment_generation_source(detached_assessment)

        self.assertIn("Managing Complex State", source_text)
        self.assertNotIn("Understanding Hooks", source_text)

    def test_final_generation_source_includes_all_course_lessons_and_stays_compact(self):
        source_text = build_course_assessment_generation_source(self.final_assessment)

        self.assertIn("Lesson 1 title: Understanding Hooks", source_text)
        self.assertIn("Lesson 2 title: Managing Complex State", source_text)
        self.assertIn("Reducers and context help coordinate application state", source_text)
        self.assertIn("Context shares stateful data through a component tree", source_text)
        self.assertLessEqual(len(source_text), 4000)

    def test_final_default_question_bank_expands_to_fifteen_questions(self):
        ensure_default_course_assessment_questions(self.final_assessment, lessons=[self.lesson, self.second_lesson])

        self.assertEqual(CourseAssessmentQuestion.objects.filter(assessment=self.final_assessment).count(), 15)

    def test_existing_final_default_question_bank_is_topped_up_to_fifteen_questions(self):
        CourseAssessmentQuestion.objects.create(
            assessment=self.final_assessment,
            prompt="Existing final question",
            instructions="Choose one answer.",
            question_type=CourseAssessmentQuestion.QuestionType.SINGLE_CHOICE,
            sequence_number=1,
            points=1,
            status=CourseAssessmentQuestion.Status.ACTIVE,
        )

        ensure_default_course_assessment_questions(self.final_assessment, lessons=[self.lesson, self.second_lesson])

        self.assertEqual(CourseAssessmentQuestion.objects.filter(assessment=self.final_assessment).count(), 15)

    def create_authored_question(self):
        question = CourseAssessmentQuestion.objects.create(
            assessment=self.assessment,
            prompt="Old stored question",
            instructions="Choose one answer.",
            question_type=CourseAssessmentQuestion.QuestionType.SINGLE_CHOICE,
            sequence_number=1,
            points=1,
            status=CourseAssessmentQuestion.Status.ACTIVE,
        )
        CourseAssessmentOption.objects.create(
            question=question,
            option_text="Old correct answer",
            sequence_number=1,
            is_correct=True,
            status=CourseAssessmentOption.Status.ACTIVE,
        )
        CourseAssessmentOption.objects.create(
            question=question,
            option_text="Old wrong answer",
            sequence_number=2,
            is_correct=False,
            status=CourseAssessmentOption.Status.ACTIVE,
        )

    @patch("services.gemini.GeminiExamGenerationService.generate_questions")
    def test_company_preview_lesson_exam_generates_questions(self, mock_generate_questions):
        mock_generate_questions.return_value = self.generated_questions()
        self.client.force_login(self.company_user)

        detail_response = self.client.get(
            f"/api/v1/company/courses/{self.course.id}/preview/lessons/{self.lesson.id}/exam"
        )

        self.assertEqual(detail_response.status_code, 200)
        detail_data = detail_response.json()["data"]
        self.assertEqual(len(detail_data["questions"]), 1)
        self.assertLess(detail_data["questions"][0]["question_id"], 0)

        selected_option_id = detail_data["questions"][0]["options"][0]["option_id"]
        submit_response = self.client.post(
            f"/api/v1/company/courses/{self.course.id}/preview/lessons/{self.lesson.id}/exam/submit",
            data=json.dumps(
                {
                    "answers": [
                        {
                            "question_id": detail_data["questions"][0]["question_id"],
                            "selected_option_ids": [selected_option_id],
                        }
                    ]
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(submit_response.status_code, 201)
        submit_data = submit_response.json()["data"]
        self.assertTrue(submit_data["passed"])
        self.assertEqual(submit_data["score_percent"], 100)

    @patch("services.gemini.GeminiExamGenerationService.generate_questions")
    def test_company_preview_second_lesson_exam_uses_second_lesson_source(self, mock_generate_questions):
        mock_generate_questions.return_value = self.generated_questions()
        self.client.force_login(self.company_user)

        detail_response = self.client.get(
            f"/api/v1/company/courses/{self.course.id}/preview/lessons/{self.second_lesson.id}/exam"
        )

        self.assertEqual(detail_response.status_code, 200)
        request_payload = mock_generate_questions.call_args.args[0]
        self.assertIn("Managing Complex State", request_payload.source_text)
        self.assertNotIn("Understanding Hooks", request_payload.source_text)

    @patch("services.gemini.GeminiExamGenerationService.generate_questions")
    def test_company_preview_prefers_gemini_over_old_authored_questions(self, mock_generate_questions):
        self.create_authored_question()
        mock_generate_questions.return_value = self.generated_questions()
        self.client.force_login(self.company_user)

        detail_response = self.client.get(
            f"/api/v1/company/courses/{self.course.id}/preview/lessons/{self.lesson.id}/exam"
        )

        self.assertEqual(detail_response.status_code, 200)
        detail_data = detail_response.json()["data"]
        self.assertEqual(detail_data["questions"][0]["prompt"], "What do hooks allow in React?")
        self.assertLess(detail_data["questions"][0]["question_id"], 0)

    @patch("services.gemini.GeminiExamGenerationService.generate_questions")
    def test_company_preview_final_exam_uses_all_lessons_and_requests_fifteen_questions(self, mock_generate_questions):
        mock_generate_questions.return_value = [
            GeminiExamQuestion(
                prompt=f"Question {index}",
                instructions="Choose one answer.",
                question_type="single_choice",
                options=(
                    GeminiExamQuestionOption(option_text="Option A", is_correct=True),
                    GeminiExamQuestionOption(option_text="Option B", is_correct=False),
                    GeminiExamQuestionOption(option_text="Option C", is_correct=False),
                    GeminiExamQuestionOption(option_text="Option D", is_correct=False),
                ),
            )
            for index in range(1, 16)
        ]
        self.client.force_login(self.company_user)

        detail_response = self.client.get(
            f"/api/v1/company/courses/{self.course.id}/preview/final-exam"
        )

        self.assertEqual(detail_response.status_code, 200)
        request_payload = mock_generate_questions.call_args.args[0]
        self.assertEqual(request_payload.question_count, 15)
        self.assertIn("Lesson 1 title: Understanding Hooks", request_payload.source_text)
        self.assertIn("Lesson 2 title: Managing Complex State", request_payload.source_text)
        self.assertEqual(len(detail_response.json()["data"]["questions"]), 15)

    @patch("services.gemini.GeminiExamGenerationService.generate_questions")
    def test_company_preview_final_exam_falls_back_to_fifteen_authored_questions_when_generation_is_short(self, mock_generate_questions):
        mock_generate_questions.side_effect = GeminiExamGenerationError("Gemini exam generation returned 1 questions, expected 15.")
        self.client.force_login(self.company_user)

        detail_response = self.client.get(
            f"/api/v1/company/courses/{self.course.id}/preview/final-exam"
        )

        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(len(detail_response.json()["data"]["questions"]), 15)

    @patch("services.gemini.GeminiExamGenerationService.generate_questions")
    def test_company_preview_falls_back_to_authored_questions_when_gemini_generation_fails(self, mock_generate_questions):
        self.create_authored_question()
        mock_generate_questions.side_effect = GeminiExamGenerationError("quota exhausted")
        self.client.force_login(self.company_user)

        detail_response = self.client.get(
            f"/api/v1/company/courses/{self.course.id}/preview/lessons/{self.lesson.id}/exam"
        )

        self.assertEqual(detail_response.status_code, 200)
        detail_data = detail_response.json()["data"]
        self.assertEqual(detail_data["questions"][0]["prompt"], "Old stored question")
        self.assertGreater(detail_data["questions"][0]["question_id"], 0)

    @patch("services.gemini.GeminiExamGenerationService.generate_questions")
    def test_company_preview_caches_gemini_failure_briefly_and_uses_authored_questions(self, mock_generate_questions):
        self.create_authored_question()
        mock_generate_questions.side_effect = GeminiExamGenerationError('{"retryDelay":"48s","message":"Quota exceeded"}')
        self.client.force_login(self.company_user)

        first_response = self.client.get(
            f"/api/v1/company/courses/{self.course.id}/preview/lessons/{self.lesson.id}/exam"
        )
        second_response = self.client.get(
            f"/api/v1/company/courses/{self.course.id}/preview/lessons/{self.lesson.id}/exam"
        )

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 200)
        self.assertEqual(mock_generate_questions.call_count, 1)

    @patch("services.gemini.GeminiExamGenerationService.generate_questions")
    def test_student_lesson_exam_generates_questions_and_stores_score_only(self, mock_generate_questions):
        mock_generate_questions.return_value = self.generated_questions()
        learning_record = LearningRecord.objects.create(
            student=self.student_user,
            course=self.course,
            course_title=self.course.title,
            category=self.course.category,
            progress_percent=0,
            status=LearningRecord.Status.IN_PROGRESS,
        )
        LessonProgress.objects.create(
            learning_record=learning_record,
            lesson=self.lesson,
            status=LessonProgress.Status.COMPLETED,
            started_at=timezone.now(),
            completed_at=timezone.now(),
        )
        self.client.force_login(self.student_user)

        detail_response = self.client.get(
            f"/api/v1/student/courses/{self.course.id}/lessons/{self.lesson.id}/exam"
        )

        self.assertEqual(detail_response.status_code, 200)
        detail_data = detail_response.json()["data"]
        self.assertEqual(len(detail_data["questions"]), 1)

        selected_option_id = detail_data["questions"][0]["options"][0]["option_id"]
        submit_response = self.client.post(
            f"/api/v1/student/courses/{self.course.id}/lessons/{self.lesson.id}/exam/submit",
            data=json.dumps(
                {
                    "answers": [
                        {
                            "question_id": detail_data["questions"][0]["question_id"],
                            "selected_option_ids": [selected_option_id],
                        }
                    ]
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(submit_response.status_code, 201)
        submit_data = submit_response.json()["data"]
        self.assertTrue(submit_data["passed"])
        self.assertEqual(submit_data["score_percent"], 100)
        self.assertEqual(CourseAssessmentAttempt.objects.filter(student=self.student_user, assessment=self.assessment).count(), 1)
        self.assertEqual(CourseAssessmentAttemptSelection.objects.count(), 0)

    @patch("services.gemini.GeminiExamGenerationService.generate_questions")
    def test_student_lesson_exam_falls_back_to_authored_questions_when_gemini_generation_fails(self, mock_generate_questions):
        self.create_authored_question()
        mock_generate_questions.side_effect = GeminiExamGenerationError("quota exhausted")
        learning_record = LearningRecord.objects.create(
            student=self.student_user,
            course=self.course,
            course_title=self.course.title,
            category=self.course.category,
            progress_percent=0,
            status=LearningRecord.Status.IN_PROGRESS,
        )
        LessonProgress.objects.create(
            learning_record=learning_record,
            lesson=self.lesson,
            status=LessonProgress.Status.COMPLETED,
            started_at=timezone.now(),
            completed_at=timezone.now(),
        )
        self.client.force_login(self.student_user)

        detail_response = self.client.get(
            f"/api/v1/student/courses/{self.course.id}/lessons/{self.lesson.id}/exam"
        )

        self.assertEqual(detail_response.status_code, 200)
        detail_data = detail_response.json()["data"]
        self.assertEqual(detail_data["questions"][0]["prompt"], "Old stored question")
        self.assertGreater(detail_data["questions"][0]["question_id"], 0)

    @patch("services.gemini.GeminiExamGenerationService.generate_questions")
    def test_lesson_exam_uses_default_authored_question_when_gemini_generation_fails_without_custom_authored_questions(self, mock_generate_questions):
        mock_generate_questions.side_effect = GeminiExamGenerationError("quota exhausted")
        self.client.force_login(self.company_user)

        detail_response = self.client.get(
            f"/api/v1/company/courses/{self.course.id}/preview/lessons/{self.lesson.id}/exam"
        )

        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(len(detail_response.json()["data"]["questions"]), 1)
