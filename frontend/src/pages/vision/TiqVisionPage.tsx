import { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Nav, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ApiRequestError, isNonItError, postData } from '../../services/api-services';
import { getCurrentUser } from '../../services/auth';
import { API_URL_TICKETS } from '../../services/config';
import { getActiveIncidents, notifyOpsChanged } from '../../services/ops-service';
import { analyzeImages, classifyText, getTriageStatus } from '../../services/triage-service';
import type { Incident, Ticket } from '../../types/models';
import type { ClassifyResult, TriageAnalysis, TriageStatus } from '../../types/triage';
import '../tiqfix/TiqFix.css';
import './vision.css';
import { ClarifyNotice, NonItNotice, SecurityNotice } from './ScopeNotices';
import ScreenRecorder from './ScreenRecorder';
import ScreenshotDropzone from './ScreenshotDropzone';
import TriageResultPanel, { draftFrom, type TicketDraft } from './TriageResultPanel';

const REMEDY_TO_ISSUE: Record<string, string> = {
    'vpn-settings': 'VPN',
    'printer-check': 'PRINTER',
    'dns-flush': 'DNS',
    'browser-cache': 'BROWSER_CACHE',
};

const DEFAULT_SYSTEM: Record<string, string> = {
    VPN: 'VPN', EMAIL: 'Outlook', NETWORK: 'Network', PRINTER: 'Printer', ACCOUNT: 'User account',
    SOFTWARE: 'Software', HARDWARE: 'Hardware', OTHER: 'Unknown',
};

/** Mirrors the backend's AffectedSystemNormalizer closely enough to spot a matching active outage. */
function systemKey(raw: string): string {
    const s = ` ${raw.toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim()} `;
    if (/ VPN|GLOBALPROTECT|ANYCONNECT|FORTICLIENT/.test(s)) return 'VPN';
    if (/ OUTLOOK | EXCHANGE |^ E?MAIL $/.test(s)) return 'OUTLOOK';
    if (/ WIFI | WI FI | WIRELESS | WLAN /.test(s)) return 'WIFI';
    return s.trim();
}

function analysisFromText(r: ClassifyResult, text: string): TriageAnalysis {
    const category = r.category ?? 'OTHER';
    return {
        classification: r.classification, isITRelated: r.isITRelated, confidence: r.confidence,
        confidenceLabel: r.confidence >= 0.75 ? 'HIGH' : r.confidence >= 0.45 ? 'MEDIUM' : 'LOW',
        reason: r.reason ?? null, title: text.split('\n')[0].slice(0, 120), description: text,
        category, affectedSystem: DEFAULT_SYSTEM[category] ?? 'Unknown', visibleErrorCode: null, possibleCause: null,
        evidence: [], suggestedRemedyIds: r.suggestedRemedyIds ?? [], recommendedNextStep: r.recommendedNextStep,
        requiresUserReview: true, suggestedPriority: r.suggestedPriority, clarifyingQuestion: r.clarifyingQuestion ?? null,
        promptInjectionDetected: false, source: 'CLAUDE', demo: false, imageCount: 0,
    };
}

type InputMode = 'upload' | 'record';

