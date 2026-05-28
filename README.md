# True Audit

True Audit is a visual CAAT (Computer-Assisted Audit Tool) for systems auditing. Its goal is to assist the audit team in the survey, organization, traceability, and substantiation of findings, without replacing the professional judgment of the auditor.

The tool works as a forensic audit file: evidence, documents, test sheets, findings, COBIT/COSO/RGSI criteria, auditee responses, timeline, visual board, and printable report.

## What problem it solves   

In a systems audit, a finding must be defensible. True Audit organizes the chain:

`evidence -> observation/test -> finding -> criterion -> risk -> recommendation -> auditee response`

The app does not invent findings, does not automatically evaluate documents, and does not replace professional judgment. It helps organize, explain, and demonstrate traceability.

## Current functional state

- Demo case `2026-014` with Banco Cordillera S.A.
- Academic content aligned to COBIT `PO1`, `PO2`, `PO3`, `PO4`, `PO7`, `ME2`.
- COSO represented by control environment, risk assessment, control activities, information and communication, and monitoring.
- RGSI represented by sections `2`, `6`, `11`, and `12`.
- In-browser editable data with `localStorage` persistence.
- Button to restore the original demo case.
- Local CRUD for evidence and findings.
- Local evidence attachments: saves metadata and, if the file does not exceed 2 MB, a downloadable local copy.
- Auditee response logging from the finding detail view.
- Simulated roles: `auditor`, `auditee`, and `demo`.
- CaseBoard connected to editable data, with a diagramming-style toolbar, shape palette, node creation, guided connectors, and persistent positions.
- Case Kanban module for evidence, findings, and responses by operational status.
- Assurance engine with finding support score, traceability gaps, framework coverage, and topological impact analysis.
- Dedicated finding defense view for oral/academic explanation.
- Assisted finding builder based on local rules and templates, without external AI services.
- Board connection reasoning log for auditable relationship justification.
- Timeline connected to the editable case with manual event entry and consolidated reasoning decisions from board connections.
- Printable report from the browser.
- Academic exports: final report PDF, finding sheet PDFs, and COBIT matrix `.xlsx`.
- Test suite with unit/component/integration/E2E tests.

## How to run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000/casos/2026-014
```

## Tests

```bash
npm run lint
npm run test:unit
npm run build
npm run test:e2e
npm run test:all
```

The suite covers:

- Unit tests for risk calculation;
- Unit tests for Kanban and exports;
- Visual component and simulated permission tests;
- Integration tests for the demo case, criteria, and relationships;
- Integration tests for internal PDF/Excel endpoints;
- E2E tests for the exposure workflow;
- Visual smoke tests for the board, Kanban, and report;
- Basic accessibility, console, and overflow checks.

## Firebase

The app works without Firebase by default. To enable Firestore persistence, copy `.env.example` to `.env.local`, fill in the variables, and use:

```env
NEXT_PUBLIC_TRUE_AUDIT_STORAGE_MODE=firebase
```

With Firebase active, True Audit saves the full case in `casos/{caseId}` and replicates subcollections for `evidencias`, `hallazgos`, `respuestasAuditado`, `timeline`, `nodosTablero`, and `conexionesTablero`. Demo/local mode continues to work as a fallback if Firebase is not configured or fails.

More detail in [docs/firebase.md](docs/firebase.md).

## Suggested demo flow

1. Open the demo file.
2. Show the case summary and metrics.
3. Go to evidence and create or edit a piece of evidence.
4. Go to findings and review a critical finding.
5. Open the finding detail and explain condition, criterion, cause, effect, conclusion, risk, and recommendation.
6. Switch to the `auditee` role and record or review a response.
7. Go to the visual board and select the finding to show its traceability.
8. Open the timeline to explain the audit process.
9. Open the Kanban to explain the operational status of evidence, findings, and responses.
10. Open the report and print/save as PDF.
11. Download the final report PDF, finding sheet PDFs, and COBIT Excel matrix.

## Current limitations

- Firestore persistence already exists but remains local-first with no real login.
- Roles are simulated, not real authentication.
- Large local attachments store only metadata to avoid saturating `localStorage`.
- PDFs and Excel files are generated via internal endpoints from the editable case sent by the browser; DOCX templates at runtime are not yet used.

## Future work

- Firebase Auth with real roles.
- Per-user change auditing.
- Stricter per-field validations.
- Real file uploads to Storage.
