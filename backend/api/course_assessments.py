import logging
import re

from django.conf import settings
from django.core.cache import cache
from django.db.models import Max

from users.models import (
    Course,
    CourseAssessment,
    CourseAssessmentAttempt,
    CourseAssessmentOption,
    CourseAssessmentQuestion,
    Lesson,
    User,
)

logger = logging.getLogger(__name__)

EXAM_SOURCE_TOTAL_CHAR_LIMIT = 2600
EXAM_SOURCE_DEFAULT_SECTION_LIMIT = 220
EXAM_SOURCE_SECTION_LIMITS = {
    "course": 320,
    "assessment": 220,
    "lesson-summary": 260,
    "lesson-content": 640,
    "lesson-transcript": 900,
}
FINAL_EXAM_SOURCE_TOTAL_CHAR_LIMIT = 4000
FINAL_EXAM_SOURCE_SECTION_LIMITS = {
    "course": 320,
    "assessment": 220,
    "lesson-summary": 140,
    "lesson-content": 220,
    "lesson-transcript": 260,
}
GENERATED_COURSE_ASSESSMENT_CACHE_TIMEOUT_SECONDS = 60 * 30
GENERATED_COURSE_ASSESSMENT_FAILURE_MIN_RETRY_SECONDS = 30


def active_course_assessment_questions(assessment: CourseAssessment) -> list[CourseAssessmentQuestion]:
    return list(
        CourseAssessmentQuestion.objects.filter(
            assessment=assessment,
            status=CourseAssessmentQuestion.Status.ACTIVE,
        )
        .prefetch_related("options")
        .order_by("sequence_number", "id")
    )


def serialize_student_course_assessment_option(option: CourseAssessmentOption) -> dict:
    return {
        "option_id": option.id,
        "option_text": option.option_text,
        "sequence_number": option.sequence_number,
    }


def serialize_student_course_assessment_question(question: CourseAssessmentQuestion) -> dict:
    options = list(
        question.options.filter(status=CourseAssessmentOption.Status.ACTIVE).order_by("sequence_number", "id")
    )
    return {
        "question_id": question.id,
        "prompt": question.prompt,
        "instructions": question.instructions,
        "question_type": question.question_type,
        "sequence_number": question.sequence_number,
        "points": question.points,
        "options": [serialize_student_course_assessment_option(option) for option in options],
    }


def generated_course_assessment_cache_key(*, assessment: CourseAssessment, user: User) -> str:
    return f"generated-course-assessment:{assessment.id}:{user.role}:{user.id}"


def normalize_exam_source_text(text: str, max_chars: int) -> str:
    normalized = " ".join(text.split()).strip()
    if not normalized or max_chars <= 0:
        return ""

    sentence_candidates = re.split(r"(?<=[.!?])\s+", normalized)
    filtered_sentences: list[str] = []
    seen = set()

    for sentence in sentence_candidates:
        candidate = sentence.strip()
        if not candidate:
            continue
        key = candidate.lower()
        if key in seen:
            continue
        seen.add(key)
        filtered_sentences.append(candidate)

    if not filtered_sentences:
        filtered_sentences = [normalized]

    result_parts: list[str] = []
    current_length = 0
    for sentence in filtered_sentences:
        sentence_length = len(sentence)
        separator_length = 1 if result_parts else 0
        if current_length + separator_length + sentence_length > max_chars:
            remaining = max_chars - current_length - separator_length
            if remaining > 24:
                result_parts.append(sentence[: remaining - 1].rstrip() + "…")
            break
        result_parts.append(sentence)
        current_length += separator_length + sentence_length

    return " ".join(result_parts).strip()


def append_exam_source_section(
    parts: list[str],
    label: str,
    text: str,
    section_key: str,
    *,
    section_limits: dict[str, int] | None = None,
) -> None:
    resolved_section_limits = section_limits or EXAM_SOURCE_SECTION_LIMITS
    section_limit = resolved_section_limits.get(section_key, EXAM_SOURCE_DEFAULT_SECTION_LIMIT)
    normalized_text = normalize_exam_source_text(text, section_limit)
    if normalized_text:
        parts.append(f"{label}: {normalized_text}")


