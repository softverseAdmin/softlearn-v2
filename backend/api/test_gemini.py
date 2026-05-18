import json
from unittest.mock import patch

from django.test import SimpleTestCase, TestCase, override_settings

from services.gemini import (
    GeminiExamGenerationError,
    GeminiExamGenerationService,
    GeminiExamRequest,
)


class FakeGeminiHttpResponse:
    def __init__(self, payload: dict):
        self.payload = payload

    def read(self) -> bytes:
        return json.dumps(self.payload).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class GeminiExamGenerationServiceTests(SimpleTestCase):
    def test_build_prompt_truncates_source_and_stays_compact(self):
        service = GeminiExamGenerationService(
            api_key="test-key",
            enabled=True,
            source_char_limit=40,
        )

        prompt = service.build_prompt(
            GeminiExamRequest(
                course_title="React Basics",
                assessment_title="Lesson 1 Exam",
                source_text="Hooks let you use state and other React features without writing a class component.",
                difficulty_level="beginner",
                question_count=5,
                audience_label="student",
            )
        )

        self.assertIn("Create exactly 5 single_choice questions", prompt)
        self.assertIn("Course=React Basics.", prompt)
        self.assertIn("Assessment=Lesson 1 Exam.", prompt)
        self.assertIn("Source=Hooks let you use state and other React", prompt)
        self.assertLess(len(prompt), 900)

    def test_generate_questions_parses_json_response(self):
        service = GeminiExamGenerationService(
            api_key="test-key",
            enabled=True,
        )
        request_payload = GeminiExamRequest(
            course_title="React Basics",
            assessment_title="Lesson 1 Exam",
            source_text="Hooks let you use state in functional components.",
        )
        gemini_payload = {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {
                                "text": json.dumps(
                                    {
                                        "questions": [
                                            {
                                                "prompt": "What do hooks allow in React?",
                                                "instructions": "Choose one answer.",
                                                "question_type": "single_choice",
                                                "options": [
                                                    {"option_text": "State in functional components", "is_correct": True},
                                                    {"option_text": "Only class inheritance", "is_correct": False},
                                                    {"option_text": "Server-only rendering", "is_correct": False},
                                                    {"option_text": "CSS compilation", "is_correct": False},
                                                ],
                                            }
                                        ]
                                    }
                                )
                            }
                        ]
                    }
                }
            ]
        }

        with patch("services.gemini.request.urlopen", return_value=FakeGeminiHttpResponse(gemini_payload)):
            questions = service.generate_questions(request_payload)

        self.assertEqual(len(questions), 1)
        self.assertEqual(questions[0].prompt, "What do hooks allow in React?")
        self.assertEqual(len(questions[0].options), 4)
        self.assertEqual(sum(1 for option in questions[0].options if option.is_correct), 1)

    @override_settings(
        GEMINI_API_KEY="",
        GEMINI_MODEL="gemini-1.5-flash",
        GEMINI_EXAM_GENERATION_ENABLED=True,
        GEMINI_EXAM_REQUEST_TIMEOUT_SECONDS=15,
        GEMINI_EXAM_MAX_OUTPUT_TOKENS=768,
        GEMINI_EXAM_SOURCE_CHAR_LIMIT=4000,
        GEMINI_EXAM_DEFAULT_QUESTION_COUNT=5,
    )
    def test_generate_questions_requires_api_key(self):
        service = GeminiExamGenerationService()

        with self.assertRaises(GeminiExamGenerationError):
            service.generate_questions(
                GeminiExamRequest(
                    course_title="React Basics",
                    assessment_title="Lesson 1 Exam",
                    source_text="Hooks let you use state in functional components.",
                )
            )


class WebVitalsEndpointTests(TestCase):
    def test_web_vitals_endpoint_accepts_beacon_payload(self):
        response = self.client.post(
            "/api/v1/metrics/web-vitals",
            data=json.dumps(
                {
                    "name": "LCP",
                    "value": 1234,
                    "rating": "good",
                    "lcp": 1234,
                }
            ),
            content_type="text/plain",
        )

        self.assertEqual(response.status_code, 202)
        self.assertTrue(response.json()["data"]["received"])
