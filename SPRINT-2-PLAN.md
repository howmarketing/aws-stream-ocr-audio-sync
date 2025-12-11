# Sprint 2 - Implementation Plan
## OCR & Sync Engine

**Sprint Duration**: 2-3 weeks (estimated)
**Start Date**: December 11, 2025
**Sprint Goal**: Implement OCR-based scoreboard detection and audio synchronization engine
**Dependencies**: Sprint 1 complete ✅

---

## Sprint Objectives

### Primary Goals
1. ✅ **OCR Service**: Implement Tesseract-based scoreboard image recognition
2. ✅ **Sync Engine**: Build timestamp matching and offset calculation algorithm
3. ✅ **Frontend Integration**: Add OCR upload and sync UI to player
4. ✅ **End-to-End Flow**: Complete user journey from image capture to synced playback

### Secondary Goals
5. **Testing**: Add unit tests for OCR parsing and sync algorithm
6. **Error Handling**: Implement comprehensive error recovery
7. **Documentation**: Update docs with OCR/Sync architecture
8. **UX Polish**: Improve player controls and sync feedback

---

## Task Breakdown

### Total Sprint 2 Tasks: **~110 tasks** (from TODO.md Phases 4-5, plus testing/docs)

---

## **PHASE 4: OCR SERVICE IMPLEMENTATION** (28 tasks)

### 4.1 — OCR Container Setup (7 tasks)

- [ ] **Task 1**: Create `streaming/ocr/` directory structure
- [ ] **Task 2**: Create Dockerfile with Tesseract installation
  - Base image: Ubuntu 22.04 or Alpine with Tesseract packages
  - Install `tesseract-ocr` and `tesseract-ocr-eng` language pack
  - Install Node.js 20 runtime
- [ ] **Task 3**: Install Sharp for image preprocessing (`npm install sharp`)
- [ ] **Task 4**: Create entrypoint script for OCR processing
- [ ] **Task 5**: Configure whitelist for digits + colon (`:0123456789`)
- [ ] **Task 6**: Create volume mounts:
  - `/ocr/input` (read-only) - uploaded images
  - `/ocr/output` (write) - OCR results
- [ ] **Task 7**: Add OCR service to docker-compose.yml with health check

**Deliverable**: OCR container running and accessible

---

### 4.2 — Image Preprocessing (6 tasks)

- [ ] **Task 8**: Install Sharp library (`npm install sharp @types/node`)
- [ ] **Task 9**: Create `src/preprocessing.ts` module
- [ ] **Task 10**: Implement grayscale conversion
  ```typescript
  image.grayscale()
  ```
- [ ] **Task 11**: Implement threshold/binarization for better OCR accuracy
  ```typescript
  image.threshold(128)  // Convert to black & white
  ```
- [ ] **Task 12**: Implement denoise filter
  ```typescript
  image.median(3)  // Remove noise
  ```
- [ ] **Task 13**: Implement resize for optimal Tesseract processing
  ```typescript
  image.resize({ width: 1920, fit: 'inside' })
  ```

**Deliverable**: Image preprocessing pipeline

---

### 4.3 — OCR Execution (6 tasks)

- [ ] **Task 14**: Install node-tesseract-ocr (`npm install node-tesseract-ocr`)
- [ ] **Task 15**: Create `src/ocr.ts` module
- [ ] **Task 16**: Execute Tesseract with whitelist configuration
  ```typescript
  tesseract.recognize(imagePath, {
    lang: 'eng',
    tessedit_char_whitelist: ':0123456789',
    psm: 7  // Single line of text
  })
  ```
- [ ] **Task 17**: Parse raw OCR output
- [ ] **Task 18**: Apply regex matchers for score/clock formats:
  - Clock: `MM:SS` or `M:SS` (e.g., `12:34`, `2:45`)
  - Score: `##-##` (e.g., `21-17`, `7-0`)
- [ ] **Task 19**: Calculate confidence score based on:
  - Tesseract confidence value
  - Regex match success
  - Plausibility checks (clock ≤ 60:00, score ≤ 99)