def active_course_lessons(course: Course) -> list[Lesson]:
    return list(
        Lesson.objects.filter(course=course, status=Lesson.Status.ACTIVE)
        .select_related("course")
        .order_by("sequence_number", "id")
    )


def company_preview_course_lessons(course: Course) -> list[Lesson]:
    return list(
        Lesson.objects.filter(course=course)
        .exclude(status=Lesson.Status.INACTIVE)
        .select_related("course")
        .order_by("sequence_number", "id")
    )


def build_course_assessment_generation_source(assessment: CourseAssessment) -> str:
    filtered_parts: list[str] = []

    append_exam_source_section(
        filtered_parts,
        "Course",
        "\n\n".join([assessment.course.title.strip(), assessment.course.description.strip()]),
        "course",
    )
    append_exam_source_section(
        filtered_parts,
        "Assessment",
        "\n\n".join([assessment.title.strip(), assessment.description.strip()]),
        "assessment",
    )

    if assessment.kind == CourseAssessment.Kind.FINAL:
        lessons = active_course_lessons(assessment.course)

        for lesson_index, lesson in enumerate(lessons, start=1):
            append_exam_source_section(
                filtered_parts,
                f"Lesson {lesson_index} title",
                lesson.title,
                "lesson-summary",
                section_limits=FINAL_EXAM_SOURCE_SECTION_LIMITS,
            )
            append_exam_source_section(
                filtered_parts,
                f"Lesson {lesson_index} summary",
                lesson.summary,
                "lesson-summary",
                section_limits=FINAL_EXAM_SOURCE_SECTION_LIMITS,
            )
        for lesson_index, lesson in enumerate(lessons, start=1):
            append_exam_source_section(
                filtered_parts,
                f"Lesson {lesson_index} content",
                lesson.content,
                "lesson-content",
                section_limits=FINAL_EXAM_SOURCE_SECTION_LIMITS,
            )
        for lesson_index, lesson in enumerate(lessons, start=1):
            append_exam_source_section(
                filtered_parts,
                f"Lesson {lesson_index} transcript",
                lesson.transcript,
                "lesson-transcript",
                section_limits=FINAL_EXAM_SOURCE_SECTION_LIMITS,
            )

        combined_source = "\n\n".join(part for part in filtered_parts if part)
        return normalize_exam_source_text(combined_source, FINAL_EXAM_SOURCE_TOTAL_CHAR_LIMIT)

    lesson: Lesson | None = None
    if assessment.lesson_id is not None:
        lesson = assessment.lesson
        if lesson is None:
            lesson = Lesson.objects.filter(
                id=assessment.lesson_id,
                course=assessment.course,
                status=Lesson.Status.ACTIVE,
            ).first()
    lessons = [lesson] if lesson is not None else []
    for lesson in lessons:
        append_exam_source_section(filtered_parts, "Lesson title", lesson.title, "lesson-summary")
        append_exam_source_section(filtered_parts, "Lesson summary", lesson.summary, "lesson-summary")
        append_exam_source_section(filtered_parts, "Lesson content", lesson.content, "lesson-content")
        append_exam_source_section(filtered_parts, "Lesson transcript", lesson.transcript, "lesson-transcript")

    combined_source = "\n\n".join(part for part in filtered_parts if part)
    return normalize_exam_source_text(combined_source, EXAM_SOURCE_TOTAL_CHAR_LIMIT)


def course_assessment_generation_question_count(assessment: CourseAssessment) -> int:
    if assessment.kind == CourseAssessment.Kind.FINAL:
        return settings.GEMINI_EXAM_FINAL_QUESTION_COUNT
    return settings.GEMINI_EXAM_DEFAULT_QUESTION_COUNT


def build_generated_course_assessment_questions(
    assessment: CourseAssessment,
    generated_questions,
) -> list[dict]:
    payload: list[dict] = []
    for question_index, question in enumerate(generated_questions, start=1):
        question_id = -((assessment.id * 100) + question_index)
        options = []
        for option_index, option in enumerate(question.options, start=1):
            options.append(
                {
                    "option_id": -((assessment.id * 1000) + (question_index * 10) + option_index),
                    "option_text": option.option_text,
                    "sequence_number": option_index,
                    "is_correct": option.is_correct,
                }
            )
        payload.append(
            {
                "question_id": question_id,
                "prompt": question.prompt,
                "instructions": question.instructions,
                "question_type": question.question_type,
                "sequence_number": question_index,
                "points": 1,
                "options": options,
            }
        )
    return payload


