# Tasks: Azure n8n Bereitstellungspfad

**Input**: Design documents from `/specs/20260514-azure-n8n-bereitstellung/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the documentation and operational scaffold for the Azure pre-deployment block.

- [ ] T001 Create the feature scaffold under `specs/20260514-azure-n8n-bereitstellung/` and keep `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`, and `contracts/deployment-contract.md` synchronized.
- [ ] T002 [P] Add a durable evidence template for Grant/Billing verification in `specs/20260514-azure-n8n-bereitstellung/quickstart.md`.
- [ ] T003 [P] Add a durable risk-and-blocker template in `specs/20260514-azure-n8n-bereitstellung/research.md`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the non-negotiable gates that must exist before any Azure resource work is considered ready.

- [ ] T004 Capture the Microsoft Grant/Billing status and blocker classification in `specs/20260514-azure-n8n-bereitstellung/research.md`.
- [ ] T005 [P] Record the responsible cost owner and Azure subscription mapping in `specs/20260514-azure-n8n-bereitstellung/data-model.md`.
- [ ] T006 [P] Finalize the Single-Main operating contract in `specs/20260514-azure-n8n-bereitstellung/contracts/deployment-contract.md`.
- [ ] T007 Add the explicit follow-up gate definition `DNS/HTTPS-Abnahme` to `specs/20260514-azure-n8n-bereitstellung/quickstart.md`.

**Checkpoint**: Governance and operating mode are fixed; Azure base work can now be prepared without scope creep.

---

## Phase 3: User Story 1 - Governance- und Kosten-Gate klaeren (Priority: P1) 🎯 MVP

**Goal**: Grant/Billing status is either evidenced or classified as a hard blocker, with no silent assumption of approval.

**Independent Test**: The feature is independently verifiable when the documentation contains a source, owner, status, and blocker reason for the Microsoft cost gate.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Document the Grant status source and verification path in `specs/20260514-azure-n8n-bereitstellung/research.md`.
- [ ] T009 [P] [US1] Document the Billing owner and subscription mapping in `specs/20260514-azure-n8n-bereitstellung/data-model.md`.
- [ ] T010 [US1] Record the final blocker or approval verdict in `specs/20260514-azure-n8n-bereitstellung/contracts/deployment-contract.md`.

**Checkpoint**: The governance gate is unambiguous and can be audited without reading any other story.

---

## Phase 4: User Story 2 - Single-Main Betriebsmodus festziehen (Priority: P1)

**Goal**: The operating contract clearly states Single-Main as the only current mode and blocks queue-mode drift.

**Independent Test**: The contract can be read independently and the only allowed operating mode is Single-Main.

### Implementation for User Story 2

- [ ] T011 [P] [US2] Add the Single-Main mode definition and invariants to `specs/20260514-azure-n8n-bereitstellung/spec.md`.
- [ ] T012 [P] [US2] Add the explicit non-goals for queue-mode, reverse proxy, DNS cutover, and HTTPS acceptance to `specs/20260514-azure-n8n-bereitstellung/contracts/deployment-contract.md`.
- [ ] T013 [US2] Update `specs/20260514-azure-n8n-bereitstellung/quickstart.md` so the next gate is always DNS/HTTPS-Abnahme.

**Checkpoint**: Single-Main is the only documented operating posture for this block.

---

## Phase 5: User Story 3 - Azure-Basis und VM-Hardening vorbereiten (Priority: P1)

**Goal**: The Azure base is prepared with a static IP, minimal NSG surface, and a hardened Ubuntu VM.

**Independent Test**: The story is independently verifiable when the planned resource set, hardening baseline, and runtime prep are documented with clear success criteria.

### Implementation for User Story 3

- [ ] T014 [P] [US3] Define the Azure resource set and naming in `specs/20260514-azure-n8n-bereitstellung/data-model.md`.
- [ ] T015 [P] [US3] Define the NSG and port invariants in `specs/20260514-azure-n8n-bereitstellung/contracts/deployment-contract.md`.
- [ ] T016 [P] [US3] Document the VM hardening baseline in `specs/20260514-azure-n8n-bereitstellung/data-model.md`.
- [ ] T017 [P] [US3] Document the Docker Engine and Compose readiness baseline in `specs/20260514-azure-n8n-bereitstellung/quickstart.md`.
- [ ] T018 [US3] Capture the blocked ports No-Go rule for 5678, 5432, and 6379 in `specs/20260514-azure-n8n-bereitstellung/contracts/deployment-contract.md`.

**Checkpoint**: The pre-deployment Azure base is ready to be executed later without widening the scope.

## Phase 6: User Story 4 - Nachweis, Restrisiken und Folge-Gate dokumentieren (Priority: P2)

**Goal**: The handoff clearly lists what exists, what remains blocked, and which follow-up gate comes next.

**Independent Test**: The handoff can be checked independently by reading the evidence log and verifying that the next gate is DNS/HTTPS-Abnahme.

### Implementation for User Story 4

- [ ] T019 [P] [US4] Add the EvidenceLog structure and contents to `specs/20260514-azure-n8n-bereitstellung/data-model.md`.
- [ ] T020 [P] [US4] Add the restriction that DNS, HTTPS, reverse proxy, production n8n, queue-mode, and backup expansion remain out of scope in `specs/20260514-azure-n8n-bereitstellung/contracts/deployment-contract.md`.
- [ ] T021 [US4] Finalize the follow-up gate wording and handoff checklist in `specs/20260514-azure-n8n-bereitstellung/quickstart.md`.
- [ ] T022 [US4] Review the final documentation set for consistency across `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, and `contracts/deployment-contract.md`.

**Checkpoint**: The block is closed with a clean handoff and a clearly named next phase.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Clean up the documentation set and remove ambiguity.

- [ ] T023 [P] Tighten wording so Single-Main remains explicit across all docs in `specs/20260514-azure-n8n-bereitstellung/`.
- [ ] T024 [P] Ensure no doc in `specs/20260514-azure-n8n-bereitstellung/` implies DNS cutover or HTTPS acceptance.
- [ ] T025 [P] Align the contract and quickstart with the non-goals already stated in `spec.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all story work.
- **User Stories (Phase 3+)**: Depend on the Foundational phase completion.
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after the foundational governance scaffold is in place.
- **User Story 2 (P1)**: Can start after the foundational governance scaffold is in place.
- **User Story 3 (P1)**: Can start after the governance scaffold is in place.
- **User Story 4 (P2)**: Can start after the earlier stories have established the evidence and block boundaries.

### Parallel Opportunities

- Tasks marked [P] can be worked on in parallel if they touch different sections.
- Governance, contract, and quickstart updates can be sequenced independently once the plan is stable.

## Implementation Strategy

### MVP First (User Stories 1 and 2)

1. Complete Setup and Foundational phases.
2. Complete User Story 1 and User Story 2.
3. Stop and verify that the governance gate and Single-Main contract are explicit.
4. Only then continue with Azure base and hardening work.

### Incremental Delivery

1. Governance and cost gate.
2. Single-Main operating contract.
3. Azure base and VM hardening.
4. Evidence log and follow-up gate.

### Notes

- The task list intentionally mirrors the phase-gated scope from the spec.
- DNS/HTTPS, reverse proxy, production n8n, queue-mode, and backup expansion remain excluded until the next block.