- [ ] **Task 20**: Return cleaned JSON response:
  ```json
  {
    "clock": "12:34",
    "score": { "home": 21, "away": 17 },
    "confidence": 0.92,
    "rawText": "12:34\n21-17",
    "metadata": { "processingTime": 234 }
  }
  ```

**Deliverable**: Working OCR execution engine

---

### 4.4 — OCR Testing (4 tasks)

- [ ] **Task 21**: Create test image dataset in `test/fixtures/`
  - Valid scoreboards (10 samples)
  - Blurry images (5 samples)
  - Invalid formats (5 samples)
- [ ] **Task 22**: Add unit tests for preprocessing pipeline
- [ ] **Task 23**: Add integration tests for OCR with known samples
- [ ] **Task 24**: Add malformed input tests (corrupted images, non-image files)

**Deliverable**: OCR test suite with >80% accuracy on test set

---

### 4.5 — OCR API Integration (5 tasks)

- [ ] **Task 25**: Create `backend/src/domains/ocr/` module
- [ ] **Task 26**: Add controller `POST /api/ocr`
  - Accept multipart/form-data file upload
  - Validate file type (JPEG, PNG only)
  - Max file size: 10MB
- [ ] **Task 27**: Add service to forward image to OCR container
- [ ] **Task 28**: Add error handling:
  - File upload errors
  - OCR container unreachable
  - OCR low confidence (<0.5)
  - Parsing failures
- [ ] **Task 29**: Return structured response to frontend

**Deliverable**: Backend OCR endpoint functional

---

## **PHASE 5: SYNC ENGINE IMPLEMENTATION** (41 tasks)

### 5.1 — Core Sync Algorithm (8 tasks)

- [ ] **Task 30**: Create `backend/src/domains/sync/` module
- [ ] **Task 31**: Add controller `POST /api/sync`
  - Accept JSON body: `{ "clock": "12:34", "score": {...} }`
- [ ] **Task 32**: Create `ClockNormalizer` service
  - Convert `MM:SS` → total seconds
  - Handle edge cases: `0:59`, `60:00`, etc.
- [ ] **Task 33**: Create `PeriodResolver` service (optional for now)
  - Infer period from clock (1st half, 2nd half, overtime)
  - For MVP: assume single continuous stream
- [ ] **Task 34**: Create `TimestampSearcher` service
  - Load segments from index DB within time window
  - Implement binary search for O(log n) lookup
- [ ] **Task 35**: Implement closest match selection
  - If exact match: return immediately
  - If approximate: calculate drift tolerance
  - Return best match within ±5 seconds
- [ ] **Task 36**: Calculate audio offset
  ```typescript
  offset = segment.start + (clockInSeconds % segment.duration)
  ```
- [ ] **Task 37**: Build sync response:
  ```json
  {
    "success": true,
    "timestamp": 245.6,  // Seconds into stream
    "segmentFilename": "segment122.ts",
    "segmentSequence": 122,
    "confidence": 0.89,
    "drift": 0.4,  // Seconds of drift
    "metadata": {
      "clockInput": "12:34",
      "clockSeconds": 754,
      "searchedSegments": 30
    }
  }
  ```

**Deliverable**: Working sync algorithm

---

### 5.2 — Confidence Scoring (5 tasks)

- [ ] **Task 38**: Create `ConfidenceCalculator` service
- [ ] **Task 39**: Weigh OCR confidence (40% weight)
- [ ] **Task 40**: Weigh clock plausibility (30% weight)
  - Valid range: 0:00 to 60:00
  - Deduct points for unusual values
- [ ] **Task 41**: Weigh time drift (20% weight)
  - Lower confidence if drift > 2 seconds
- [ ] **Task 42**: Weigh segment continuity (10% weight)
  - Check if neighboring segments exist
- [ ] **Task 43**: Return final weighted confidence (0.0-1.0)

**Deliverable**: Confidence scoring system

---

### 5.3 — Edge Cases & Error Handling (7 tasks)

