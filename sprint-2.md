# Sprint 2 - OCR & Sync Engine
**Audio Sync Platform Development**

---

## Sprint Overview

**Sprint Goal**: Implement OCR-based scoreboard detection and audio synchronization engine
**Duration**: 2-3 weeks
**Start Date**: December 11, 2025
**Status**: 🟢 In Progress

**Dependencies**:
- ✅ Sprint 1 Complete (Streaming pipeline operational)
- ✅ Local MP3 file configured and streaming
- ✅ HLS segments generating at 2s intervals
- ✅ Segment index database populated

---

## What We're Building

### User Journey
1. **User captures screenshot** of sports broadcast scoreboard while watching
2. **User uploads image** to the platform
3. **OCR extracts** game clock (e.g., "12:34") and score (e.g., "21-17")
4. **Sync engine finds** matching timestamp in audio stream
5. **Player jumps** to exact moment in recording
6. **User listens** to commentary synced with their screenshot

### Technical Flow
```
Screenshot Upload
    ↓
Image Preprocessing (Sharp)
    ↓
OCR Processing (Tesseract)
    ↓
Clock Extraction (MM:SS)
    ↓
Timestamp Search (Index DB)
    ↓
Sync Offset Calculation
    ↓
Player Seek to Timestamp
```

---

## Sprint Phases

### 📦 Phase 4: OCR Service (29 tasks)
**Goal**: Build Tesseract-based OCR container that extracts game clock and score from images