def serialize_generated_course_assessment_question(question: dict) -> dict:
    return {
        "question_id": question["question_id"],
        "prompt": question["prompt"],
        "instructions": question["instructions"],
        "question_type": question["question_type"],
        "sequence_number": question["sequence_number"],
        "points": question["points"],
        "options": [
            {
                "option_id": option["option_id"],
                "option_text": option["option_text"],
                "sequence_number": option["sequence_number"],
            }
            for option in question["options"]
        ],
    }


def get_cached_generated_course_assessment_questions(
    assessment: CourseAssessment,
    *,
    user: User,
) -> list[dict]:
    cached = cache.get(generated_course_assessment_cache_key(assessment=assessment, user=user))
    if not isinstance(cached, list):
        return []
    return cached


def generated_course_assessment_failure_cache_key(*, assessment: CourseAssessment, user: User) -> str:
    return f"generated-course-assessment-failure:{assessment.id}:{user.role}:{user.id}"


def get_cached_generated_course_assessment_failure(
    assessment: CourseAssessment,
    *,
    user: User,
) -> dict | None:
    cached = cache.get(generated_course_assessment_failure_cache_key(assessment=assessment, user=user))
    if not isinstance(cached, dict):
        return None
    return cached


def clear_cached_generated_course_assessment_failure(
    assessment: CourseAssessment,
    *,
    user: User,
) -> None:
    cache.delete(generated_course_assessment_failure_cache_key(assessment=assessment, user=user))


def parse_gemini_retry_seconds(message: str) -> int:
    retry_match = re.search(r'retryDelay":\s*"(?P<seconds>\d+)s"', message)
    if retry_match is not None:
        return max(int(retry_match.group("seconds")), GENERATED_COURSE_ASSESSMENT_FAILURE_MIN_RETRY_SECONDS)

    fallback_match = re.search(r"Please retry in (?P<seconds>\d+)", message)
    if fallback_match is not None:
        return max(int(fallback_match.group("seconds")), GENERATED_COURSE_ASSESSMENT_FAILURE_MIN_RETRY_SECONDS)

    return GENERATED_COURSE_ASSESSMENT_FAILURE_MIN_RETRY_SECONDS


def course_assessment_unavailable_message(
    assessment: CourseAssessment,
    *,
    user: User,
) -> str:
    failure = get_cached_generated_course_assessment_failure(assessment, user=user)
    if failure is None:
        return "No exam questions are available for this assessment right now."

    error_message = str(failure.get("message", ""))
    if "quota exceeded" in error_message.lower() or "resource_exhausted" in error_message.lower():
        return "Gemini quota is currently exhausted for this assessment. Try again later."
    return "Gemini exam generation is temporarily unavailable for this assessment. Try again later."


def clear_cached_generated_course_assessment_questions(
    assessment: CourseAssessment,
    *,
    user: User,
) -> None:
    cache.delete(generated_course_assessment_cache_key(assessment=assessment, user=user))


def resolve_course_assessment_questions(
    assessment: CourseAssessment,
    *,
    user: User,
    audience_label: str,
) -> tuple[list, bool]:
    stored_questions = active_course_assessment_questions(assessment)

    from services.gemini import (
        GeminiExamGenerationError,
        GeminiExamRequest,
        get_gemini_exam_generation_service,
    )

    service = get_gemini_exam_generation_service()
    if not service.is_available():
        return stored_questions, False

    cached_generated_questions = get_cached_generated_course_assessment_questions(
        assessment,
        user=user,
    )
    if cached_generated_questions:
        return cached_generated_questions, True

    cached_failure = get_cached_generated_course_assessment_failure(assessment, user=user)
    if cached_failure is not None:
        return stored_questions, False

    source_text = build_course_assessment_generation_source(assessment)
    if not source_text.strip():
        return stored_questions, False

    try:
        generated_questions = service.generate_questions(
            GeminiExamRequest(
                course_title=assessment.course.title,
                assessment_title=assessment.title,
                source_text=source_text,
                difficulty_level=assessment.course.difficulty_level,
                question_count=course_assessment_generation_question_count(assessment),
                audience_label=audience_label,
            )
        )
    except GeminiExamGenerationError as exc:
        logger.warning(
            "Gemini course assessment generation failed for assessment %s and user %s: %s",
            assessment.id,
            user.id,
            exc,
        )
        cache.set(
            generated_course_assessment_failure_cache_key(assessment=assessment, user=user),
            {"message": str(exc)},
            parse_gemini_retry_seconds(str(exc)),
        )
        return stored_questions, False

    cached_payload = build_generated_course_assessment_questions(assessment, generated_questions)
    if cached_payload:
        clear_cached_generated_course_assessment_failure(assessment, user=user)
        cache.set(
            generated_course_assessment_cache_key(assessment=assessment, user=user),
            cached_payload,
            GENERATED_COURSE_ASSESSMENT_CACHE_TIMEOUT_SECONDS,
        )
        return cached_payload, True
    return stored_questions, False