- [ ] **Task 44**: Handle overtime periods
  - Detect clocks > 45:00 (soccer) or > 12:00 (basketball)
  - Adjust search window accordingly
- [ ] **Task 45**: Handle game resets
  - Detect clock returning to 0:00
  - Consider period boundaries
- [ ] **Task 46**: Handle negative/invalid timestamps
  - Return error with helpful message
- [ ] **Task 47**: Handle stale index DB
  - Check last segment timestamp
  - Warn if index is >5 minutes old
- [ ] **Task 48**: Handle missing segments
  - If no segments in time window, return live edge
- [ ] **Task 49**: Handle corrupted segments
  - Skip segments with invalid metadata
- [ ] **Task 50**: Fallback to live edge
  - If confidence < 0.5, suggest live playback instead

**Deliverable**: Robust error handling

---

### 5.4 — Sync Testing (4 tasks)

- [ ] **Task 51**: Add unit tests for clock normalization
  - Test cases: `0:59`, `12:34`, `45:00`, `60:00`, `99:99` (invalid)
- [ ] **Task 52**: Add unit tests for timestamp search
  - Mock segment database
  - Test exact matches, approximate matches, no matches
- [ ] **Task 53**: Add integration tests with real segments
  - Pre-populate test database with 100 segments
  - Test sync accuracy ±1 second
- [ ] **Task 54**: Add end-to-end sync flow test
  - Upload test image → OCR → Sync → Verify offset

**Deliverable**: Sync engine test suite

---

### 5.5 — Sync API Finalization (3 tasks)

- [ ] **Task 55**: Add rate limiting to prevent abuse (5 requests/minute)
- [ ] **Task 56**: Add logging for sync requests
  ```typescript
  logger.info('Sync request', {
    clock, score, confidence, timestamp, duration: 234
  })
  ```
- [ ] **Task 57**: Add Swagger/OpenAPI documentation for `/api/sync`

**Deliverable**: Production-ready sync API

---

## **PHASE 3 (CONTINUED): FRONTEND INTEGRATION** (24 tasks)

### 3.3 — OCR Flow (9 tasks)

- [ ] **Task 58**: Create `app/ocr/page.tsx` route
- [ ] **Task 59**: Add `<ImageUploader />` component
  - File input with drag-and-drop
  - Client-side validation (JPEG/PNG, <10MB)
  - Image preview before upload
- [ ] **Task 60**: Add `<OcrResult />` component to display:
  - Detected clock
  - Detected score
  - Confidence meter (visual bar)
- [ ] **Task 61**: Create `useOcr` hook
  ```typescript
  const { upload, result, loading, error } = useOcr();
  ```
- [ ] **Task 62**: Implement POST to `/api/ocr`
- [ ] **Task 63**: Add loading skeleton while processing
- [ ] **Task 64**: Add error messages for failures
  - Upload failed
  - OCR confidence too low
  - Network error
- [ ] **Task 65**: Add "Retake Photo" button
- [ ] **Task 66**: Add success animation (fade-in result)

**Deliverable**: OCR upload flow complete

---

### 3.4 — Sync Flow (9 tasks)

- [ ] **Task 67**: Update player page to include sync UI
- [ ] **Task 68**: Add "Sync with Scoreboard" button to player
- [ ] **Task 69**: Create `<SyncModal />` component:
  - Shows OCR results for confirmation
  - Allow manual clock adjustment if OCR is wrong
  - "Confirm & Sync" button
- [ ] **Task 70**: Create `useSync` hook
  ```typescript
  const { sync, syncing, syncResult, error } = useSync();
  ```
- [ ] **Task 71**: Implement POST to `/api/sync`
- [ ] **Task 72**: Apply sync offset to player
  ```typescript
  audioRef.current.currentTime = syncResult.timestamp;
  ```
- [ ] **Task 73**: Display "Synced" badge
  - Show sync status (synced, drift warning, unsynced)
  - Show sync confidence