export default function TiqVisionPage() {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const [status, setStatus] = useState<TriageStatus | null>(null);
    const [mode, setMode] = useState<InputMode>('upload');
    const [files, setFiles] = useState<File[]>([]);
    const [description, setDescription] = useState('');

    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<TriageAnalysis | null>(null);
    const [draft, setDraft] = useState<TicketDraft | null>(null);
    const [error, setError] = useState<ApiRequestError | null>(null);
    const [nonIt, setNonIt] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [created, setCreated] = useState<Ticket | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [incidents, setIncidents] = useState<Incident[]>([]);

    useEffect(() => {
        getTriageStatus().then(setStatus).catch(() => setStatus(null));
    }, []);

    useEffect(() => {
        if (!result) return;
        getActiveIncidents().then(setIncidents).catch(() => setIncidents([]));
    }, [result]);

    const resetResult = () => {
        setResult(null);
        setDraft(null);
        setError(null);
        setNonIt(false);
        setCreated(null);
        setSubmitError(null);
    };

    const tryAnotherPrompt = () => {
        resetResult();
        setFiles([]);
        setDescription('');
        setTimeout(() => descriptionRef.current?.focus(), 50);
    };

    const analyze = async (extraDetail?: string, demo?: string) => {
        const text = [description.trim(), extraDetail?.trim()].filter(Boolean).join('\n');
        if (extraDetail) setDescription(text);
        if (files.length === 0 && !text && !demo) {
            setError(new ApiRequestError(400, 'Attach a screenshot, record your screen, or describe the problem.'));
            return;
        }
        resetResult();
        setAnalyzing(true);
        try {
            const analysis = files.length > 0 || demo
                ? await analyzeImages(files, text, demo)
                : analysisFromText(await classifyText(text), text);
            setResult(analysis);
            setDraft(draftFrom(analysis, text));
        } catch (err) {
            if (isNonItError(err)) setNonIt(true);
            else setError(err instanceof ApiRequestError ? err : new ApiRequestError(0, (err as Error).message));
        } finally {
            setAnalyzing(false);
        }
    };

    const submitTicket = async () => {
        if (!draft || !user) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            const ticket = await postData<Ticket>(API_URL_TICKETS, {
                title: draft.title.trim(),
                description: draft.description.trim(),
                category: draft.category,
                affectedSystem: draft.affectedSystem.trim() || DEFAULT_SYSTEM[draft.category],
                priority: draft.priority,
                requesterEmail: user.email,
            });
            setCreated(ticket);
            notifyOpsChanged();
        } catch (err) {
            if (isNonItError(err)) {
                setNonIt(true);
                setResult(null);
            } else {
                setSubmitError((err as Error).message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const tryTiqFix = () => {
        if (created) {
            navigate(`/fix?ticketId=${created.id}`);
            return;
        }
        if (!result || !draft) return;
        const issue = REMEDY_TO_ISSUE[result.suggestedRemedyIds[0]] ?? '';
        const params = new URLSearchParams();
        if (issue) params.set('issueType', issue);
        params.set('description', `${draft.title}. ${draft.description}`.slice(0, 500));
        navigate(`/fix?${params.toString()}`);
    };

    const matchingIncident = draft
        ? incidents.find((i) => i.category === draft.category && systemKey(i.affectedSystem) === systemKey(draft.affectedSystem))
        : undefined;

    const step = result?.recommendedNextStep;
    const busy = analyzing || submitting;

    return (
        <Container className="py-4 tiqfix">
            <header className="tiqfix-hero mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="tiqfix-hero-icon" aria-hidden="true">👁️</div>
                    <div>
                        <h1 className="h2 mb-1 fw-bold">TiqVision — Show, Don't Type</h1>
                        <p className="mb-0 opacity-75">Upload an error screenshot. When AI analysis is enabled, get recommended fixes and an automatically prepared ticket to review and submit.</p>
                    </div>
                </div>
                <ul className="tiqfix-promises list-unstyled d-flex flex-wrap gap-2 mt-3 mb-0">
                    <li>🖼️ Screenshot or 5-second recording</li>
                    <li>✍️ You review before anything is sent</li>
                    <li>🔒 Images are analyzed, not stored</li>
                </ul>
            </header>

            <Row className="g-4">
                <Col lg={5}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h2 className="h5 mb-3">What's going wrong?</h2>
                            {status && !status.aiConfigured && (
                                <Alert variant="warning" className="small py-2">
                                    AI screenshot analysis is not configured on this server. You can still describe the problem in text.
                                </Alert>
                            )}
                            <Nav variant="pills" className="mb-3 tiqvision-tabs" activeKey={mode} onSelect={(k) => setMode((k as InputMode) ?? 'upload')}>
                                <Nav.Item><Nav.Link eventKey="upload">Upload screenshot</Nav.Link></Nav.Item>
                                <Nav.Item><Nav.Link eventKey="record">Record screen</Nav.Link></Nav.Item>
                            </Nav>
                            {mode === 'upload' ? (
                                <ScreenshotDropzone files={files} onChange={setFiles} disabled={busy} />
                            ) : (
                                <>
                                    <ScreenRecorder disabled={busy} onFrames={(frames) => { setFiles(frames); setMode('upload'); }} />
                                </>
                            )}
                            <Form.Group className="mt-3" controlId="tv-context">
                                <Form.Label className="fw-semibold">Describe the problem <span className="fw-normal text-muted">(optional with a screenshot)</span></Form.Label>
                                <Form.Control
                                    ref={descriptionRef}
                                    as="textarea"
                                    rows={3}
                                    maxLength={2000}
                                    value={description}
                                    disabled={busy}
                                    placeholder="e.g. This pops up every time I connect to the VPN"
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Form.Group>
                            <Button className="w-100 mt-3" size="lg" disabled={busy} onClick={() => analyze()}>
                                {analyzing ? <><Spinner size="sm" animation="border" className="me-2" />Analyzing…</> : '✨ Analyze'}
                            </Button>
                            {status?.demoFixturesEnabled && files.length > 0 && (
                                <Button variant="link" size="sm" className="w-100 mt-1" disabled={busy} onClick={() => analyze(undefined, 'vpn')}>
                                    Use labelled demo result instead (does not analyze the image)
                                </Button>
                            )}
                            <p className="small text-muted mt-3 mb-0">
                                Tiqnest only handles IT problems. Don't upload screenshots that show passwords or personal data.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={7}>
                    <div aria-live="polite" aria-busy={analyzing}>
                        {analyzing && (
                            <Card className="shadow-sm text-center py-5">
                                <Card.Body>
                                    <Spinner animation="border" role="status" />
                                    <p className="mt-3 mb-0 text-muted">Reading the evidence and drafting your ticket…</p>
                                </Card.Body>
                            </Card>
                        )}

                        {!analyzing && nonIt && (
                            <NonItNotice submittedText={description || '(screenshot only)'} onTryAgain={tryAnotherPrompt} />
                        )}

                        {!analyzing && error && (
                            <Alert variant={error.status === 503 || error.status === 502 ? 'warning' : 'danger'}>
                                <Alert.Heading className="h6">
                                    {error.code?.startsWith('AI_') ? 'AI analysis unavailable' : "We couldn't analyze that"}
                                </Alert.Heading>
                                {error.message}
                                {error.code?.startsWith('AI_') && (
                                    <div className="mt-2">
                                        <Button size="sm" variant="outline-dark" onClick={() => navigate('/tickets')}>Create a ticket manually</Button>
                                    </div>
                                )}
                            </Alert>
                        )}

                        {!analyzing && !result && !error && !nonIt && (
                            <Card className="shadow-sm tiqfix-empty text-center">
                                <Card.Body className="py-5">
                                    <div className="display-5 mb-2" aria-hidden="true">📸</div>
                                    <h2 className="h5">Your recommended fixes and ticket draft appear here</h2>
                                    <p className="text-muted mb-0 mx-auto" style={{ maxWidth: 440 }}>
                                        Upload a screenshot of the error or record your screen for five seconds. TiqVision reads the
                                        visible error and suggests a ticket and an approved fix. You stay in control.
                                    </p>
                                </Card.Body>
                            </Card>
                        )}

                        {!analyzing && result && draft && (
                            <div className="d-flex flex-column gap-3">
                                {created ? (
                                    <Alert variant="success" className="shadow-sm" role="status">
                                        <Alert.Heading className="h5">✅ Ticket #{created.id} submitted</Alert.Heading>
                                        {created.incidentId != null ? (
                                            <p className="mb-2">
                                                Your report was added to <strong>incident #{created.incidentId}</strong>: IT is already
                                                investigating this outage, so there's no need to report it again.
                                            </p>
                                        ) : (
                                            <p className="mb-2">The IT team has your ticket. You can follow it on the Tickets page.</p>
                                        )}
                                        <div className="d-flex flex-wrap gap-2">
                                            {result.classification === 'IT_SUPPORTED' && result.suggestedRemedyIds.length > 0 && (
                                                <Button variant="success" onClick={tryTiqFix}>🛠️ Try TiqFix for ticket #{created.id}</Button>
                                            )}
                                            <Button variant="outline-dark" onClick={() => navigate('/tickets')}>View my tickets</Button>
                                            <Button variant="link" onClick={tryAnotherPrompt}>Analyze another problem</Button>
                                        </div>
                                    </Alert>
                                ) : (
                                    <>
                                        {step === 'ESCALATE_SECURITY' && <SecurityNotice />}
                                        {step === 'CLARIFY' && result.clarifyingQuestion && (
                                            <ClarifyNotice question={result.clarifyingQuestion} busy={analyzing}
                                                           onAnswer={(detail) => analyze(detail)} />
                                        )}
                                        {matchingIncident && (
                                            <Alert variant="warning" className="shadow-sm mb-0">
                                                <strong>IT is already investigating:</strong> {matchingIncident.bannerMessage}
                                                <div className="small mt-1">You can still submit to add your report to the incident.</div>
                                            </Alert>
                                        )}
                                        <TriageResultPanel result={result} draft={draft} onDraftChange={setDraft} disabled={submitting} />
                                        {submitError && <Alert variant="danger" className="mb-0">{submitError}</Alert>}
                                        <div className="d-flex flex-wrap gap-2">
                                            {step === 'TRY_FIX' && (
                                                <Button variant="success" size="lg" disabled={submitting} onClick={tryTiqFix}>🛠️ Try TiqFix</Button>
                                            )}
                                            <Button
                                                size="lg"
                                                variant={step === 'TRY_FIX' ? 'outline-light' : step === 'ESCALATE_SECURITY' ? 'danger' : 'primary'}
                                                disabled={submitting || !draft.title.trim()}
                                                onClick={submitTicket}
                                            >
                                                {submitting && <Spinner size="sm" animation="border" className="me-2" />}
                                                {step === 'ESCALATE_SECURITY' ? '🛡️ Submit high-priority security ticket'
                                                    : step === 'TRY_FIX' ? 'Submit ticket' : '📨 Create IT ticket'}
                                            </Button>
                                            <Button variant="link" disabled={submitting} onClick={tryAnotherPrompt}>Try another image</Button>
                                        </div>
                                        {result.demo && <Badge bg="warning" text="dark">Demo data</Badge>}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
