# This module is extracted from api.views to keep route handlers grouped by domain.
from api.views import *  # noqa: F401,F403


@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_dashboard_view(request):
    profile = serialize_student_profile(request.user)
    skills = serialize_student_skills(request.user)
    learning = serialize_learning_summary(request.user)
    exams = serialize_exam_results_summary(request.user)
    learning_records = list(
        LearningRecord.objects.filter(student=request.user)
        .select_related("course")
        .order_by("created_at", "id")
    )
    current_learning = (
        LearningRecord.objects.filter(student=request.user, status=LearningRecord.Status.IN_PROGRESS)
        .select_related("course")
        .order_by("-updated_at", "-id")
        .first()
    )
    if current_learning is None:
        current_learning = (
            LearningRecord.objects.filter(student=request.user, status=LearningRecord.Status.NOT_STARTED)
            .select_related("course")
            .order_by("created_at", "id")
            .first()
        )
    if current_learning is None:
        current_learning = (
            LearningRecord.objects.filter(student=request.user, status=LearningRecord.Status.COMPLETED)
            .select_related("course")
            .order_by("-completed_at", "-id")
            .first()
        )

    completed_courses = learning["completed_courses"]
    passed_results = exams["passed_results"]
    skill_count = skills["skill_count"]

    if current_learning is None:
        continue_learning = {
            "roadmap_title": "Learning roadmap",
            "topic_title": "Start your first topic",
            "progress_percent": 0,
            "status": "not_started",
            "cta_label": "Start learning",
            "cta_href": "/student/learning",
        }
        next_action = {
            "action_type": "start_learning",
            "title": "Start your first roadmap topic",
            "description": "Begin learning so you can unlock topic validation and build your hiring-ready skill profile.",
            "cta_label": "Start learning",
            "cta_href": "/student/learning",
            "requirement": None,
        }
    elif current_learning.status != LearningRecord.Status.COMPLETED:
        continue_learning = {
            "roadmap_title": roadmap_title_for_record(current_learning),
            "topic_title": learning_record_title(current_learning),
            "progress_percent": current_learning.progress_percent,
            "status": roadmap_state_for_learning_record(current_learning),
            "cta_label": "Continue learning" if current_learning.status == LearningRecord.Status.IN_PROGRESS else "Start topic",
            "cta_href": get_learning_record_resume_href(current_learning),
        }
        next_action = {
            "action_type": "complete_topic" if current_learning.status == LearningRecord.Status.IN_PROGRESS else "start_topic",
            "title": "Complete your current topic" if current_learning.status == LearningRecord.Status.IN_PROGRESS else "Start your next topic",
            "description": f"Finish {learning_record_title(current_learning)} to stay on track in your roadmap.",
            "cta_label": "Continue learning" if current_learning.status == LearningRecord.Status.IN_PROGRESS else "Start topic",
            "cta_href": get_learning_record_resume_href(current_learning),
            "requirement": None,
        }
    elif completed_courses > passed_results:
        continue_learning = {
            "roadmap_title": roadmap_title_for_record(current_learning),
            "topic_title": learning_record_title(current_learning),
            "progress_percent": 100,
            "status": "completed",
            "cta_label": "Review topic",
            "cta_href": "/student/learning",
        }
        next_action = {
            "action_type": "take_exam",
            "title": "Take the validation exam",
            "description": f"You completed {learning_record_title(current_learning)}. Pass the exam to unlock the next topic in the roadmap.",
            "cta_label": "Take exam",
            "cta_href": "/student/exams",
            "requirement": "90% required to unlock the next topic",
        }
    else:
        continue_learning = {
            "roadmap_title": roadmap_title_for_record(current_learning),
            "topic_title": learning_record_title(current_learning),
            "progress_percent": 100,
            "status": "completed",
            "cta_label": "Continue roadmap",
            "cta_href": get_learning_record_resume_href(current_learning),
        }
        next_action = {
            "action_type": "continue_roadmap",
            "title": "Move to the next roadmap topic",
            "description": "Your latest topic has been validated. Keep building momentum with the next learning step.",
            "cta_label": "Continue learning",
            "cta_href": get_learning_record_resume_href(current_learning),
            "requirement": None,
        }

    return success_response(
        {
            "student_id": request.user.id,
            "student_name": request.user.full_name,
            "header_message": "Continue your roadmap and unlock your next skill.",
            "continue_learning": continue_learning,
            "current_lesson": serialize_current_learning_lesson(current_learning),
            "next_action": next_action,
            "progress_overview": {
                "completed_topics": completed_courses,
                "exam_average": exams["average_score"],
                "current_level": derive_student_level(
                    completed_topics=completed_courses,
                    skill_count=skill_count,
                    exam_average=exams["average_score"],
                ),
            },
            "roadmap_preview": {
                "nodes": build_student_dashboard_roadmap_nodes(
                    learning_records=learning_records,
                    completed_courses=completed_courses,
                    passed_results=passed_results,
                    skill_count=skill_count,
                    profile_complete=profile["profile_complete"],
                )
            },
        }
    )

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_course_detail_view(request, course_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course is not available.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is not None:
        learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    learning_record_count = course.learning_records.count()
    lesson_progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    next_step_label = "Enroll to start" if learning_record is None else "Continue learning"
    if learning_record is not None and learning_record.status == LearningRecord.Status.COMPLETED:
        next_step_label = "Review course"

    return success_response(
        serialize_student_course_detail(
            course,
            current_user=request.user,
            learning_record=learning_record,
            learning_record_count=learning_record_count,
            lessons=lessons,
            lesson_progress_map=lesson_progress_map,
            next_step_label=next_step_label,
            next_step_href=get_learning_record_resume_href(learning_record) if learning_record is not None else None,
        )
    )

@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_course_review_view(request, course_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course is not available.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is None:
        return error_response(
            request,
            "FORBIDDEN",
            "You must enroll in this course before leaving a review.",
            details={"course_id": [str(course_id)]},
            status=403,
        )

    payload = validate_student_course_review_payload(parse_json_body(request))
    review = CourseReview.objects.filter(course=course, student=request.user).first()
    created = review is None
    if review is None:
        review = CourseReview(course=course, student=request.user)

    review.rating = payload["rating"]
    review.review_text = payload["review_text"]
    review.full_clean()
    review.save()

    review_summary = course_review_summary_map([course.id]).get(course.id, {"average_rating": None, "rating_count": 0})
    return success_response(
        {
            "message": "Your course review was saved.",
            "review": serialize_course_review(review, current_user=request.user),
            "average_rating": review_summary["average_rating"],
            "rating_count": review_summary["rating_count"],
        },
        status=201 if created else 200,
    )

@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_course_enrollment_view(request, course_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course is not available.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    learning_record, created = ensure_learning_record_for_course(request.user, course)
    learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    lesson_progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    completed_lesson_count = sum(
        1 for progress in lesson_progress_map.values() if progress.status == LessonProgress.Status.COMPLETED
    )

    return success_response(
        {
            "course_id": course.id,
            "created": created,
            "enrollment": serialize_student_course_enrollment(
                learning_record,
                lesson_count=len(lessons),
                completed_lesson_count=completed_lesson_count,
            ),
            "next_step_href": get_learning_record_resume_href(learning_record),
            "next_step_label": "Start first lesson" if learning_record.status == LearningRecord.Status.NOT_STARTED else "Continue learning",
        },
        status=201 if created else 200,
    )

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_lesson_detail_view(request, course_id: int, lesson_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course is not available.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is None:
        return error_response(
            request,
            "FORBIDDEN",
            "You must enroll in this course before viewing lessons.",
            details={"course_id": [str(course_id)]},
            status=403,
        )

    learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    lesson = next((item for item in lessons if item.id == lesson_id), None)
    if lesson is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested lesson is not available.",
            details={"lesson_id": [str(lesson_id)]},
            status=404,
        )

    progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    assessment_by_lesson_id, final_assessment = build_course_assessment_map(course)
    latest_attempts_by_assessment_id = latest_course_assessment_attempts_by_assessment_id(
        student=request.user,
        course=course,
    )
    if not lesson_is_unlocked_for_student(
        lesson,
        lessons=lessons,
        progress_map=progress_map,
        assessment_by_lesson_id=assessment_by_lesson_id,
        latest_attempts_by_assessment_id=latest_attempts_by_assessment_id,
    ):
        return error_response(
            request,
            "FORBIDDEN",
            "Complete the previous lesson exam with 90 percent or higher to unlock this lesson.",
            details={"lesson_id": [str(lesson_id)]},
            status=403,
        )
    progress = progress_map.get(lesson.id)
    if progress is None:
        raise ValidationError({"lesson": ["Lesson progress is not available for this lesson."]})

    lesson_index = lessons.index(lesson)
    previous_lesson = lessons[lesson_index - 1] if lesson_index > 0 else None
    next_lesson = lessons[lesson_index + 1] if lesson_index < len(lessons) - 1 else None
    next_lesson_href = None
    if next_lesson is not None and lesson_is_unlocked_for_student(
        next_lesson,
        lessons=lessons,
        progress_map=progress_map,
        assessment_by_lesson_id=assessment_by_lesson_id,
        latest_attempts_by_assessment_id=latest_attempts_by_assessment_id,
    ):
        next_lesson_href = student_lesson_href(next_lesson.course_id, next_lesson.id)
    return success_response(
        serialize_student_lesson_detail(
            lesson,
            progress=progress,
            total_lessons=len(lessons),
            previous_lesson=previous_lesson,
            next_lesson_href=next_lesson_href,
            lesson_exam=serialize_course_assessment_summary(
                assessment_by_lesson_id.get(lesson.id),
                student=request.user,
                unlocked=lesson_assessment_unlocked(lesson, progress_map=progress_map),
            ),
            final_exam=serialize_course_assessment_summary(
                final_assessment,
                student=request.user,
                unlocked=final_course_assessment_unlocked(
                    lessons=lessons,
                    progress_map=progress_map,
                    assessment_by_lesson_id=assessment_by_lesson_id,
                    latest_attempts_by_assessment_id=latest_attempts_by_assessment_id,
                ),
            )
            if lesson_index == len(lessons) - 1
            else None,
        )
    )

@api_endpoint(["PUT"], authentication_required=True, roles=[User.Role.STUDENT])
def student_lesson_progress_view(request, course_id: int, lesson_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested course is not available.",
            details={"course_id": [str(course_id)]},
            status=404,
        )

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is None:
        return error_response(
            request,
            "FORBIDDEN",
            "You must enroll in this course before updating lesson progress.",
            details={"course_id": [str(course_id)]},
            status=403,
        )

    payload = validate_student_lesson_progress_payload(parse_json_body(request))
    learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    lesson = next((item for item in lessons if item.id == lesson_id), None)
    if lesson is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested lesson is not available.",
            details={"lesson_id": [str(lesson_id)]},
            status=404,
        )

    progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    assessment_by_lesson_id, final_assessment = build_course_assessment_map(course)
    latest_attempts_by_assessment_id = latest_course_assessment_attempts_by_assessment_id(
        student=request.user,
        course=course,
    )
    if not lesson_is_unlocked_for_student(
        lesson,
        lessons=lessons,
        progress_map=progress_map,
        assessment_by_lesson_id=assessment_by_lesson_id,
        latest_attempts_by_assessment_id=latest_attempts_by_assessment_id,
    ):
        return error_response(
            request,
            "FORBIDDEN",
            "Complete the previous lesson exam with 90 percent or higher to unlock this lesson.",
            details={"lesson_id": [str(lesson_id)]},
            status=403,
        )
    progress = progress_map.get(lesson.id)
    if progress is None:
        raise ValidationError({"lesson": ["Lesson progress is not available for this lesson."]})

    now = timezone.now()
    update_fields: list[str] = []
    if payload["status"] == LessonProgress.Status.IN_PROGRESS:
        if progress.status == LessonProgress.Status.COMPLETED:
            raise ValidationError({"status": ["Completed lessons cannot move back to in progress."]})
        if progress.status != LessonProgress.Status.IN_PROGRESS:
            progress.status = LessonProgress.Status.IN_PROGRESS
            progress.started_at = progress.started_at or now
            progress.completed_at = None
            update_fields.extend(["status", "started_at", "completed_at"])
    else:
        progress.status = LessonProgress.Status.COMPLETED
        progress.started_at = progress.started_at or now
        progress.completed_at = now
        update_fields.extend(["status", "started_at", "completed_at"])

    if update_fields:
        progress.full_clean()
        progress.save(update_fields=[*update_fields, "updated_at"])

    learning_record = sync_learning_record_progress(learning_record)
    progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    progress = progress_map[lesson.id]
    latest_attempts_by_assessment_id = latest_course_assessment_attempts_by_assessment_id(
        student=request.user,
        course=course,
    )
    lesson_index = lessons.index(lesson)
    previous_lesson = lessons[lesson_index - 1] if lesson_index > 0 else None
    next_lesson = lessons[lesson_index + 1] if lesson_index < len(lessons) - 1 else None
    next_lesson_href = None
    if next_lesson is not None and lesson_is_unlocked_for_student(
        next_lesson,
        lessons=lessons,
        progress_map=progress_map,
        assessment_by_lesson_id=assessment_by_lesson_id,
        latest_attempts_by_assessment_id=latest_attempts_by_assessment_id,
    ):
        next_lesson_href = student_lesson_href(next_lesson.course_id, next_lesson.id)

    return success_response(
        {
            "message": "Lesson marked complete."
            if payload["status"] == LessonProgress.Status.COMPLETED
            else "Lesson started.",
            "lesson": serialize_student_lesson_detail(
                lesson,
                progress=progress,
                total_lessons=len(lessons),
                previous_lesson=previous_lesson,
                next_lesson_href=next_lesson_href,
                lesson_exam=serialize_course_assessment_summary(
                    assessment_by_lesson_id.get(lesson.id),
                    student=request.user,
                    unlocked=lesson_assessment_unlocked(lesson, progress_map=progress_map),
                ),
                final_exam=serialize_course_assessment_summary(
                    final_assessment,
                    student=request.user,
                    unlocked=final_course_assessment_unlocked(
                        lessons=lessons,
                        progress_map=progress_map,
                        assessment_by_lesson_id=assessment_by_lesson_id,
                        latest_attempts_by_assessment_id=latest_attempts_by_assessment_id,
                    ),
                )
                if lesson_index == len(lessons) - 1
                else None,
            ),
            "enrollment": serialize_student_course_enrollment(
                learning_record,
                lesson_count=len(lessons),
                completed_lesson_count=sum(
                    1 for item in progress_map.values() if item.status == LessonProgress.Status.COMPLETED
                ),
            ),
            "next_step_href": get_learning_record_resume_href(learning_record),
        }
    )

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_lesson_assessment_detail_view(request, course_id: int, lesson_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course is not available.", details={"course_id": [str(course_id)]}, status=404)

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is None:
        return error_response(request, "FORBIDDEN", "You must enroll in this course before taking lesson exams.", details={"course_id": [str(course_id)]}, status=403)

    learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    lesson = next((item for item in lessons if item.id == lesson_id), None)
    if lesson is None:
        return error_response(request, "NOT_FOUND", "The requested lesson is not available.", details={"lesson_id": [str(lesson_id)]}, status=404)

    progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    assessment_by_lesson_id, _ = build_course_assessment_map(course)
    assessment = assessment_by_lesson_id.get(lesson.id)
    if assessment is None:
        return error_response(request, "NOT_FOUND", "No lesson exam is configured for this lesson.", details={"lesson_id": [str(lesson_id)]}, status=404)
    if not lesson_assessment_unlocked(lesson, progress_map=progress_map):
        return error_response(request, "FORBIDDEN", "Complete the lesson before taking its exam.", details={"lesson_id": [str(lesson_id)]}, status=403)

    response_payload = serialize_course_assessment_detail(assessment, student=request.user)
    if not response_payload["questions"]:
        return error_response(
            request,
            "ASSESSMENT_UNAVAILABLE",
            course_assessment_unavailable_message(assessment, user=request.user),
            details={"lesson_id": [str(lesson_id)]},
            status=503,
        )
    return success_response(response_payload)

@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_lesson_assessment_submit_view(request, course_id: int, lesson_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course is not available.", details={"course_id": [str(course_id)]}, status=404)

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is None:
        return error_response(request, "FORBIDDEN", "You must enroll in this course before taking lesson exams.", details={"course_id": [str(course_id)]}, status=403)

    learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    lesson = next((item for item in lessons if item.id == lesson_id), None)
    if lesson is None:
        return error_response(request, "NOT_FOUND", "The requested lesson is not available.", details={"lesson_id": [str(lesson_id)]}, status=404)

    progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    assessment_by_lesson_id, _ = build_course_assessment_map(course)
    assessment = assessment_by_lesson_id.get(lesson.id)
    if assessment is None:
        return error_response(request, "NOT_FOUND", "No lesson exam is configured for this lesson.", details={"lesson_id": [str(lesson_id)]}, status=404)
    if not lesson_assessment_unlocked(lesson, progress_map=progress_map):
        return error_response(request, "FORBIDDEN", "Complete the lesson before taking its exam.", details={"lesson_id": [str(lesson_id)]}, status=403)

    generated_questions = get_cached_generated_course_assessment_questions(assessment, user=request.user)
    payload = validate_course_assessment_submission_payload(
        parse_json_body(request),
        assessment=assessment,
        generated_questions=generated_questions or None,
    )
    now = timezone.now()
    attempt_number = next_course_assessment_attempt_number(request.user, assessment)
    with transaction.atomic():
        attempt = CourseAssessmentAttempt(
            student=request.user,
            assessment=assessment,
            attempt_number=attempt_number,
            score_percent=0,
            passed=False,
            started_at=now,
            submitted_at=now,
            completed_at=now,
        )
        attempt.full_clean()
        attempt.save()

        if not generated_questions:
            for question_id, selected_option_ids in payload["answers_by_question_id"].items():
                for option_id in selected_option_ids:
                    selection = CourseAssessmentAttemptSelection(
                        attempt=attempt,
                        question_id=question_id,
                        option_id=option_id,
                    )
                    selection.full_clean()
                    selection.save()

        score_percent, passed, _, _ = score_course_assessment_submission_details(
            assessment,
            payload["answers_by_question_id"],
            generated_questions=generated_questions or None,
        )
        attempt.score_percent = score_percent
        attempt.passed = passed
        attempt.full_clean()
        attempt.save(update_fields=["score_percent", "passed", "updated_at"])
    if generated_questions:
        clear_cached_generated_course_assessment_questions(assessment, user=request.user)

    message = (
        "Lesson exam passed. The next lesson is now unlocked."
        if passed
        else f"Lesson exam submitted. Score {score_percent}%. Reach {assessment.passing_score_percent}% to unlock the next lesson."
    )
    return success_response(
        {
            "message": message,
            "assessment_id": assessment.id,
            "attempt_id": attempt.id,
            "attempt_number": attempt.attempt_number,
            "score_percent": score_percent,
            "passed": passed,
            "passing_score_percent": assessment.passing_score_percent,
        },
        status=201,
    )

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_course_final_assessment_detail_view(request, course_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course is not available.", details={"course_id": [str(course_id)]}, status=404)

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is None:
        return error_response(request, "FORBIDDEN", "You must enroll in this course before taking the final exam.", details={"course_id": [str(course_id)]}, status=403)

    learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    assessment_by_lesson_id, final_assessment = build_course_assessment_map(course)
    latest_attempts = latest_course_assessment_attempts_by_assessment_id(student=request.user, course=course)
    if final_assessment is None:
        return error_response(request, "NOT_FOUND", "No final exam is configured for this course.", details={"course_id": [str(course_id)]}, status=404)
    if not final_course_assessment_unlocked(
        lessons=lessons,
        progress_map=progress_map,
        assessment_by_lesson_id=assessment_by_lesson_id,
        latest_attempts_by_assessment_id=latest_attempts,
    ):
        return error_response(
            request,
            "FORBIDDEN",
            "Complete the last lesson and pass its exam with 90 percent or higher to unlock the final exam.",
            details={"course_id": [str(course_id)]},
            status=403,
        )

    response_payload = serialize_course_assessment_detail(final_assessment, student=request.user)
    if not response_payload["questions"]:
        return error_response(
            request,
            "ASSESSMENT_UNAVAILABLE",
            course_assessment_unavailable_message(final_assessment, user=request.user),
            details={"course_id": [str(course_id)]},
            status=503,
        )
    return success_response(response_payload)

@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_course_final_assessment_submit_view(request, course_id: int):
    course = get_visible_student_course(course_id)
    if course is None:
        return error_response(request, "NOT_FOUND", "The requested course is not available.", details={"course_id": [str(course_id)]}, status=404)

    learning_record = get_student_course_learning_record(request.user, course)
    if learning_record is None:
        return error_response(request, "FORBIDDEN", "You must enroll in this course before taking the final exam.", details={"course_id": [str(course_id)]}, status=403)

    learning_record = sync_learning_record_progress(learning_record)
    lessons = active_course_lessons(course)
    progress_map = get_learning_record_lesson_progress_map(learning_record, lessons)
    assessment_by_lesson_id, final_assessment = build_course_assessment_map(course)
    latest_attempts = latest_course_assessment_attempts_by_assessment_id(student=request.user, course=course)
    if final_assessment is None:
        return error_response(request, "NOT_FOUND", "No final exam is configured for this course.", details={"course_id": [str(course_id)]}, status=404)
    if not final_course_assessment_unlocked(
        lessons=lessons,
        progress_map=progress_map,
        assessment_by_lesson_id=assessment_by_lesson_id,
        latest_attempts_by_assessment_id=latest_attempts,
    ):
        return error_response(
            request,
            "FORBIDDEN",
            "Complete the last lesson and pass its exam with 90 percent or higher to unlock the final exam.",
            details={"course_id": [str(course_id)]},
            status=403,
        )

    generated_questions = get_cached_generated_course_assessment_questions(final_assessment, user=request.user)
    payload = validate_course_assessment_submission_payload(
        parse_json_body(request),
        assessment=final_assessment,
        generated_questions=generated_questions or None,
    )
    now = timezone.now()
    attempt_number = next_course_assessment_attempt_number(request.user, final_assessment)
    with transaction.atomic():
        attempt = CourseAssessmentAttempt(
            student=request.user,
            assessment=final_assessment,
            attempt_number=attempt_number,
            score_percent=0,
            passed=False,
            started_at=now,
            submitted_at=now,
            completed_at=now,
        )
        attempt.full_clean()
        attempt.save()

        if not generated_questions:
            for question_id, selected_option_ids in payload["answers_by_question_id"].items():
                for option_id in selected_option_ids:
                    selection = CourseAssessmentAttemptSelection(
                        attempt=attempt,
                        question_id=question_id,
                        option_id=option_id,
                    )
                    selection.full_clean()
                    selection.save()

        score_percent, passed, _, _ = score_course_assessment_submission_details(
            final_assessment,
            payload["answers_by_question_id"],
            generated_questions=generated_questions or None,
        )
        attempt.score_percent = score_percent
        attempt.passed = passed
        attempt.full_clean()
        attempt.save(update_fields=["score_percent", "passed", "updated_at"])
    if generated_questions:
        clear_cached_generated_course_assessment_questions(final_assessment, user=request.user)

    learning_record = sync_learning_record_progress(learning_record)
    message = (
        "Final exam passed. Course completed."
        if passed
        else f"Final exam submitted. Score {score_percent}%. Reach {final_assessment.passing_score_percent}% to complete the course."
    )
    return success_response(
        {
            "message": message,
            "assessment_id": final_assessment.id,
            "attempt_id": attempt.id,
            "attempt_number": attempt.attempt_number,
            "score_percent": score_percent,
            "passed": passed,
            "passing_score_percent": final_assessment.passing_score_percent,
            "course_completed": learning_record.status == LearningRecord.Status.COMPLETED,
        },
        status=201,
    )

@api_endpoint(["POST", "DELETE"], authentication_required=True, roles=[User.Role.STUDENT])
def student_job_bookmark_view(request, vacancy_id: int):
    if request.method == "DELETE":
        JobBookmark.objects.filter(student=request.user, vacancy_id=vacancy_id).delete()
        return success_response(
            {
                "vacancy_id": vacancy_id,
                "is_bookmarked": False,
                "message": "Saved state removed.",
            }
        )

    vacancy = get_visible_student_vacancy(vacancy_id)
    if vacancy is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested vacancy is not available for bookmarking.",
            details={"vacancy_id": [str(vacancy_id)]},
            status=404,
        )

    bookmark, created = JobBookmark.objects.get_or_create(student=request.user, vacancy=vacancy)
    if not created:
        return success_response(
            {
                "vacancy_id": vacancy.id,
                "is_bookmarked": True,
                "message": "Saved for later.",
            }
        )
    return success_response(
        {
            "vacancy_id": vacancy.id,
            "is_bookmarked": True,
            "message": "Saved for later.",
        },
        status=201,
    )

@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_applications_view(request):
    if request.method == "GET":
        applications = list(
            Application.objects.filter(student=request.user)
            .select_related("company", "vacancy")
            .prefetch_related("history__actor")
            .order_by("-updated_at", "-id")
        )
        return success_response(
            {
                "student_id": request.user.id,
                "application_count": len(applications),
                "applications": [serialize_student_application(application) for application in applications],
            }
        )

    payload = validate_application_payload(parse_json_body(request))
    vacancy = get_visible_student_vacancy(payload["vacancy_id"])
    if vacancy is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested vacancy is not available for student applications.",
            details={"vacancy_id": [str(payload["vacancy_id"])]},
            status=404,
        )

    duplicate_application = Application.objects.filter(
        student=request.user,
        vacancy=vacancy,
    ).exclude(status__in=[Application.Status.REJECTED, Application.Status.WITHDRAWN])
    if duplicate_application.exists():
        raise ValidationError({"vacancy_id": ["An active application already exists for this vacancy."]})

    try:
        with transaction.atomic():
            application = Application(
                company=vacancy.company,
                vacancy=vacancy,
                student=request.user,
                status=Application.Status.SUBMITTED,
            )
            application.full_clean()
            application.save()
            create_application_history(
                application,
                from_status="",
                to_status=Application.Status.SUBMITTED,
                actor=request.user,
                note="Application submitted by student.",
            )
            get_or_create_application_candidate_access(application)
    except IntegrityError as exc:
        raise ValidationError({"vacancy_id": ["An active application already exists for this vacancy."]}) from exc

    application = (
        Application.objects.filter(pk=application.pk)
        .select_related("company", "vacancy")
        .prefetch_related("history__actor")
        .first()
    )
    return success_response(serialize_student_application(application), status=201)

@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_application_withdraw_view(request, application_id: int):
    application = get_student_application(request.user, application_id)
    if application is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested application was not found.",
            details={"application_id": [str(application_id)]},
            status=404,
        )

    if not application_is_withdrawable(application):
        raise ValidationError({"application_id": ["This application can no longer be withdrawn."]})

    transition_application_status(
        application,
        to_status=Application.Status.WITHDRAWN,
        actor=request.user,
        note="Application withdrawn by student.",
    )
    application = get_student_application(request.user, application_id)
    return success_response(serialize_student_application(application))

@api_endpoint(["GET", "POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_skills_view(request):
    if request.method == "GET":
        return success_response(serialize_student_skills(request.user))

    payload = validate_student_skill_payload(parse_json_body(request))
    if StudentSkill.objects.filter(student=request.user, skill=payload["skill"]).exists():
        raise ValidationError({"skill_id": ["This skill is already added to your profile."]})

    student_skill = StudentSkill(
        student=request.user,
        skill=payload["skill"],
        proficiency_level=payload["proficiency_level"],
    )
    student_skill.full_clean()
    student_skill.save()
    from services.matching_jobs import (
        invalidate_student_matches_snapshot,
        queue_student_matches_snapshot_refresh,
    )

    invalidate_student_matches_snapshot(request.user.id)
    queue_student_matches_snapshot_refresh(request.user.id)

    return success_response(serialize_student_skills(request.user), status=201)

@api_endpoint(["PUT", "DELETE"], authentication_required=True, roles=[User.Role.STUDENT])
def student_skill_detail_view(request, student_skill_id: int):
    from services.matching_jobs import (
        invalidate_student_matches_snapshot,
        queue_student_matches_snapshot_refresh,
    )

    student_skill = (
        StudentSkill.objects.filter(student=request.user, pk=student_skill_id)
        .select_related("skill")
        .first()
    )
    if student_skill is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested student skill was not found.",
            details={"student_skill_id": [str(student_skill_id)]},
            status=404,
        )

    if request.method == "DELETE":
        student_skill.delete()
        invalidate_student_matches_snapshot(request.user.id)
        queue_student_matches_snapshot_refresh(request.user.id)
        return success_response(serialize_student_skills(request.user))

    payload = validate_student_skill_payload(parse_json_body(request))
    duplicate_skill = StudentSkill.objects.filter(student=request.user, skill=payload["skill"]).exclude(
        pk=student_skill.pk
    )
    if duplicate_skill.exists():
        raise ValidationError({"skill_id": ["This skill is already added to your profile."]})

    student_skill.skill = payload["skill"]
    student_skill.proficiency_level = payload["proficiency_level"]
    student_skill.full_clean()
    student_skill.save(update_fields=["skill", "proficiency_level", "updated_at"])
    invalidate_student_matches_snapshot(request.user.id)
    queue_student_matches_snapshot_refresh(request.user.id)

    return success_response(serialize_student_skills(request.user))

@api_endpoint(["GET", "PUT"], authentication_required=True, roles=[User.Role.STUDENT])
def student_privacy_settings_view(request):
    settings = get_visibility_settings(request.user)
    ensure_visibility_event_exists(request.user, settings)

    if request.method == "GET":
        return success_response(serialize_student_privacy_settings(request.user))

    payload = validate_student_privacy_settings_payload(parse_json_body(request))
    settings.share_profile_preview = payload["share_profile_preview"]
    settings.share_learning_record = payload["share_learning_record"]
    settings.share_exam_results = payload["share_exam_results"]
    settings.full_clean()
    settings.save(
        update_fields=[
            "share_profile_preview",
            "share_learning_record",
            "share_exam_results",
            "updated_at",
        ]
    )
    record_visibility_event(request.user, settings)

    return success_response(serialize_student_privacy_settings(request.user))

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_learning_summary_view(request):
    return success_response(serialize_learning_summary(request.user))

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_exam_results_view(request):
    return success_response(serialize_exam_results_summary(request.user))

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_preparation_summary_view(request):
    return success_response(serialize_preparation_summary(request.user))

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_practice_questions_view(request):
    selected_category = (request.GET.get("category") or "").strip()
    selected_exam_id = request.GET.get("exam_id")
    exam_id = int(selected_exam_id) if selected_exam_id and selected_exam_id.isdigit() else None
    practice_queryset = visible_practice_questions_queryset(category=selected_category or None, exam_id=exam_id)
    questions = list(practice_queryset[:12])
    available_exam_ids = list(
        visible_practice_questions_queryset(category=selected_category or None)
        .values_list("exam_id", flat=True)
        .distinct()
    )
    exams_queryset = visible_student_exams_queryset().filter(id__in=available_exam_ids)

    return success_response(
        {
            "selected_category": selected_category or None,
            "selected_exam_id": exam_id,
            "categories": [
                {
                    "value": category,
                    "label": category.replace("_", " ").title(),
                }
                for category in preparation_categories_for_student(request.user)
            ],
            "exams": [
                {
                    "exam_id": exam.id,
                    "title": exam.title,
                    "category": exam.category,
                }
                for exam in exams_queryset
            ],
            "question_count": len(questions),
            "questions": [serialize_practice_question(question, student=request.user) for question in questions],
        }
    )

@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_practice_question_attempt_view(request, question_id: int):
    question = visible_practice_questions_queryset().filter(pk=question_id).first()
    if question is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested practice question is not available.",
            details={"question_id": [str(question_id)]},
            status=404,
        )

    payload = parse_json_body(request)
    selected_option_id = payload.get("selected_option_id")
    if not isinstance(selected_option_id, int):
        raise ValidationError({"selected_option_id": ["This field is required."]})

    selected_option = question.answer_options.filter(pk=selected_option_id, status=ExamAnswerOption.Status.ACTIVE).first()
    if selected_option is None:
        raise ValidationError({"selected_option_id": ["Select an active option for this question."]})

    correct_option = question.answer_options.filter(status=ExamAnswerOption.Status.ACTIVE, is_correct=True).order_by("sequence_number", "id").first()
    if correct_option is None:
        raise ValidationError({"question_id": ["This practice question is not ready yet."]})

    attempt = PracticeQuestionAttempt(
        student=request.user,
        exam=question.exam,
        question=question,
        selected_option=selected_option,
        is_correct=selected_option.id == correct_option.id,
    )
    attempt.full_clean()
    attempt.save()

    category_attempts = PracticeQuestionAttempt.objects.filter(student=request.user, exam__category=question.exam.category)
    category_accuracy = None
    if category_attempts.exists():
        category_accuracy = round((category_attempts.filter(is_correct=True).count() / category_attempts.count()) * 100, 1)

    return success_response(
        {
            "attempt_id": attempt.id,
            "question_id": question.id,
            "selected_option_id": selected_option.id,
            "is_correct": attempt.is_correct,
            "correct_option_id": correct_option.id,
            "correct_option_text": correct_option.option_text,
            "feedback": "Correct answer." if attempt.is_correct else "Not quite. Review the correct option and try another question.",
            "performance_snapshot": {
                "category": question.exam.category,
                "practice_attempt_count": category_attempts.count(),
                "practice_accuracy": category_accuracy,
            },
        },
        status=201,
    )

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_exam_detail_view(request, exam_id: int):
    exam = get_visible_student_exam(exam_id)
    if exam is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested exam is not available.",
            details={"exam_id": [str(exam_id)]},
            status=404,
        )

    exam = sync_exam_question_count(exam)
    eligibility = evaluate_exam_retake_eligibility(request.user, exam)
    if not eligibility["can_take"]:
        return error_response(
            request,
            "FORBIDDEN",
            eligibility["message"],
            details={"exam_id": [str(exam_id)]},
            status=403,
        )

    return success_response(serialize_student_exam_detail(exam, student=request.user))

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_mock_exam_detail_view(request, exam_id: int):
    exam = get_visible_student_exam(exam_id)
    if exam is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested mock exam is not available.",
            details={"exam_id": [str(exam_id)]},
            status=404,
        )

    exam = sync_exam_question_count(exam)
    if not exam_is_ready_for_student(exam):
        return error_response(
            request,
            "FORBIDDEN",
            "This mock exam is not ready yet.",
            details={"exam_id": [str(exam_id)]},
            status=403,
        )

    return success_response(serialize_student_mock_exam_detail(exam, student=request.user))