- [ ] **Task 74**: Add success animation (checkmark + fade)
- [ ] **Task 75**: Handle sync failures gracefully

**Deliverable**: Player sync integration complete

---

### 3.5 — Player UX Enhancements (6 tasks)

- [ ] **Task 76**: Add jump controls UI
  - Buttons: +1.5s, -1.5s, +10s, -10s
  - Keyboard shortcuts: ←/→ for ±1.5s, Shift+←/→ for ±10s
- [ ] **Task 77**: Add latency indicator
  - Calculate: `liveedge - currentTime`
  - Display: "Live -3.2s" or "Live" if <1s
- [ ] **Task 78**: Add keyboard shortcuts
  - Space: Play/Pause
  - ←/→: Jump ±1.5s
  - Shift+←/→: Jump ±10s
  - L: Jump to live edge
- [ ] **Task 79**: Improve accessibility
  - ARIA labels for all buttons
  - Keyboard navigation
  - Screen reader support
- [ ] **Task 80**: Add dark mode toggle
- [ ] **Task 81**: Polish loading states and transitions

**Deliverable**: Enhanced player UX

---

## **TESTING & QUALITY** (18 tasks)

### Backend Testing

- [ ] **Task 82**: Add unit tests for OCR parser
- [ ] **Task 83**: Add unit tests for clock normalization
- [ ] **Task 84**: Add unit tests for sync algorithm
- [ ] **Task 85**: Add E2E test for `/api/ocr`
- [ ] **Task 86**: Add E2E test for `/api/sync`
- [ ] **Task 87**: Add mock OCR container for tests
- [ ] **Task 88**: Add test database with sample segments

### Frontend Testing

- [ ] **Task 89**: Add React Testing Library tests for OCR component
- [ ] **Task 90**: Add React Testing Library tests for Sync component
- [ ] **Task 91**: Add Playwright E2E test for OCR flow
- [ ] **Task 92**: Add Playwright E2E test for Sync flow
- [ ] **Task 93**: Add mock API server for frontend tests

### Integration Testing

- [ ] **Task 94**: Add full end-to-end sync flow test
  - Upload image → OCR → Sync → Play at offset
- [ ] **Task 95**: Add error recovery tests
- [ ] **Task 96**: Add performance tests (sync <500ms)

### Manual Testing

- [ ] **Task 97**: Test with real sports screenshots (10+ samples)
- [ ] **Task 98**: Test sync accuracy (±1 second target)
- [ ] **Task 99**: Test with various image qualities

**Deliverable**: Comprehensive test coverage

---

## **DOCUMENTATION** (9 tasks)

- [ ] **Task 100**: Update SETUP.md with OCR service setup
- [ ] **Task 101**: Update RUN.md with OCR/Sync testing instructions
- [ ] **Task 102**: Create `docs/OCR_ARCHITECTURE.md`
  - Tesseract configuration
  - Preprocessing pipeline
  - Confidence scoring
- [ ] **Task 103**: Create `docs/SYNC_ALGORITHM.md`
  - Clock normalization
  - Timestamp search
  - Offset calculation
  - Edge cases
- [ ] **Task 104**: Create API documentation
  - POST /api/ocr
  - POST /api/sync
  - Request/response schemas
- [ ] **Task 105**: Create user guide
  - How to upload scoreboard image
  - How to sync playback
  - Troubleshooting tips
- [ ] **Task 106**: Update docker-compose.yml comments
- [ ] **Task 107**: Create sequence diagrams
  - OCR flow
  - Sync flow
- [ ] **Task 108**: Update README.md with Sprint 2 features

**Deliverable**: Updated documentation

---

## **FINALIZATION** (2 tasks)

- [ ] **Task 109**: Code review and refactoring
- [ ] **Task 110**: Sprint 2 retrospective and review document

---

## Success Criteria

### Functional Requirements

✅ **OCR Service**:
- [ ] Accepts JPEG/PNG images
- [ ] Returns clock in MM:SS format
- [ ] Returns score (home-away)
- [ ] Confidence score ≥0.8 for good images
- [ ] Processes image in <2 seconds

