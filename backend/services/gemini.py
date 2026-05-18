import json
from dataclasses import dataclass
from typing import Any
from urllib import error, parse, request

from django.conf import settings


class GeminiExamGenerationError(Exception):
    """Raised when Gemini exam generation is unavailable or returns invalid data."""


@dataclass(frozen=True)
class GeminiExamQuestionOption:
    option_text: str
    is_correct: bool


@dataclass(frozen=True)
class GeminiExamQuestion:
    prompt: str
    question_type: str
    options: tuple[GeminiExamQuestionOption, ...]
    instructions: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "prompt": self.prompt,
            "instructions": self.instructions,
            "question_type": self.question_type,
            "options": [
                {
                    "option_text": option.option_text,
                    "is_correct": option.is_correct,
                }
                for option in self.options
            ],
        }


@dataclass(frozen=True)
class GeminiExamRequest:
    course_title: str
    assessment_title: str
    source_text: str
    difficulty_level: str = ""
    question_count: int = 5
    audience_label: str = "learner"


class GeminiExamGenerationService:
    """Generate compact exam question sets with Gemini using backend-only secrets."""

    endpoint_base = "https://generativelanguage.googleapis.com/v1beta/models"

    def __init__(
        self,
        *,
        api_key: str | None = None,
        model: str | None = None,
        enabled: bool | None = None,
        timeout_seconds: int | None = None,
        source_char_limit: int | None = None,
        max_output_tokens: int | None = None,
        default_question_count: int | None = None,
    ) -> None:
        self.api_key = api_key if api_key is not None else settings.GEMINI_API_KEY
        resolved_model = model if model is not None else settings.GEMINI_MODEL
        self.model = resolved_model.removeprefix("models/")
        self.enabled = (
            enabled
            if enabled is not None
            else settings.GEMINI_EXAM_GENERATION_ENABLED
        )
        self.timeout_seconds = (
            timeout_seconds
            if timeout_seconds is not None
            else settings.GEMINI_EXAM_REQUEST_TIMEOUT_SECONDS
        )
        self.source_char_limit = (
            source_char_limit
            if source_char_limit is not None
            else settings.GEMINI_EXAM_SOURCE_CHAR_LIMIT
        )
        self.max_output_tokens = (
            max_output_tokens
            if max_output_tokens is not None
            else settings.GEMINI_EXAM_MAX_OUTPUT_TOKENS
        )
        self.default_question_count = (
            default_question_count
            if default_question_count is not None
            else settings.GEMINI_EXAM_DEFAULT_QUESTION_COUNT
        )

    def is_available(self) -> bool:
        return self.enabled and bool(self.api_key.strip())

    def build_source_excerpt(self, source_text: str) -> str:
        normalized = " ".join(source_text.split())
        if not normalized:
            raise GeminiExamGenerationError("Gemini exam generation requires non-empty source text.")
        return normalized[: self.source_char_limit].strip()

    def build_prompt(self, exam_request: GeminiExamRequest) -> str:
        question_count = min(max(exam_request.question_count or self.default_question_count, 1), 10)
        difficulty_level = exam_request.difficulty_level.strip() or "unspecified"
        source_excerpt = self.build_source_excerpt(exam_request.source_text)
        return (
            "Output minified JSON only. "
            'Schema: {"questions":[{"prompt":"","instructions":"","question_type":"single_choice","options":[{"option_text":"","is_correct":true}]}]}. '
            f"Create exactly {question_count} single_choice questions. "
            "Exactly 4 options per question. Exactly 1 correct option. "
            "Keep everything extremely short to fit token limits. "
            "Rules: prompt max 12 words; instructions empty string or max 4 words; option_text max 6 words; no markdown; no code fences; no explanation text; no line breaks. "
            f"Course={exam_request.course_title.strip()}. "
            f"Assessment={exam_request.assessment_title.strip()}. "
            f"Difficulty={difficulty_level}. "
            f"Audience={exam_request.audience_label.strip() or 'learner'}. "
            f"Source={source_excerpt}"
        )

    def build_payload(self, exam_request: GeminiExamRequest) -> dict[str, Any]:
        return {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": self.build_prompt(exam_request)}],
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "topP": 0.8,
                "maxOutputTokens": self.max_output_tokens,
                "responseMimeType": "application/json",
            },
        }

    def generate_questions(self, exam_request: GeminiExamRequest) -> list[GeminiExamQuestion]:
        if not self.enabled:
            raise GeminiExamGenerationError("Gemini exam generation is disabled.")
        if not self.api_key.strip():
            raise GeminiExamGenerationError("Gemini exam generation is missing GEMINI_API_KEY.")

        payload = self.build_payload(exam_request)
        encoded_key = parse.quote(self.api_key, safe="")
        endpoint = f"{self.endpoint_base}/{self.model}:generateContent?key={encoded_key}"
        http_request = request.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with request.urlopen(http_request, timeout=self.timeout_seconds) as response:
                raw_response = response.read().decode("utf-8")
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise GeminiExamGenerationError(
                f"Gemini exam generation failed with HTTP {exc.code}: {detail or exc.reason}"
            ) from exc
        except error.URLError as exc:
            raise GeminiExamGenerationError(f"Gemini exam generation request failed: {exc.reason}") from exc

        try:
            parsed_response = json.loads(raw_response)
        except json.JSONDecodeError as exc:
            raise GeminiExamGenerationError("Gemini exam generation returned invalid JSON.") from exc

        response_text = self._extract_response_text(parsed_response)
        try:
            response_payload = json.loads(response_text)
        except json.JSONDecodeError as exc:
            raise GeminiExamGenerationError("Gemini exam generation response text was not valid JSON.") from exc

        return self._parse_questions(response_payload)

    def _extract_response_text(self, payload: dict[str, Any]) -> str:
        candidates = payload.get("candidates")
        if not isinstance(candidates, list) or not candidates:
            raise GeminiExamGenerationError("Gemini exam generation returned no candidates.")

        first_candidate = candidates[0]
        content = first_candidate.get("content")
        if not isinstance(content, dict):
            raise GeminiExamGenerationError("Gemini exam generation returned an invalid candidate payload.")

        parts = content.get("parts")
        if not isinstance(parts, list) or not parts:
            raise GeminiExamGenerationError("Gemini exam generation returned no content parts.")

        text = parts[0].get("text")
        if not isinstance(text, str) or not text.strip():
            raise GeminiExamGenerationError("Gemini exam generation returned empty content.")
        return text

    def _parse_questions(self, payload: dict[str, Any]) -> list[GeminiExamQuestion]:
        raw_questions = payload.get("questions")
        if not isinstance(raw_questions, list) or not raw_questions:
            raise GeminiExamGenerationError("Gemini exam generation returned no questions.")

        questions: list[GeminiExamQuestion] = []
        for raw_question in raw_questions:
            if not isinstance(raw_question, dict):
                raise GeminiExamGenerationError("Gemini exam generation returned an invalid question entry.")

            prompt = str(raw_question.get("prompt", "")).strip()
            instructions = str(raw_question.get("instructions", "")).strip()
            question_type = str(raw_question.get("question_type", "single_choice")).strip() or "single_choice"
            raw_options = raw_question.get("options")
            if not prompt:
                raise GeminiExamGenerationError("Gemini exam generation returned a question without a prompt.")
            if question_type != "single_choice":
                raise GeminiExamGenerationError("Gemini exam generation must return single_choice questions only.")
            if not isinstance(raw_options, list) or len(raw_options) != 4:
                raise GeminiExamGenerationError("Gemini exam generation must return exactly 4 options per question.")

            options: list[GeminiExamQuestionOption] = []
            correct_count = 0
            for raw_option in raw_options:
                if not isinstance(raw_option, dict):
                    raise GeminiExamGenerationError("Gemini exam generation returned an invalid option entry.")
                option_text = str(raw_option.get("option_text", "")).strip()
                is_correct = bool(raw_option.get("is_correct", False))
                if not option_text:
                    raise GeminiExamGenerationError("Gemini exam generation returned an option without text.")
                correct_count += 1 if is_correct else 0
                options.append(
                    GeminiExamQuestionOption(
                        option_text=option_text,
                        is_correct=is_correct,
                    )
                )

            if correct_count != 1:
                raise GeminiExamGenerationError("Gemini exam generation must return exactly one correct option.")

            questions.append(
                GeminiExamQuestion(
                    prompt=prompt,
                    instructions=instructions,
                    question_type=question_type,
                    options=tuple(options),
                )
            )

        return questions


def get_gemini_exam_generation_service() -> GeminiExamGenerationService:
    return GeminiExamGenerationService()