@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_exam_submit_view(request, exam_id: int):
    exam = get_visible_student_exam(exam_id)
    if exam is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested exam is not available.",
            details={"exam_id": [str(exam_id)]},
            status=404,
        )

    exam = sync_exam_question_count(exam)
    eligibility = evaluate_exam_retake_eligibility(request.user, exam)
    if not eligibility["can_take"]:
        return error_response(
            request,
            "FORBIDDEN",
            eligibility["message"],
            details={"exam_id": [str(exam_id)]},
            status=403,
        )

    payload = validate_exam_submission_payload(parse_json_body(request), exam=exam)
    now = timezone.now()
    with transaction.atomic():
        attempt = ExamAttempt(
            student=request.user,
            exam=exam,
            attempt_number=eligibility["next_attempt_number"],
            status=ExamAttempt.Status.SUBMITTED,
            started_at=now,
            submitted_at=now,
        )
        attempt.full_clean()
        attempt.save()

        for question_id, selected_option_id in payload["answers_by_question_id"].items():
            answer = ExamAttemptAnswer(
                attempt=attempt,
                question_id=question_id,
                selected_option_id=selected_option_id,
            )
            answer.full_clean()
            answer.save()

        score_percent, passed = score_exam_submission(exam, payload["answers_by_question_id"])
        attempt.status = ExamAttempt.Status.SCORED
        attempt.score_percent = score_percent
        attempt.passed = passed
        attempt.completed_at = now
        attempt.full_clean()
        attempt.save(
            update_fields=[
                "status",
                "score_percent",
                "passed",
                "completed_at",
                "updated_at",
            ]
        )

        result = ExamResult(
            student=request.user,
            exam=exam,
            attempt=attempt,
            exam_title=exam.title,
            category=exam.category,
            score_percent=score_percent,
            passed=passed,
            attempt_number=attempt.attempt_number,
            taken_at=now,
        )
        result.full_clean()
        result.save()

    return success_response(
        {
            "exam_id": exam.id,
            "attempt_id": attempt.id,
            "attempt_number": attempt.attempt_number,
            "score_percent": score_percent,
            "passed": passed,
            "passing_score_percent": exam.passing_score_percent,
            "result_id": result.id,
            "history_href": "/student/exams",
        },
        status=201,
    )