**Key Deliverables**:
- OCR Docker container with Tesseract installed
- Image preprocessing pipeline (grayscale, threshold, denoise, resize)
- OCR execution with regex parsing for clock (MM:SS) and score (##-##)
- Confidence scoring system
- Backend API endpoint: `POST /api/ocr`

**Success Criteria**:
- ✅ Accepts JPEG/PNG images up to 10MB
- ✅ Returns clock in MM:SS format
- ✅ Confidence score ≥0.8 for clear images
- ✅ Processing time <2 seconds

---

### 🔄 Phase 5: Sync Engine (41 tasks)
**Goal**: Build timestamp matching algorithm that finds audio offset from game clock

**Key Deliverables**:
- Clock normalization service (MM:SS → seconds)
- Timestamp search algorithm (binary search in segment index)
- Offset calculation with drift tolerance
- Confidence scoring (OCR quality + time drift + segment continuity)
- Edge case handling (overtime, invalid clocks, missing segments)
- Backend API endpoint: `POST /api/sync`

**Success Criteria**:
- ✅ Sync accuracy within ±1 second
- ✅ Calculation time <500ms
- ✅ Handles edge cases gracefully
- ✅ Returns confidence score and metadata

---

### 🎨 Phase 3 (Continued): Frontend Integration (24 tasks)
**Goal**: Build user-friendly OCR upload and sync UI

**Key Deliverables**:
- Image upload component with drag-and-drop
- OCR result display with confidence meter
- Sync confirmation modal
- Player controls enhancement (jump buttons, keyboard shortcuts)
- Sync status indicator
- Success animations and error handling

**Success Criteria**:
- ✅ Intuitive upload flow
- ✅ Clear OCR results display
- ✅ One-click sync to playback
- ✅ Responsive and accessible UI

---

### 🧪 Phase 6: Testing & Documentation (28 tasks)
**Goal**: Ensure quality and maintainability

**Key Deliverables**:
- Unit tests for OCR parser and sync algorithm
- Integration tests for API endpoints
- E2E tests for full sync flow
- Performance tests (OCR <2s, sync <500ms)
- Architecture documentation
- API documentation
- User guide

**Success Criteria**:
- ✅ Test coverage for critical paths
- ✅ All tests passing
- ✅ Documentation complete
- ✅ Performance targets met

---

## Implementation Timeline

### Week 1: OCR Service Foundation
**Days 1-2**: Container setup and preprocessing
- Task 1-7: OCR container with Tesseract
- Task 8-13: Image preprocessing pipeline (Sharp)

**Days 3-4**: OCR execution and parsing
- Task 14-20: Tesseract execution with regex matchers
- Task 21-24: OCR testing with sample images

**Day 5**: Backend integration
- Task 25-29: API endpoint and error handling

**Milestone**: `POST /api/ocr` accepting images and returning clock/score

---

### Week 2: Sync Engine Implementation
**Days 1-2**: Core algorithm
- Task 30-37: Clock normalization and timestamp search
- Task 38-43: Confidence scoring system

**Days 3-4**: Edge cases and API
- Task 44-50: Handle overtime, invalid clocks, missing segments
- Task 51-54: Sync testing with mock data

**Day 5**: API finalization
- Task 55-57: Rate limiting, logging, documentation

**Milestone**: `POST /api/sync` returning accurate timestamps

---

### Week 3: Frontend & Quality
**Days 1-2**: UI components
- Task 58-66: OCR upload flow
- Task 67-75: Sync modal and player integration

**Days 3-4**: Testing and polish
- Task 76-81: Player enhancements (jump controls, shortcuts)
- Task 82-99: Test suites (unit, integration, E2E)

**Day 5**: Documentation and review
- Task 100-110: Architecture docs, API docs, retrospective

**Milestone**: End-to-end sync flow complete and tested

---

## Key Technical Decisions

### OCR Engine: Tesseract
**Why**: Open-source, Docker-friendly, good accuracy for printed text
**Configuration**:
- Whitelist: `:0123456789` (digits and colon only)
- PSM mode: 7 (single line of text)
- Language: English

### Image Preprocessing: Sharp
**Why**: Fast, low-memory, Node.js native
**Pipeline**:
1. Grayscale conversion
2. Threshold/binarization (black & white)
3. Median filter (denoise)
4. Resize to optimal resolution

### Sync Algorithm: Binary Search
**Why**: O(log n) performance on sorted segment index
**Approach**:
- Convert clock (MM:SS) to total seconds
- Search segment index for matching timestamp range
- Calculate offset within segment
- Return exact playback position

### Confidence Scoring: Weighted Factors
**Weights**:
- 40% OCR confidence (Tesseract accuracy)
- 30% Clock plausibility (valid range 0:00-60:00)
- 20% Time drift (lower if drift >2s)
- 10% Segment continuity (neighboring segments exist)

---

## Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| OCR Processing | <2s | TBD | ⏳ Pending |
| Sync Calculation | <500ms | TBD | ⏳ Pending |
| Sync Accuracy | ±1s | TBD | ⏳ Pending |
| OCR Confidence | >0.8 | TBD | ⏳ Pending |
| End-to-End Flow | <5s | TBD | ⏳ Pending |

---

## Success Criteria

### Functional Requirements
- [ ] User can upload scoreboard screenshot
- [ ] OCR extracts clock and score accurately
- [ ] Sync engine finds matching timestamp
- [ ] Player seeks to correct audio position
- [ ] UI provides clear feedback throughout flow

### Quality Requirements
- [ ] All new code has TypeScript types
- [ ] Critical paths have unit tests
- [ ] E2E flow has integration test
- [ ] Documentation updated
- [ ] No regressions in Sprint 1 features

### Performance Requirements
- [ ] OCR processes image in <2 seconds
- [ ] Sync calculates offset in <500ms
- [ ] Sync accuracy within ±1 second
- [ ] End-to-end flow completes in <5 seconds

---

## Risks & Mitigations

### High Risk
**OCR Accuracy Varies by Image Quality**
- **Impact**: Low confidence scores, incorrect sync
- **Mitigation**: Robust preprocessing, manual clock input fallback, confidence threshold warnings

**Clock Format Variations Across Sports**
- **Impact**: Regex matchers may not work for all sports
- **Mitigation**: Start with one sport (soccer/football), expand patterns incrementally

### Medium Risk
**Sync Algorithm Edge Cases**
- **Impact**: Incorrect timestamps for overtime, halftime, etc.
- **Mitigation**: Extensive testing, graceful fallbacks to live edge

**OCR Processing Performance**
- **Impact**: Slow user experience if >2s
- **Mitigation**: Optimize preprocessing, show progress indicators

### Low Risk
**Docker Container Integration**
- **Impact**: OCR service may not communicate with backend
- **Mitigation**: Health checks, clear error messages, volume mount testing

---

## Definition of Done

Sprint 2 is complete when:
- [ ] All 110 tasks completed
- [ ] All tests passing (unit, integration, E2E)
- [ ] Documentation updated (architecture, API, user guide)
- [ ] Code reviewed and refactored
- [ ] Performance targets met
- [ ] No known P0/P1 bugs
- [ ] User can complete full sync flow:
  1. Upload scoreboard screenshot
  2. View OCR results (clock + score)
  3. Confirm and sync player
  4. Listen to audio at correct timestamp

---

## Team & Resources

**Developer**: Claude Code + User
**Testing**: Manual + Automated
**Documentation**: Inline + Markdown docs

**External Dependencies**:
- Tesseract OCR (open-source)
- Sharp library (npm package)
- Sample scoreboard images for testing

---

## Sprint 2 Tracking

**Total Tasks**: 110
**Completed**: 0
**In Progress**: 0
**Blocked**: 0

**Current Phase**: Phase 4.1 (OCR Container Setup)
**Next Milestone**: OCR container running and processing images

---

## Daily Progress Log

### Day 1 - December 11, 2025
**Focus**: OCR Container Setup
**Tasks**: 1-7 (Container, Dockerfile, docker-compose integration)
**Status**: Starting
**Notes**: Sprint 1 complete, local MP3 streaming verified

---

## References

- **Sprint 1 Review**: `SPRINT-1-REVIEW.md`
- **Full Task List**: `SPRINT-2-PLAN.md`
- **Setup Guide**: `SETUP.md`
- **Runtime Guide**: `RUN.md`

---

**Last Updated**: December 11, 2025
**Next Review**: End of Week 1 (OCR service completion)
