# Inception v1 matching strategy

## Purpose

The product-facing name may refer to this capability as **AI matching**, but the initial implementation is **not real AI**. The first production version must use a **deterministic rule-based scoring strategy only**.

This keeps the system:

- explainable
- auditable
- privacy-aware
- cheaper to operate
- easier to validate with early users

## Principle

- Use structured platform data only.
- Use deterministic scoring rules only.
- Do not use ML models, LLMs, embeddings, OpenAI APIs, or external AI services in v1.
- Treat matching as **recommendation support**, not automated decision-making.

## Matching inputs

### Student-side inputs

- student skills
- desired job type
- desired work location
- Japanese level
- English level
- learning progress
- exam results
- resume completeness
- profile completeness

### Company and job-side inputs

- company job requirements
- required skills
- preferred skills
- location
- employment type
- experience level
- language requirements

## Matching score design

The matching score is a weighted value from **0 to 100**.

### Recommended v1 weighting

| Factor | Points | Notes |
| --- | --- | --- |
| Skill match | 40 | Strongest factor because job-role fit is central. |
| Language match | 20 | Covers Japanese and English requirements. |
| Location / remote preference | 15 | Covers preferred work location and remote compatibility. |
| Learning progress / exam readiness | 15 | Reflects course completion, learning progress, and exam outcomes. |
| Profile completeness | 10 | Encourages high-quality student data and resume readiness. |

### Example scoring interpretation

- A student who matches most required skills but has weak profile completeness can still rank well, but not maximally.
- A student with a strong profile but weak required-skill fit should not score highly.
- Missing required language or skill requirements should reduce the score significantly.

## Rule details

### 1. Skill match - 40 points

Split skill matching into:

- **required skills**
- **preferred skills**

Suggested logic:

- Required skill coverage drives most of the score.
- Preferred skill coverage adds a smaller boost.

Example:

- Match all required skills -> near full skill score
- Match some required skills -> partial score
- Match many preferred skills but miss required skills -> limited score only

### 2. Language match - 20 points

Compare:

- student Japanese level vs job Japanese requirement
- student English level vs job English requirement if relevant

Suggested behavior:

- Meets or exceeds required Japanese level -> full or near-full language score
- Slightly below requirement -> partial score
- Clearly below requirement -> low score

### 3. Location / remote preference - 15 points

Compare:

- student desired work location
- job location
- remote / hybrid compatibility

Suggested behavior:

- Exact or acceptable preference match -> high score
- Flexible mismatch with remote compatibility -> medium score
- Hard mismatch -> low score

### 4. Learning progress / exam readiness - 15 points

Use structured readiness signals such as:

- relevant course completion
- relevant lesson progress
- exam attempts and results
- mock exam or preparation progress if available

Suggested behavior:

- Strong relevant completion and good results -> high score
- Partial progress -> medium score
- Little relevant evidence -> low score

### 5. Profile completeness - 10 points

Use completion indicators such as:

- core profile fields filled
- skills added
- language level added
- resume present
- availability set

Suggested behavior:

- Complete profile and resume -> full score
- Missing important fields -> reduced score

## Match result classification

| Score range | Match level |
| --- | --- |
| 80-100 | Strong Match |
| 60-79 | Good Match |
| 40-59 | Possible Match |
| 0-39 | Low Match |

## Explanation rules

Every match result should generate human-readable explanations derived from the rule outcomes.

### Example explanation patterns

- "You match 4 of 5 required skills"
- "Your Japanese level meets the job requirement"
- "Your preferred location matches this job"
- "You completed relevant learning content for this role"
- "Your exam results improve your readiness score"
- "Complete your profile to improve your score"
- "You are missing 2 required skills for this role"

### Explanation principles

- Use plain language.
- Explain both strengths and gaps.
- Avoid hidden scoring logic.
- Do not infer personal traits or hidden potential.

## Ranking strategy

Jobs should be ordered using these rules:

1. highest score first
2. newer job posts first when scores are equal
3. completed company profiles prioritized when scores are equal
4. expired or closed jobs excluded from matching results

Additional rule:

- Jobs that fail minimum eligibility rules may still appear only if the score remains meaningful, but low-confidence results should remain in lower match bands.

## Data storage

Each calculated match should store at least:

- `student_id`
- `job_id`
- `score`
- `match_level`
- `matched_skills`
- `missing_skills`
- `explanation`
- `calculated_at`

Optional supporting fields later:

- factor-level component scores
- language evaluation summary
- location evaluation summary
- readiness evaluation summary
- profile completeness score

## Limitations

- no real AI in the first version
- no ML or LLM-based ranking
- no external AI service dependency
- no personal data inference
- no automated hiring decisions
- matching is recommendation support only
- companies and students make final decisions

## Future upgrade path

Real AI or ML can be considered later **only after enough reliable platform data exists** and only if the explainability and governance model is strong enough.

Even then:

- the current version remains rule-based
- any future upgrade must be explicitly reviewed
- recommendation explainability must remain visible
- automated hiring decisions must still not be allowed