@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_mock_exam_submit_view(request, exam_id: int):
    exam = get_visible_student_exam(exam_id)
    if exam is None:
        return error_response(
            request,
            "NOT_FOUND",
            "The requested mock exam is not available.",
            details={"exam_id": [str(exam_id)]},
            status=404,
        )

    exam = sync_exam_question_count(exam)
    if not exam_is_ready_for_student(exam):
        return error_response(
            request,
            "FORBIDDEN",
            "This mock exam is not ready yet.",
            details={"exam_id": [str(exam_id)]},
            status=403,
        )

    payload = validate_exam_submission_payload(parse_json_body(request), exam=exam)
    now = timezone.now()
    score_percent, _, correct_answer_count, total_questions = score_exam_submission_details(exam, payload["answers_by_question_id"])

    with transaction.atomic():
        attempt = MockExamAttempt(
            student=request.user,
            exam=exam,
            exam_title=exam.title,
            category=exam.category,
            attempt_number=next_mock_exam_attempt_number(request.user, exam),
            score_percent=score_percent,
            correct_answer_count=correct_answer_count,
            total_questions=total_questions,
            started_at=now,
            submitted_at=now,
        )
        attempt.full_clean()
        attempt.save()

        for question_id, selected_option_id in payload["answers_by_question_id"].items():
            answer = MockExamAttemptAnswer(
                attempt=attempt,
                question_id=question_id,
                selected_option_id=selected_option_id,
                is_correct=question_id in {
                    question.id
                    for question in active_exam_questions(exam)
                    if any(
                        option.id == selected_option_id and option.status == ExamAnswerOption.Status.ACTIVE and option.is_correct
                        for option in question.answer_options.all()
                    )
                },
            )
            answer.full_clean()
            answer.save()

    return success_response(
        {
            "attempt_id": attempt.id,
            "exam_id": exam.id,
            "exam_title": exam.title,
            "attempt_number": attempt.attempt_number,
            "score_percent": score_percent,
            "correct_answer_count": correct_answer_count,
            "total_questions": total_questions,
            "history_href": "/student/preparation",
        },
        status=201,
    )

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_interviews_view(request):
    interviews = list(
        Interview.objects.filter(student=request.user)
        .select_related("student", "company", "candidate_access", "requested_by")
        .order_by("-updated_at", "-id")
    )
    return success_response({"interviews": [serialize_interview(interview) for interview in interviews]})

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_performance_view(request):
    try:
        profile = StudentProfile.objects.get(user=request.user)
    except StudentProfile.DoesNotExist:
        return error_response(
            request,
            "not_found",
            "Student profile not found.",
            status=404,
        )
    
    metrics = StudentPerformanceMetric.objects.filter(student=profile).order_by("-calculated_at")
    return success_response({
        "metrics": [serialize_performance_metric(m) for m in metrics]
    })

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_performance_exam_view(request, exam_id):
    try:
        exam = Exam.objects.get(id=exam_id)
        profile = StudentProfile.objects.get(user=request.user)
    except (Exam.DoesNotExist, StudentProfile.DoesNotExist):
        return error_response(request, "not_found", "Not found.", status=404)
    
    metrics = StudentPerformanceMetric.objects.filter(
        student=profile,
        exam=exam
    ).order_by("-calculated_at")
    
    return success_response({
        "metrics": [serialize_performance_metric(m) for m in metrics]
    })