def latest_course_assessment_attempt(student: User, assessment: CourseAssessment) -> CourseAssessmentAttempt | None:
    return (
        CourseAssessmentAttempt.objects.filter(student=student, assessment=assessment)
        .order_by("-attempt_number", "-id")
        .first()
    )


def next_course_assessment_attempt_number(student: User, assessment: CourseAssessment) -> int:
    latest_attempt = (
        CourseAssessmentAttempt.objects.filter(student=student, assessment=assessment)
        .order_by("-attempt_number")
        .values_list("attempt_number", flat=True)
        .first()
    )
    return (latest_attempt or 0) + 1


def build_default_course_assessment_description(*, title: str, is_final: bool) -> str:
    if is_final:
        return f"Final course check for {title}. Pass with 90% or higher to complete the course."
    return f"Check understanding for {title}. Score 90% or higher to unlock the next lesson."


def build_default_course_assessment_question_specs(
    assessment: CourseAssessment,
    *,
    lessons: list[Lesson],
) -> list[dict]:
    if assessment.kind == CourseAssessment.Kind.LESSON and assessment.lesson is not None:
        correct_option = assessment.lesson.title.strip() or f"Lesson {assessment.lesson.sequence_number}"
        return [
            {
                "prompt": f"Which lesson are you reviewing in the exam for '{correct_option}'?",
                "instructions": "Choose the best answer based on the lesson or course you just reviewed.",
                "correct_option": correct_option,
                "option_candidates": [
                    correct_option,
                    assessment.course.title.strip(),
                    "The final course review",
                    "An unrelated platform workflow",
                ],
            }
        ]

    course_title = assessment.course.title.strip() or "This course"
    lesson_titles = [lesson.title.strip() or f"Lesson {lesson.sequence_number}" for lesson in lessons]
    fallback_lesson_titles = lesson_titles or ["Core concepts", "Practical exercises"]
    unrelated_courses = [
        "A different company training course",
        "A mock interview preparation path",
        "A backend onboarding workshop",
        "A data science bootcamp",
    ]
    question_specs: list[dict] = []
    target_count = settings.GEMINI_EXAM_FINAL_QUESTION_COUNT
    for index in range(target_count):
        lesson_title = fallback_lesson_titles[index % len(fallback_lesson_titles)]
        secondary_lesson = fallback_lesson_titles[(index + 1) % len(fallback_lesson_titles)]
        question_type = index % 3
        if question_type == 0:
            question_specs.append(
                {
                    "prompt": f"Which course includes the lesson '{lesson_title}'?",
                    "instructions": "Choose the best answer based on the lesson or course you just reviewed.",
                    "correct_option": course_title,
                    "option_candidates": [
                        course_title,
                        lesson_title,
                        unrelated_courses[index % len(unrelated_courses)],
                        unrelated_courses[(index + 1) % len(unrelated_courses)],
                    ],
                }
            )
            continue
        if question_type == 1:
            question_specs.append(
                {
                    "prompt": f"Which lesson topic is covered in this final exam set {index + 1}?",
                    "instructions": "Choose the best answer based on the lesson or course you just reviewed.",
                    "correct_option": lesson_title,
                    "option_candidates": [
                        lesson_title,
                        secondary_lesson,
                        "Interview scheduling practice",
                        "Resume formatting workshop",
                    ],
                }
            )
            continue
        question_specs.append(
            {
                "prompt": f"The final exam reviews which course in question {index + 1}?",
                "instructions": "Choose the best answer based on the lesson or course you just reviewed.",
                "correct_option": course_title,
                "option_candidates": [
                    course_title,
                    secondary_lesson,
                    "An unrelated lesson",
                    unrelated_courses[(index + 2) % len(unrelated_courses)],
                ],
            }
        )
    return question_specs