✅ **Sync Engine**:
- [ ] Converts clock to stream timestamp
- [ ] Finds matching segment with ±1 second accuracy
- [ ] Returns sync offset
- [ ] Handles edge cases gracefully
- [ ] Sync completes in <500ms

✅ **Frontend**:
- [ ] Image upload with preview
- [ ] OCR result display
- [ ] Sync confirmation UI
- [ ] Player seeks to synced timestamp
- [ ] Success/error feedback

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| OCR Processing Time | <2s | Time from upload to result |
| Sync Calculation Time | <500ms | Time from request to response |
| Sync Accuracy | ±1s | Offset vs actual timestamp |
| OCR Confidence (good images) | >0.8 | Average across test set |
| End-to-End Sync Flow | <5s | Upload to synced playback |

### Quality Gates

- [ ] All new code has TypeScript types
- [ ] All new features have unit tests
- [ ] E2E flows have integration tests
- [ ] Documentation updated
- [ ] No regressions in Sprint 1 features
- [ ] Code reviewed and refactored

---

## Dependencies & Prerequisites

### Required from Sprint 1
- ✅ Streaming pipeline operational
- ✅ Index database populated
- ✅ Backend API serving
- ✅ Frontend player working
- ✅ Docker environment stable

### New Dependencies (to install)
- `tesseract-ocr` (OCR engine)
- `sharp` (image preprocessing)
- `node-tesseract-ocr` (Node.js wrapper)
- Testing libraries (Jest, Playwright, React Testing Library)

### External Resources Needed
- Sample scoreboard images for testing (10-20 screenshots)
- Test database with known segment timestamps
- Optional: Real sports broadcast for end-to-end testing

---

## Risk Assessment

### High Risk
1. **OCR Accuracy**: Tesseract may struggle with low-quality images
   - **Mitigation**: Robust preprocessing, fallback to manual input
2. **Clock Format Variations**: Different sports use different formats
   - **Mitigation**: Start with one sport (soccer), expand later

### Medium Risk
3. **Sync Algorithm Complexity**: Edge cases may be hard to handle
   - **Mitigation**: Extensive testing, graceful fallbacks
4. **Performance**: OCR processing may be slow
   - **Mitigation**: Optimize preprocessing, add loading indicators

### Low Risk
5. **Docker Container Integration**: OCR service may have startup issues
   - **Mitigation**: Health checks, clear error messages

---

## Sprint 2 Timeline (Estimated)

### Week 1: OCR Service (Tasks 1-29)
- **Days 1-2**: Container setup & preprocessing
- **Days 3-4**: OCR execution & API
- **Day 5**: Testing & integration

### Week 2: Sync Engine (Tasks 30-57)
- **Days 1-2**: Core algorithm & confidence
- **Days 3-4**: Edge cases & API
- **Day 5**: Testing

### Week 3: Frontend & Polish (Tasks 58-110)
- **Days 1-2**: OCR/Sync UI components
- **Days 3-4**: Testing & documentation
- **Day 5**: Review & retrospective

---

## Definition of Done

Sprint 2 is complete when:
- [ ] All 110 tasks completed
- [ ] All tests passing (unit, integration, E2E)
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] No known P0/P1 bugs
- [ ] Performance targets met
- [ ] User can complete full sync flow:
  1. Upload scoreboard image
  2. View OCR results
  3. Sync player
  4. Playback at correct timestamp

---

## Next Sprint Preview: Sprint 3

**Potential Focus Areas**:
1. **Production Deployment** (AWS, Vercel, etc.)
2. **Monitoring & Observability** (Metrics, logs, alerts)
3. **Performance Optimization** (CDN, caching, compression)
4. **Mobile Support** (Responsive UI, PWA)
5. **Advanced Features** (Multi-language, multiple sports, analytics)

---

**Prepared by**: Claude Code
**Planning Date**: December 11, 2025
**Sprint Start**: TBD (pending Sprint 1 commit)
