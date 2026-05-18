import json
import re
from html import unescape
from urllib import error, request
from urllib.parse import urlparse


RE_YOUTUBE = re.compile(
    r'(?:youtube\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)?/|.*[?&]v=)|youtu\.be/)([^"&?/\s]{11})',
    re.IGNORECASE,
)
RE_XML_TRANSCRIPT = re.compile(r'<text start="([^"]*)" dur="([^"]*)">([^<]*)</text>')
RE_TRANSCRIPT_PARAGRAPH = re.compile(r'<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)</p>')
RE_TRANSCRIPT_SEGMENT = re.compile(r'<s[^>]*>([^<]*)</s>')
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)"
)
INNERTUBE_API_URL = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false"
INNERTUBE_CLIENT_VERSION = "20.10.38"
INNERTUBE_USER_AGENT = f"com.google.android.youtube/{INNERTUBE_CLIENT_VERSION} (Linux; U; Android 14)"
ALLOWED_YOUTUBE_HOSTS = {
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "youtu.be",
    "www.youtu.be",
}
ALLOWED_TRANSCRIPT_HOSTS = {
    "youtube.com",
    "www.youtube.com",
}


class YouTubeTranscriptServiceError(Exception):
    """Raised when a YouTube transcript cannot be retrieved."""


class YouTubeTranscriptService:
    def __init__(self, *, timeout_seconds: int = 15) -> None:
        self.timeout_seconds = timeout_seconds

    def fetch_transcript_text(self, video_url: str, *, lang: str | None = None) -> str:
        transcript_entries = self.fetch_transcript(video_url, lang=lang)
        transcript_text = " ".join(entry["text"] for entry in transcript_entries if entry["text"].strip())
        normalized_transcript = " ".join(transcript_text.split()).strip()
        if not normalized_transcript:
            raise YouTubeTranscriptServiceError("No transcript text was returned for this video.")
        return normalized_transcript

    def fetch_transcript(self, video_url: str, *, lang: str | None = None) -> list[dict[str, object]]:
        video_id = self.retrieve_video_id(video_url)
        caption_tracks = self._fetch_caption_tracks_via_innertube(video_id)
        if not caption_tracks:
            caption_tracks = self._fetch_caption_tracks_via_webpage(video_id, lang=lang)
        return self._fetch_transcript_from_tracks(caption_tracks, video_id, lang=lang)

    def retrieve_video_id(self, video_url: str) -> str:
        normalized_value = video_url.strip()
        if len(normalized_value) == 11 and re.fullmatch(r"[A-Za-z0-9_-]{11}", normalized_value):
            return normalized_value

        match = RE_YOUTUBE.search(normalized_value)
        if match:
            return match.group(1)

        raise YouTubeTranscriptServiceError("Paste a valid YouTube video URL.")

    def _fetch_caption_tracks_via_innertube(self, video_id: str) -> list[dict] | None:
        payload = {
            "context": {
                "client": {
                    "clientName": "ANDROID",
                    "clientVersion": INNERTUBE_CLIENT_VERSION,
                }
            },
            "videoId": video_id,
        }
        request_payload = request.Request(
            INNERTUBE_API_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "User-Agent": INNERTUBE_USER_AGENT,
            },
            method="POST",
        )

        try:
            response_body = self._read_response(request_payload)
        except YouTubeTranscriptServiceError:
            return None

        try:
            parsed_response = json.loads(response_body)
        except json.JSONDecodeError:
            return None

        caption_tracks = (
            parsed_response.get("captions", {})
            .get("playerCaptionsTracklistRenderer", {})
            .get("captionTracks")
        )
        return caption_tracks if isinstance(caption_tracks, list) and caption_tracks else None

    def _fetch_caption_tracks_via_webpage(self, video_id: str, *, lang: str | None = None) -> list[dict]:
        headers = {"User-Agent": USER_AGENT}
        if lang:
            headers["Accept-Language"] = lang

        response_body = self._read_response(
            request.Request(
                f"https://www.youtube.com/watch?v={video_id}",
                headers=headers,
                method="GET",
            )
        )

        if 'class="g-recaptcha"' in response_body:
            raise YouTubeTranscriptServiceError(
                "YouTube temporarily blocked transcript requests for this video. Please try again later."
            )
        if '"playabilityStatus":' not in response_body:
            raise YouTubeTranscriptServiceError("This YouTube video is unavailable.")

        player_response = self._parse_inline_json(response_body, "ytInitialPlayerResponse")
        caption_tracks = (
            player_response.get("captions", {})
            .get("playerCaptionsTracklistRenderer", {})
            .get("captionTracks")
        )
        if not isinstance(caption_tracks, list) or not caption_tracks:
            raise YouTubeTranscriptServiceError("This YouTube video does not expose any transcript tracks.")

        return caption_tracks

    def _parse_inline_json(self, html: str, global_name: str) -> dict:
        start_token = f"var {global_name} = "
        start_index = html.find(start_token)
        if start_index == -1:
            return {}

        json_start = start_index + len(start_token)
        depth = 0
        for index in range(json_start, len(html)):
            character = html[index]
            if character == "{":
                depth += 1
            elif character == "}":
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(html[json_start : index + 1])
                    except json.JSONDecodeError:
                        return {}

        return {}

    def _fetch_transcript_from_tracks(
        self,
        caption_tracks: list[dict],
        video_id: str,
        *,
        lang: str | None = None,
    ) -> list[dict[str, object]]:
        track = None
        if lang:
            track = next((candidate for candidate in caption_tracks if candidate.get("languageCode") == lang), None)
            if track is None:
                available_langs = [candidate.get("languageCode") for candidate in caption_tracks if candidate.get("languageCode")]
                raise YouTubeTranscriptServiceError(
                    f"No transcript is available in {lang}. Available languages: {', '.join(available_langs)}"
                )
        else:
            track = caption_tracks[0]

        transcript_url = str(track.get("baseUrl", "")).strip()
        parsed_url = urlparse(transcript_url)
        hostname = (parsed_url.hostname or "").lower()
        if hostname not in ALLOWED_TRANSCRIPT_HOSTS and not hostname.endswith(".youtube.com"):
            raise YouTubeTranscriptServiceError("YouTube returned an invalid transcript URL.")

        headers = {"User-Agent": USER_AGENT}
        if lang:
            headers["Accept-Language"] = lang

        transcript_body = self._read_response(
            request.Request(
                transcript_url,
                headers=headers,
                method="GET",
            )
        )
        transcript_entries = self._parse_transcript_xml(transcript_body, str(track.get("languageCode") or lang or ""))
        if not transcript_entries:
            raise YouTubeTranscriptServiceError(f"No transcript is available for this video ({video_id}).")
        return transcript_entries

    def _parse_transcript_xml(self, xml: str, lang: str) -> list[dict[str, object]]:
        results: list[dict[str, object]] = []

        for match in RE_TRANSCRIPT_PARAGRAPH.finditer(xml):
            start_ms = int(match.group(1))
            duration_ms = int(match.group(2))
            inner_html = match.group(3)
            text_parts = [segment.group(1) for segment in RE_TRANSCRIPT_SEGMENT.finditer(inner_html)]
            if text_parts:
                text = "".join(text_parts)
            else:
                text = re.sub(r"<[^>]+>", "", inner_html)

            normalized_text = unescape(text).strip()
            if normalized_text:
                results.append(
                    {
                        "text": normalized_text,
                        "duration": duration_ms,
                        "offset": start_ms,
                        "lang": lang,
                    }
                )

        if results:
            return results

        for match in RE_XML_TRANSCRIPT.finditer(xml):
            normalized_text = unescape(match.group(3)).strip()
            if normalized_text:
                results.append(
                    {
                        "text": normalized_text,
                        "duration": float(match.group(2)),
                        "offset": float(match.group(1)),
                        "lang": lang,
                    }
                )

        return results

    def _read_response(self, http_request: request.Request) -> str:
        try:
            with request.urlopen(http_request, timeout=self.timeout_seconds) as response:
                return response.read().decode("utf-8")
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise YouTubeTranscriptServiceError(
                f"YouTube transcript request failed with HTTP {exc.code}: {detail or exc.reason}"
            ) from exc
        except error.URLError as exc:
            raise YouTubeTranscriptServiceError(f"YouTube transcript request failed: {exc.reason}") from exc