def ensure_default_course_assessment_questions(
    assessment: CourseAssessment,
    *,
    lessons: list[Lesson],
) -> None:
    question_specs = build_default_course_assessment_question_specs(assessment, lessons=lessons)
    existing_question_count = CourseAssessmentQuestion.objects.filter(assessment=assessment).count()
    if existing_question_count >= len(question_specs):
        return
    for sequence_number, question_spec in enumerate(question_specs[existing_question_count:], start=existing_question_count + 1):
        unique_options: list[str] = []
        seen_options: set[str] = set()
        for option_text in question_spec["option_candidates"]:
            normalized = str(option_text).strip()
            if not normalized:
                continue
            key = normalized.lower()
            if key in seen_options:
                continue
            seen_options.add(key)
            unique_options.append(normalized)
            if len(unique_options) == 4:
                break

        if question_spec["correct_option"] not in unique_options:
            unique_options = [question_spec["correct_option"], *[option for option in unique_options if option != question_spec["correct_option"]]]
        while len(unique_options) < 4:
            filler = f"Unrelated option {len(unique_options) + 1}"
            if filler.lower() in seen_options:
                continue
            seen_options.add(filler.lower())
            unique_options.append(filler)

        question = CourseAssessmentQuestion(
            assessment=assessment,
            prompt=question_spec["prompt"],
            instructions=question_spec["instructions"],
            question_type=CourseAssessmentQuestion.QuestionType.SINGLE_CHOICE,
            sequence_number=sequence_number,
            points=1,
            status=CourseAssessmentQuestion.Status.ACTIVE,
        )
        question.full_clean()
        question.save()

        for option_sequence_number, option_text in enumerate(unique_options, start=1):
            option = CourseAssessmentOption(
                question=question,
                option_text=option_text,
                sequence_number=option_sequence_number,
                is_correct=option_text == question_spec["correct_option"],
                status=CourseAssessmentOption.Status.ACTIVE,
            )
            option.full_clean()
            option.save()


def build_course_assessment_map(course: Course) -> tuple[dict[int, CourseAssessment], CourseAssessment | None]:
    assessments = list(
        CourseAssessment.objects.filter(course=course, status=CourseAssessment.Status.ACTIVE)
        .select_related("lesson")
        .order_by("kind", "lesson__sequence_number", "id")
    )
    by_lesson_id = {
        assessment.lesson_id: assessment
        for assessment in assessments
        if assessment.kind == CourseAssessment.Kind.LESSON and assessment.lesson_id is not None
    }
    final_assessment = next(
        (assessment for assessment in assessments if assessment.kind == CourseAssessment.Kind.FINAL),
        None,
    )
    lessons = active_course_lessons(course)
    for assessment in [*by_lesson_id.values(), final_assessment]:
        if assessment is not None:
            ensure_default_course_assessment_questions(assessment, lessons=lessons)
    return by_lesson_id, final_assessment


