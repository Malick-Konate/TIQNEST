import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, isAdmin } from '../services/auth';
import './HomePage.css';

const MARQUEE_ITEMS = ['Report it', 'Track it live', 'Outage radar', 'SLA timers', 'Full history', 'One-click fixes'];

function Bolt({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 100 40" aria-hidden="true">
            <path d="M0 26 L44 10 L40 20 L100 6 L52 34 L57 23 Z" fill="currentColor" />
        </svg>
    );
}

export default function HomePage() {
    const [ticketVisible, setTicketVisible] = useState(true);
    const currentUser = getCurrentUser();
    const admin = isAdmin();

    return (
        <div className="home">
            <div className="home-rings" aria-hidden="true" />

            <Link to="/tickets" className="home-badge" aria-label="Go to tickets">
                <svg viewBox="0 0 120 120" className="home-badge-text" aria-hidden="true">
                    <defs>
                        <path id="badge-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
                    </defs>
                    <text>
                        <textPath href="#badge-circle" textLength="286" lengthAdjust="spacing">REPORT · TRACK · RESOLVE · </textPath>
                    </text>
                </svg>
                <span className="home-badge-arrow" aria-hidden="true">↓</span>
            </Link>

            <Link to="/fix" className="home-side-tab" aria-label="Open TiqFix">
                <span aria-hidden="true">🛠️</span>
            </Link>

            <div className="hero-stage">
                <h1 className="hero-title">
                    <span className="hero-line">IT help that</span>
                    <span className="hero-line">just works,</span>
                    <span className="hero-line hero-line-small">no fuss</span>
                </h1>

                {ticketVisible && <div className="hero-ticket">
                    <div className="hero-ticket-top">
                        <span aria-hidden="true">TIQ · 042</span>
                        <button type="button" className="hero-ticket-dismiss" aria-label="Dismiss ticket illustration" onClick={() => setTicketVisible(false)}>×</button>
                    </div>
                    <div aria-hidden="true">
                    <div className="hero-ticket-title">VPN down</div>
                    <div className="hero-ticket-meta">5 reports · grouped</div>
                    <div className="hero-ticket-bar"><span /></div>
                    <div className="hero-ticket-foot">⏱ 12m left</div>
                    </div>
                </div>}
            </div>

            <p className="hero-subtitle">
                {currentUser ? `Welcome back, ${currentUser.name}. ` : ''}
                Report a problem, follow it live, and know about an outage before you even ask.
            </p>

            <div className="ctaContainer">
                {admin ? (
                    <Link to="/dashboard" className="mainButton">Open dashboard</Link>
                ) : (
                    <Link to="/tickets" className="mainButton">Report a problem</Link>
                )}
                <Link to={admin ? '/tickets' : '/fix'} className="mainButton secondaryButton">
                    {admin ? 'All tickets' : 'Try TiqFix'}
                </Link>
            </div>

            <div className="home-corner home-corner-left">
                <Bolt className="home-bolt" />
                <span>Fixed<br />in minutes</span>
            </div>
            <div className="home-corner home-corner-right">
                <span>No IT team<br />required</span>
                <Bolt className="home-bolt home-bolt-flip" />
            </div>

            <div className="home-marquee" aria-hidden="true">
                <div className="home-marquee-track">
                    {[0, 1].map((copy) => (
                        <div className="home-marquee-group" key={copy}>
                            {MARQUEE_ITEMS.map((item) => (
                                <span key={item}>{item} <i>✦</i></span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
