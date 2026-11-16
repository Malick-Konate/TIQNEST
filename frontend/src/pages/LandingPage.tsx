import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, isAdmin } from '../services/auth';
import './LandingPage.css';

const features = [
    { icon: '↗', name: 'Smart ticket management', tag: 'LESS BACK AND FORTH', text: 'Report technical problems, track ticket progress and keep your support requests organized.' },
    { icon: '✳', name: 'TiqFix', tag: 'A LITTLE GUIDANCE. A LOT LESS GUESSWORK.', text: 'Get guided, IT-approved steps for VPN disconnections, printer issues, browser cache problems and network connectivity. You choose each step; no commands run silently and a repair is never assumed successful.' },
    { icon: '◎', name: 'TiqRadar', tag: 'SEE THE BIGGER PICTURE', text: 'When multiple employees report similar technical problems, Tiqnest can group them into one incident. A live outage banner keeps employees informed while administrators investigate from their dashboard.' },
    { icon: '⌘', name: 'TiqVision', tag: 'AI SCREENSHOT TRIAGE · PROTOTYPE', text: 'Upload an error screenshot to get AI-recommended troubleshooting and an automatically prepared ticket when AI analysis is enabled. Review the details, then submit. AI screenshot analysis is currently unavailable on the public demo.' },
    { icon: '▦', name: 'Admin dashboard', tag: 'ONE CLEAR VIEW', text: 'Monitor incidents, prioritize support tickets and track progress from one place, with SLA visibility and status history.' },
];
const steps = [ ['Report', 'Describe your IT issue and submit a ticket.'], ['Troubleshoot', 'Try safe, guided fixes or let the IT team investigate.'], ['Stay informed', 'Track progress and see alerts when an outage affects multiple users.'] ];

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const signedIn = !!getCurrentUser();
    const destination = signedIn ? (isAdmin() ? '/dashboard' : '/home') : '/login';
    const cta = signedIn ? 'Open Dashboard' : 'Get Started';
    const closeMenu = () => setMenuOpen(false);
    return (
        <div className="landing" id="top">
            <a className="lp-skip" href="#main-content">Skip to content</a>
            <header className="lp-header">
                <a href="#top" className="lp-brand" aria-label="Tiqnest homepage">TIQNEST<span aria-hidden="true">✳</span></a>
                <button className="lp-menu" type="button" aria-expanded={menuOpen} aria-controls="public-nav" onClick={() => setMenuOpen(!menuOpen)} onKeyDown={e => { if (e.key === 'Escape') closeMenu(); }}>{menuOpen ? 'Close ×' : 'Menu +'}<span className="visually-hidden"> navigation</span></button>
                <nav id="public-nav" aria-label="Public navigation" className={menuOpen ? 'lp-nav is-open' : 'lp-nav'} onKeyDown={e => { if (e.key === 'Escape') closeMenu(); }}>
                    <a href="#top" onClick={closeMenu}>Home</a><a href="#features" onClick={closeMenu}>Features</a><a href="#how-it-works" onClick={closeMenu}>How It Works</a><a href="#about" onClick={closeMenu}>About</a>
                    {!signedIn && <Link to="/login" onClick={closeMenu}>Sign In</Link>}
                    <Link className="lp-button lp-small" to={destination} onClick={closeMenu}>{cta} <span aria-hidden="true">↗</span></Link>
                </nav>
            </header>
            <main id="main-content">
                <section className="lp-hero lp-wrap" aria-labelledby="hero-heading">
                    <div className="lp-hero-copy"><p className="lp-eyebrow"><span className="lp-dot" /> LESS FRICTION. MORE FLOW.</p>
                        <h1 id="hero-heading">IT SUPPORT<br />THAT JUST<br /><span>WORKS.</span><span className="lp-star" aria-hidden="true">✳</span></h1>
                        <p className="lp-intro">Meet Tiqnest — your smarter IT help desk. Report issues in seconds, troubleshoot common problems safely, and stay informed when widespread outages happen.</p>
                        <div className="lp-actions"><Link className="lp-button" to={destination}>{cta} <span aria-hidden="true">↗</span></Link><a className="lp-text-link" href="#features">Explore Features <span aria-hidden="true">↓</span></a></div>
                        <p className="lp-hero-note">For the people who need help. And the people who give it.</p>
                    </div>
                    <figure className="lp-preview">
                        <div className="lp-orbit" aria-hidden="true" />
                        <div className="lp-preview-window">
                            <div className="lp-window-top"><span>TIQNEST / YOUR WORKSPACE</span><span aria-hidden="true">•••</span></div>
                            <div className="lp-preview-body"><p className="lp-eyebrow">ONE PLACE. A CLEARER PICTURE.</p><h2>A little less<br />“is it just me?”</h2>
                                <div className="lp-demo-ticket"><div className="lp-ticket-meta"><span>EXAMPLE TICKET · 042</span><span className="lp-pill">In progress</span></div><h3>Can't connect to VPN</h3><p>Connection drops when joining the company network.</p><div className="lp-progress" aria-hidden="true"><span /></div><div className="lp-ticket-meta"><span>Reported</span><strong>Investigating</strong><span>Resolved</span></div></div>
                                <div className="lp-demo-fix"><span className="lp-icon" aria-hidden="true">✳</span><div><strong>TiqFix has a place to start</strong><p>Check your connection. Follow approved steps.</p></div><span aria-hidden="true">↗</span></div>
                            </div>
                        </div>
                        <div className="lp-demo-radar"><span className="lp-radar-mark" aria-hidden="true">◎</span><div><strong>A shared issue. One incident.</strong><p>TiqRadar groups related reports.</p></div></div>
                        <figcaption>ILLUSTRATIVE PREVIEW · NO LIVE USER DATA</figcaption>
                    </figure>
                </section>
                <div className="lp-ribbon" aria-hidden="true"><span>REPORT IT</span>✳<span>WORK THROUGH IT</span>✳<span>STAY IN THE LOOP</span>✳<span>GET BACK TO YOUR DAY</span></div>
                <section className="lp-wrap lp-problem" aria-labelledby="problem-heading"><div><p className="lp-eyebrow">MEET YOUR NEW HELP DESK</p><h2 id="problem-heading">GOODBYE, SUPPORT<br />RUNAROUND.</h2></div><div><p>Traditional IT support is slow, repetitive and frustrating. Employees wait for help, support teams handle duplicate reports, and company-wide outages can go unnoticed.</p><p className="lp-emphasis">Tiqnest brings ticket tracking, guided troubleshooting and incident detection together in one connected platform.</p></div></section>
                <section id="features" className="lp-feature-section" aria-labelledby="features-heading"><div className="lp-wrap"><div className="lp-section-heading"><div><p className="lp-eyebrow">A CONNECTED TOOLKIT</p><h2 id="features-heading">LESS CHAOS.<br />MORE CLARITY.</h2></div><p>From the first report to the next update, <br />give everyday IT support a better flow.</p></div><div className="lp-feature-grid">{features.map((feature, index) => <article className={`lp-feature lp-feature-${index}`} key={feature.name}><div className="lp-feature-top"><span className="lp-icon" aria-hidden="true">{feature.icon}</span><span className="lp-feature-number">0{index + 1}</span></div><p className="lp-eyebrow">{feature.tag}</p><h3>{feature.name}</h3><p>{feature.text}</p></article>)}</div></div></section>
                <section id="how-it-works" className="lp-wrap lp-how" aria-labelledby="how-heading"><p className="lp-eyebrow">FROM “HELP” TO HANDLED</p><h2 id="how-heading">THREE STEPS. A CLEAR WAY FORWARD.</h2><ol className="lp-steps">{steps.map(([title, text], i) => <li key={title}><span className="lp-step-number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></section>
                <section className="lp-wrap lp-audiences" aria-labelledby="audience-heading"><div className="lp-section-heading"><div><p className="lp-eyebrow">TWO SIDES. ONE CONNECTED PLATFORM.</p><h2 id="audience-heading">BETTER TOGETHER.</h2></div></div><div className="lp-audience-grid">{[{title:'For employees', text:'Help should be easy to ask for.', items:['Simple IT problem reporting','Clear ticket updates','Guided troubleshooting','Outage notifications']},{title:'For IT administrators',text:'Keep the whole picture in view.',items:['Centralized ticket management','Incident grouping','SLA and priority visibility','Audit history and status tracking']}].map(group => <article key={group.title}><h3>{group.title}</h3><p>{group.text}</p><ul>{group.items.map(item => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul></article>)}</div></section>
                <section id="about" className="lp-wrap lp-about" aria-labelledby="about-heading"><span className="lp-about-symbol" aria-hidden="true">✳</span><div><p className="lp-eyebrow">BIG IDEAS. BETTER IT DAYS.</p><h2 id="about-heading">BUILT AT HACKATHON CONCORDIA.</h2><p>Tiqnest was created as a hackathon project to reimagine everyday IT support. A simpler way to ask for help, work through problems and keep everyone informed.</p><p className="lp-creators">Made by Ilian Adeleke, Arushi Naik, Malick Konate and Jacky Bolap.</p></div></section>
                <section className="lp-final" aria-labelledby="cta-heading"><div className="lp-wrap"><p className="lp-eyebrow">LET'S GET YOUR DAY MOVING AGAIN</p><h2 id="cta-heading">READY FOR SMARTER<br />IT SUPPORT?</h2><p>Less confusion. Faster troubleshooting. Better visibility.</p><Link className="lp-button" to={destination}>{cta} <span aria-hidden="true">↗</span></Link></div></section>
            </main>
            <footer className="lp-wrap lp-footer"><div><a href="#top" className="lp-brand">TIQNEST<span aria-hidden="true">✳</span></a><p>A smarter help desk for everyday IT problems.</p></div><nav aria-label="Footer navigation"><a href="#features">Features</a><a href="#about">About</a><Link to={signedIn ? destination : '/login'}>{signedIn ? 'Go to App' : 'Sign In'}</Link></nav><p className="lp-built">Built with Java, Spring Boot, React and PostgreSQL</p></footer>
        </div>
    );
}