def ensure_company_preview_course_assessment_map(
    course: Course,
    *,
    lessons: list[Lesson],
) -> tuple[dict[int, CourseAssessment], CourseAssessment | None]:
    assessments = list(
        CourseAssessment.objects.filter(course=course)
        .select_related("lesson")
        .order_by("kind", "lesson__sequence_number", "id")
    )
    by_lesson_id = {
        assessment.lesson_id: assessment
        for assessment in assessments
        if assessment.kind == CourseAssessment.Kind.LESSON and assessment.lesson_id is not None
    }
    final_assessment = next(
        (assessment for assessment in assessments if assessment.kind == CourseAssessment.Kind.FINAL),
        None,
    )

    for assessment in [*by_lesson_id.values(), final_assessment]:
        if assessment is not None and assessment.status == CourseAssessment.Status.INACTIVE:
            assessment.status = CourseAssessment.Status.ACTIVE
            assessment.full_clean()
            assessment.save(update_fields=["status", "updated_at"])
        if assessment is not None:
            if (
                assessment.kind == CourseAssessment.Kind.FINAL
                and CourseAssessmentQuestion.objects.filter(assessment=assessment).exists()
            ):
                continue
            ensure_default_course_assessment_questions(assessment, lessons=lessons)

    for lesson in lessons:
        if lesson.id in by_lesson_id:
            continue

        assessment = CourseAssessment(
            course=course,
            lesson=lesson,
            title=f"{lesson.title} lesson exam",
            description=build_default_course_assessment_description(title=lesson.title, is_final=False),
            kind=CourseAssessment.Kind.LESSON,
            passing_score_percent=90,
            status=CourseAssessment.Status.ACTIVE,
        )
        assessment.full_clean()
        assessment.save()
        ensure_default_course_assessment_questions(assessment, lessons=lessons)
        by_lesson_id[lesson.id] = assessment

    if final_assessment is None:
        final_assessment = CourseAssessment(
            course=course,
            title=f"{course.title} final exam",
            description=build_default_course_assessment_description(title=course.title, is_final=True),
            kind=CourseAssessment.Kind.FINAL,
            passing_score_percent=90,
            status=CourseAssessment.Status.ACTIVE,
        )
        final_assessment.full_clean()
        final_assessment.save()
        ensure_default_course_assessment_questions(final_assessment, lessons=lessons)

    return by_lesson_id, final_assessment


def serialize_company_preview_assessment_detail(assessment: CourseAssessment, *, user: User) -> dict:
    questions, is_generated = resolve_course_assessment_questions(
        assessment,
        user=user,
        audience_label="company reviewer",
    )
    return {
        "assessment_id": assessment.id,
        "title": assessment.title,
        "description": assessment.description,
        "kind": assessment.kind,
        "passing_score_percent": assessment.passing_score_percent,
        "attempt_count": 0,
        "next_attempt_number": 1,
        "latest_score": None,
        "passed": False,
        "questions": [
            serialize_generated_course_assessment_question(question)
            if is_generated
            else serialize_student_course_assessment_question(question)
            for question in questions
        ],
    }


def serialize_course_assessment_summary(
    assessment: CourseAssessment | None,
    *,
    student: User,
    unlocked: bool,
) -> dict | None:
    if assessment is None:
        return None

    latest_attempt = latest_course_assessment_attempt(student, assessment)
    score_summary = CourseAssessmentAttempt.objects.filter(student=student, assessment=assessment).aggregate(best=Max("score_percent"))
    return {
        "assessment_id": assessment.id,
        "title": assessment.title,
        "description": assessment.description,
        "kind": assessment.kind,
        "passing_score_percent": assessment.passing_score_percent,
        "question_count": CourseAssessmentQuestion.objects.filter(
            assessment=assessment,
            status=CourseAssessmentQuestion.Status.ACTIVE,
        ).count(),
        "is_unlocked": unlocked,
        "attempt_count": CourseAssessmentAttempt.objects.filter(student=student, assessment=assessment).count(),
        "best_score": score_summary["best"],
        "latest_score": latest_attempt.score_percent if latest_attempt is not None else None,
        "passed": latest_attempt.passed if latest_attempt is not None else False,
    }


def serialize_course_assessment_detail(assessment: CourseAssessment, *, student: User) -> dict:
    latest_attempt = latest_course_assessment_attempt(student, assessment)
    questions, is_generated = resolve_course_assessment_questions(
        assessment,
        user=student,
        audience_label="student learner",
    )
    return {
        "assessment_id": assessment.id,
        "title": assessment.title,
        "description": assessment.description,
        "kind": assessment.kind,
        "passing_score_percent": assessment.passing_score_percent,
        "attempt_count": CourseAssessmentAttempt.objects.filter(student=student, assessment=assessment).count(),
        "next_attempt_number": next_course_assessment_attempt_number(student, assessment),
        "latest_score": latest_attempt.score_percent if latest_attempt is not None else None,
        "passed": latest_attempt.passed if latest_attempt is not None else False,
        "questions": [
            serialize_generated_course_assessment_question(question)
            if is_generated
            else serialize_student_course_assessment_question(question)
            for question in questions
        ],
    }