@api_endpoint(["GET", "PUT"], authentication_required=True, roles=[User.Role.STUDENT])
def student_consent_view(request):
    """Get or update student data consent preferences."""
    if request.method == "GET":
        # Get all consents for the student
        consents = DataConsent.objects.filter(student=request.user)
        
        # Include all consent types even if not yet created
        all_consent_types = dict(DataConsent.CONSENT_TYPES)
        consent_data = {}
        
        for consent_type, description in DataConsent.CONSENT_TYPES:
            type_consents = consents.filter(consent_type=consent_type)
            if type_consents.exists():
                consent_data[consent_type] = [serialize_consent(c) for c in type_consents]
            else:
                consent_data[consent_type] = []
        
        return success_response({"consents": consent_data})
    
    elif request.method == "PUT":
        try:
            payload = parse_json_body(request)
        except Exception as e:
            return error_response(request, "invalid_request", str(e), status=400)
        
        consent_type = payload.get("consent_type")
        given = payload.get("given", False)
        company_id = payload.get("company_id")
        
        if not consent_type or consent_type not in dict(DataConsent.CONSENT_TYPES):
            return error_response(request, "invalid_request", "Invalid consent_type.", status=400)
        
        company = None
        if company_id:
            try:
                company = Company.objects.get(id=company_id)
            except Company.DoesNotExist:
                return error_response(request, "not_found", "Company not found.", status=404)
        
        try:
            consent, created = DataConsent.objects.update_or_create(
                student=request.user,
                consent_type=consent_type,
                company=company,
                defaults={
                    "given": given,
                    "given_at": timezone.now() if given else None,
                    "ip_address": get_client_ip(request),
                    "user_agent": request.META.get("HTTP_USER_AGENT", "")[:500],
                }
            )
            consent.full_clean()
            consent.save()
            
            return success_response(
                {"consent": serialize_consent(consent)},
                status=201 if created else 200
            )
        except ValidationError as e:
            return error_response(request, "validation_error", str(e.messages), status=400)

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_data_access_log_view(request):
    """Get audit log of who accessed my data."""
    logs = StudentDataAccessLog.objects.filter(student=request.user).order_by("-created_at")
    
    # Optional filtering by company
    company_id = request.GET.get("company_id")
    if company_id:
        logs = logs.filter(accessed_by_company_id=company_id)
    
    # Optional filtering by access type
    access_type = request.GET.get("access_type")
    if access_type:
        logs = logs.filter(access_type=access_type)
    
    return success_response({
        "logs": [serialize_access_log(log) for log in logs[:100]]  # Limit to 100 most recent
    })

