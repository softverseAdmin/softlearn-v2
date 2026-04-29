from common.http import error_response


def csrf_failure(request, reason=""):
    details = {"reason": [reason]} if reason else {}
    return error_response(
        request,
        "CSRF_FAILED",
        "CSRF validation failed.",
        details=details,
        status=403,
    )
