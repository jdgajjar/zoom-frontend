import React, { useState } from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'

export default function LandingPage() {
    const router = useNavigate();
    const [navOpen, setNavOpen] = useState(false);

    return (
        <div className="homePlanetBackground" style={{position: 'relative', minHeight: '100vh', minWidth: '100vw', width: '100vw', height: '100vh', backgroundColor: '#050509', overflow: 'hidden'}}>
            {/* Planets for background effect, exactly as in background.html, but behind all content */}
            <div style={{position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none'}}>
                <div className="planet large" style={{position: 'absolute', borderRadius: '50%', backgroundColor: '#000', width: '1000px', height: '1000px', left: '50%', top: '-500px', transform: 'translateX(-50%)', background: 'radial-gradient(circle at 90% 45%, rgba(140, 115, 220, 0.2), #000 60%)', boxShadow: 'inset -160px 0 220px rgba(0, 0, 0, 0.95), 100px 0 240px rgba(140, 115, 220, 0.2)'}}></div>
                <div className="planet small" style={{position: 'absolute', borderRadius: '50%', backgroundColor: '#000', width: '300px', height: '300px', right: '40px', bottom: '-150px', background: 'radial-gradient(circle at 85% 40%, rgba(140, 115, 220, 0.1), #000 65%)', boxShadow: 'inset -40px 0 80px rgba(0, 0, 0, 0.85), 30px 0 100px rgba(140, 115, 220, 0.1)'}}></div>
            </div>
            <div style={{position: 'relative', zIndex: 1}}>
                <div className='responsive-container' style={{padding: '2vw'}}>
                    <div className='landingPageContainer' style={{gap: '2vw'}}>
                        <nav style={{marginBottom: '2vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2vw', position: 'relative'}}>
                            <div className='navHeader' style={{display: 'flex', alignItems: 'center', flexDirection: 'row', gap: '1.5vw', flexWrap: 'nowrap'}}>
                                <h2 style={{fontSize: '2.5vw', margin: '0 1vw 0 0', whiteSpace: 'nowrap'}}>Apna Video Call</h2>
                            </div>
                            {/* Desktop navlist (right side) - only show on desktop */}
                            <div className='navlist desktop-navlist' style={{display: 'flex', gap: '1.5vw', fontSize: '1.2vw', flexWrap: 'nowrap', alignItems: 'center'}}>
                                <p onClick={() => { router("/aljk23") }} style={{margin: 0, padding: '0.5vw 1vw', cursor: 'pointer'}}>Join as Guest</p>
                                <p onClick={() => { router("/auth") }} style={{margin: 0, padding: '0.5vw 1vw', cursor: 'pointer'}}>Register</p>
                                <div onClick={() => { router("/auth") }} role='button' style={{margin: 0, padding: '0.5vw 1vw', cursor: 'pointer'}}>
                                    <p style={{margin: 0}}>Login</p>
                                </div>
                            </div>
                            {/* Hamburger Icon for mobile */}
                            {!navOpen && (
                                <div className="nav-hamburger" style={{cursor: 'pointer', marginLeft: 'auto', display: 'flex', alignItems: 'center'}} onClick={() => setNavOpen(true)}>
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect y="6" width="32" height="4" rx="2" fill="#fff"/>
                                        <rect y="14" width="32" height="4" rx="2" fill="#fff"/>
                                        <rect y="22" width="32" height="4" rx="2" fill="#fff"/>
                                    </svg>
                                </div>
                            )}
                            {/* Sidebar Navigation */}
                            <div className={`sidebar-nav${navOpen ? ' open' : ''}`} style={{position: 'fixed', top: 0, right: 0, height: '100vh', width: '70vw', maxWidth: '320px', background: '#181828', boxShadow: '-2px 0 16px rgba(0,0,0,0.25)', zIndex: 100, transform: navOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.35s cubic-bezier(0.77,0,0.18,1)', display: 'flex', flexDirection: 'column', padding: '3vw 2vw', gap: '2vw'}}>
                                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                    <button aria-label="Close menu" onClick={() => setNavOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}}>
                                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <line x1="7" y1="7" x2="21" y2="21" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                                            <line x1="21" y1="7" x2="7" y2="21" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                                        </svg>
                                    </button>
                                </div>
                                <p onClick={() => { setNavOpen(false); router("/aljk23") }} style={{margin: 0, padding: '1vw 0', fontSize: '1.3rem', color: '#fff', cursor: 'pointer', borderBottom: '1px solid #333'}}>Join as Guest</p>
                                <p onClick={() => { setNavOpen(false); router("/auth") }} style={{margin: 0, padding: '1vw 0', fontSize: '1.3rem', color: '#fff', cursor: 'pointer', borderBottom: '1px solid #333'}}>Register</p>
                                <div onClick={() => { setNavOpen(false); router("/auth") }} role='button' style={{margin: 0, padding: '1vw 0', fontSize: '1.3rem', color: '#fff', cursor: 'pointer'}}>
                                    <p style={{margin: 0}}>Login</p>
                                </div>
                            </div>
                            {/* Overlay for sidebar */}
                            {navOpen && <div className="sidebar-overlay" onClick={() => setNavOpen(false)} style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 99, transition: 'opacity 0.3s', opacity: navOpen ? 1 : 0}}></div>}
                        </nav>
                        <div className="landingMainContainer" style={{display: 'flex', flexWrap: 'wrap', gap: '3vw', alignItems: 'center', justifyContent: 'space-between', padding: '2vw 0'}}>
                            <div className="landing-main-content" style={{flex: 1}}>
                                <h1 style={{fontSize: '3vw', marginBottom: '1vw'}}><span style={{ color: "#FF9839" }}>Connect</span> with your loved Ones</h1>
                                <p style={{fontSize: '1.2vw', marginBottom: '2vw'}}>Cover a distance by Apna Video Call</p>
                                <div role='button' style={{fontSize: '1.2vw', padding: '0.7vw 2vw'}}>
                                    <Link to={"/auth"}>Get Started</Link>
                                </div>
                            </div>
                            <div className="landing-image-container" style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
                                <img src="/mobile.png" alt="" style={{maxWidth: '100%', height: 'auto', padding: '1vw'}} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @media (max-width: 900px) {
                    .landingPageContainer h2 { font-size: 4vw !important; }
                    .nav-hamburger { display: block !important; position: absolute; right: 0; top: 0.5vw; z-index: 110; margin-right: 10px !important; }
                    .nav-hamburger { display: flex !important; align-items: center !important; }
                    .nav-hamburger svg { width: 24px !important; height: 24px !important; }
                    .navlist { display: none !important; }
                    .sidebar-nav { display: flex !important; }
                }
                @media (max-width: 600px) {
                    .responsive-container { padding: 7vw !important; }
                    .landingPageContainer { gap: 7vw !important; }
                    nav { flex-direction: row !important; gap: 5vw !important; align-items: flex-start !important; margin-right: 50px !important;}
                    .navlist { font-size: 5vw !important; }
                    .landingMainContainer { flex-direction: column !important; gap: 8vw !important; padding: 7vw 0 !important; }
                    .landingMainContainer h1 { fontSize: 7vw !important; }
                    .landingMainContainer p, .landingMainContainer div[role='button'] { font-size: 4vw !important; }
                    .landing-image-container { width: 100% !important; min-width: 0 !important; display: flex !important;}
                    .landing-image-container img { width: 100% !important; max-width: 250px !important; min-width: 0 !important; height: auto !important; padding: 2vw !important; display: block !important; margin: 0 auto !important; visibility: visible !important; opacity: 1 !important; }
                    .landing-main-content { flex: 0.5 !important; }
                }
                @media (min-width: 901px) {
                    .nav-hamburger { display: none !important; }
                }
            `}</style>
        </div>
    )
}