@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_data_export_request_view(request):
    """Request to export all personal data."""
    try:
        # Create a new export request
        expires_at = timezone.now() + timedelta(days=30)
        export_request = DataExportRequest.objects.create(
            student=request.user,
            status="pending",
            expires_at=expires_at,
        )
        export_request.full_clean()
        export_request.save()
        
        return success_response(
            {"export_request": serialize_export_request(export_request)},
            status=201
        )
    except ValidationError as e:
        return error_response(request, "validation_error", str(e.messages), status=400)

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_data_export_detail_view(request, export_id):
    """Get export request status or download link."""
    try:
        export_request = DataExportRequest.objects.get(id=export_id, student=request.user)
    except DataExportRequest.DoesNotExist:
        return error_response(request, "not_found", "Export request not found.", status=404)
    
    return success_response({"export_request": serialize_export_request(export_request)})

@api_endpoint(["POST"], authentication_required=True, roles=[User.Role.STUDENT])
def student_deletion_request_view(request):
    """Request account deletion."""
    try:
        payload = parse_json_body(request)
        reason = payload.get("reason", "")
        
        # Check if there's already a pending deletion request
        existing = DataDeletionRequest.objects.filter(
            student=request.user,
            status__in=["pending", "processing"]
        ).exists()
        
        if existing:
            return error_response(
                request,
                "validation_error",
                "You already have a pending deletion request.",
                status=400
            )
        
        deletion_request = DataDeletionRequest.objects.create(
            student=request.user,
            status="pending",
            reason=reason,
        )
        deletion_request.full_clean()
        deletion_request.save()
        
        return success_response(
            {"deletion_request": serialize_deletion_request(deletion_request)},
            status=201
        )
    except ValidationError as e:
        return error_response(request, "validation_error", str(e.messages), status=400)

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_deletion_status_view(request):
    """Check deletion request status."""
    deletion_request = DataDeletionRequest.objects.filter(
        student=request.user
    ).order_by("-created_at").first()
    
    if not deletion_request:
        return success_response({"deletion_request": None})
    
    return success_response({"deletion_request": serialize_deletion_request(deletion_request)})

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_dashboard_data_view(request):
    """Analytics dashboard data for student - all metrics and charts"""
    try:
        profile = StudentProfile.objects.get(user=request.user)
    except StudentProfile.DoesNotExist:
        return error_response(
            request,
            "not_found",
            "Student profile not found.",
            status=404,
        )
    
    from services.analytics import AnalyticsService
    data = AnalyticsService.get_student_dashboard_data(profile)
    return success_response(data)

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_dashboard_learning_view(request):
    """Analytics data for student learning progress"""
    try:
        profile = StudentProfile.objects.get(user=request.user)
    except StudentProfile.DoesNotExist:
        return error_response(
            request,
            "not_found",
            "Student profile not found.",
            status=404,
        )
    
    from services.analytics import AnalyticsService
    data = AnalyticsService.get_student_dashboard_data(profile)
    return success_response({
        'metrics': data['metrics'],
        'score_history': data['score_history'],
        'learning_status': data['learning_status'],
    })

@api_endpoint(["GET"], authentication_required=True, roles=[User.Role.STUDENT])
def student_dashboard_applications_view(request):
    """Analytics data for student applications"""
    try:
        profile = StudentProfile.objects.get(user=request.user)
    except StudentProfile.DoesNotExist:
        return error_response(
            request,
            "not_found",
            "Student profile not found.",
            status=404,
        )
    
    from services.analytics import AnalyticsService
    data = AnalyticsService.get_student_dashboard_data(profile)
    return success_response({
        'metrics': {
            'applications_submitted': data['metrics']['applications_submitted'],
            'applications_accepted': data['metrics']['applications_accepted'],
            'applications_rejected': data['metrics']['applications_rejected'],
        },
        'application_status': data['application_status'],
        'upcoming_interviews': data['upcoming_interviews'],
    })
