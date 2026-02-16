import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ISSFeedProps {
    onClose: () => void;
}

export const ISSFeed: React.FC<ISSFeedProps> = ({ onClose }) => {
    const [time, setTime] = useState(new Date());
    const [telemetry, setTelemetry] = useState({
        alt: 418.00,
        vel: 27600,
        lat: 51.5074,
        lng: -0.1278,
        heading: 90,
        solar_lat: 0,
        solar_lng: 0,
        visibility: 'daylight'
    });

    type VisionMode = 'STD' | 'BW' | 'NV';
    const [visionMode, setVisionMode] = useState<VisionMode>('NV');
    const [mounted, setMounted] = useState(false);

    // BEARING CALCULATION UTILITY
    const toRad = (deg: number) => deg * Math.PI / 180;
    const toDeg = (rad: number) => rad * 180 / Math.PI;

    const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const dLon = toRad(lon2 - lon1);
        const y = Math.sin(dLon) * Math.cos(toRad(lat2));
        const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
        const brng = toDeg(Math.atan2(y, x));
        return (brng + 360) % 360;
    };

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setTime(new Date()), 1000);

        const fetchISS = async () => {
            try {
                const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
                const data = await res.json();

                setTelemetry(prev => {
                    // Calculate real bearing from previous position to new position
                    // Only update if we have movement (avoid 0 distance noise)
                    let newHeading = prev.heading;
                    if (prev.lat !== data.latitude || prev.lng !== data.longitude) {
                        const calculated = calculateBearing(prev.lat, prev.lng, data.latitude, data.longitude);
                        // Smooth the transition if needed, but for now specific updates are fine.
                        // Filter out jitter if simulated or very small movement
                        if (!isNaN(calculated)) {
                            newHeading = calculated;
                        }
                    }

                    return {
                        alt: data.altitude,
                        vel: data.velocity,
                        lat: data.latitude,
                        lng: data.longitude,
                        heading: newHeading,
                        solar_lat: data.solar_lat,
                        solar_lng: data.solar_lon,
                        visibility: data.visibility
                    };
                });
            } catch (e) {
                // Fallback to simulation if offline/rate-limited
                setTelemetry(prev => ({
                    alt: prev.alt + (Math.random() * 0.1 - 0.05),
                    vel: prev.vel + Math.floor(Math.random() * 10 - 5),
                    lat: prev.lat + 0.0005,
                    lng: prev.lng + 0.0005,
                    heading: (prev.heading + 0.1) % 360,
                    solar_lat: 0,
                    solar_lng: 0,
                    visibility: 'unknown'
                }));
            }
        };

        fetchISS();
        const dataTimer = setInterval(fetchISS, 2000); // 2s Real update

        return () => {
            clearInterval(timer);
            clearInterval(dataTimer);
        };
    }, []);

    const formatTime = (date: Date) => {
        return date.toISOString().replace('T', ' ').split('.')[0] + 'Z';
    };

    const formatCoord = (val: number, type: 'N' | 'E') => {
        const dir = val >= 0 ? (type === 'N' ? 'N' : 'E') : (type === 'N' ? 'S' : 'W');
        return `${Math.abs(val).toFixed(4)}° ${dir}`;
    };

    // VISION FILTERS
    const getVideoClass = () => {
        switch (visionMode) {
            case 'BW': return 'grayscale contrast-[1.4] brightness-90';
            // Phosphor Green Look: High contrast, sepia base, hue rotated to green
            case 'NV': return 'sepia-[1] hue-rotate-[90deg] contrast-[1.5] brightness-[0.9] saturate-[1.5]';
            case 'STD': return 'contrast-[1.1] saturate-125';
            default: return '';
        }
    };

    // COMPASS GENERATION
    // Pixel-per-degree ratio
    const PPD = 4;

    // Normalize heading to 0-360
    const normalizedHeading = (telemetry.heading % 360 + 360) % 360;

    // TAPE CONFIGURATION
    const TAPE_HEIGHT_VH = 60; // 60vh height
    const PIXELS_PER_UNIT_ALT = 40; // 40px per km
    const PIXELS_PER_UNIT_VEL = 0.5; // 0.5px per km/h (since velocity is ~27000)

    // SSR SAFEGUARD
    if (!mounted || typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
            {/* Main HUD Container - FULLSCREEN DOMINANCE */}
            <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">

                {/* --- VIDEO FEED CONTAINER (Constrained to Camera Brackets) --- */}
                {/* Decoration brackets are at inset-12 (approx), so we place video at inset-14 to be "inside" */}
                <div className="absolute inset-4 md:inset-14 z-0 overflow-hidden rounded-sm border border-white/5 bg-black">
                    <iframe
                        className={`w-[110%] h-[110%] -ml-[5%] -mt-[5%] object-cover transition-all duration-700 pointer-events-none ${getVideoClass()}`}
                        src="https://www.youtube.com/embed/aB1yRz0HhdY?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&loop=1&playlist=aB1yRz0HhdY"
                        title="ISS Live Feed"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />

                    {/* REC INDICATION - OSD Style */}
                    <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex items-center gap-2 md:gap-3 pointer-events-none">
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
                        <span className="text-white/90 font-mono font-bold tracking-widest text-xs md:text-sm drop-shadow-md">REC {formatTime(time).split(' ')[1]}</span>
                    </div>

                    {/* TR: Controls - VISION MODES (OSD Style) */}
                    <div className="absolute top-12 right-4 md:top-16 md:right-6 z-20 flex flex-col items-end gap-3 pointer-events-auto">
                        {/* VISION TOGGLE */}
                        <div className="flex bg-black/80 backdrop-blur-md border border-white/20 p-1 gap-1 rounded-sm shadow-lg">
                            <button
                                onClick={() => setVisionMode('STD')}
                                className={`px-2 py-0.5 md:px-3 md:py-1 text-[8px] md:text-[10px] font-mono font-bold transition-colors ${visionMode === 'STD' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
                            >
                                STD
                            </button>
                            <button
                                onClick={() => setVisionMode('BW')}
                                className={`px-2 py-0.5 md:px-3 md:py-1 text-[8px] md:text-[10px] font-mono font-bold transition-colors ${visionMode === 'BW' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
                            >
                                B&W
                            </button>
                            <button
                                onClick={() => setVisionMode('NV')}
                                className={`px-2 py-0.5 md:px-3 md:py-1 text-[8px] md:text-[10px] font-mono font-bold transition-colors ${visionMode === 'NV' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
                            >
                                NV
                            </button>
                        </div>
                    </div>

                    {/* Visual Overlays (Scanlines, Noise) - Inside Video Container */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                        {visionMode === 'NV' && (
                            <>
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,255,0,0.06),rgba(0,255,0,0.02),rgba(0,255,0,0.06))] bg-[length:100%_4px,6px_100%] opacity-20" />
                                <div className="absolute inset-0 animate-scanline bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,255,0,0.1)_50%,transparent_100%)] bg-[length:100%_400px] bg-repeat-y opacity-30" />
                                {/* Bloom Glow for NV */}
                                <div className="absolute inset-0 bg-green-500/10 mix-blend-screen" />
                            </>
                        )}
                        {visionMode === 'BW' && (
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150" />
                        )}
                        {/* Vignette - Stronger for "Camera" feel */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,5,0,0.8)_100%)]" />
                    </div>
                </div>

                {/* --- HUD SAFE ZONE CONTAINER --- */}
                {/* Sits on top of video, aligned with it */}
                <div className="absolute top-4 left-4 right-4 bottom-4 md:top-16 md:left-16 md:right-16 md:bottom-10 z-20 flex flex-col justify-between pointer-events-none transition-all duration-300">

                    {/* TOP BAR: Heading & Info */}
                    <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-8 items-start relative">
                        {/* TL: Feed Info */}
                        <div className="order-2 md:order-1 col-span-1 justify-self-start bg-black/60 border-l-2 border-primary/50 text-white p-3 font-mono text-xs leading-relaxed backdrop-blur-md shadow-lg rounded-r-lg min-w-[140px] md:min-w-[180px]">
                            <div className="text-primary font-bold text-sm mb-1">FEED: LIVE_SAT_04</div>
                            <div className="flex justify-between text-gray-400"><span>ENC:</span> <span className="text-white">AES-256</span></div>
                            <div className="flex justify-between text-gray-400"><span>SIG:</span> <span className="text-primary">-84dBm</span></div>
                            <div className="flex justify-between text-gray-400 mt-1 border-t border-white/10 pt-1">
                                <span>VIS:</span>
                                <span className={telemetry.visibility === 'daylight' ? 'text-yellow-400 font-bold' : 'text-blue-400 font-bold'}>
                                    {telemetry.visibility.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* TC: ARKHAM COMPASS STYLE - Minimalist Floating Tape */}
                        <div className="order-1 md:order-2 col-span-1 justify-self-center relative w-full md:w-[320px] h-10 overflow-hidden flex items-end justify-center mask-linear-fade">
                            {/* Central Indicator */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-white" />
                            </div>

                            {/* Scrolling Tape Container */}
                            <div className="relative w-full h-full flex items-end">
                                {/* The tape itself which translates */}
                                <div
                                    className="flex items-end absolute bottom-1 transition-transform duration-300 ease-out will-change-transform"
                                    style={{
                                        left: '50%',
                                        transform: `translateX(-${normalizedHeading * PPD}px)`
                                    }}
                                >
                                    {/* Render -180 to 540 degrees to allow seamless buffer wrapping look */}
                                    {Array.from({ length: 25 }).map((_, chunkIndex) => {
                                        // Creating repeated strip segments to cover rotation
                                        // This is a simplified "infinite" tape
                                        const offset = (chunkIndex - 12) * 360;
                                        return (
                                            <div key={chunkIndex} className="flex absolute bottom-0" style={{ left: `${offset * PPD}px` }}>
                                                {Array.from({ length: 360 / 5 }).map((_, i) => {
                                                    const deg = i * 5;
                                                    const isMajor = deg % 45 === 0;
                                                    const isCardinal = deg % 90 === 0;
                                                    const cardinalLabel = deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : deg === 270 ? 'W' : '';

                                                    return (
                                                        <div
                                                            key={i}
                                                            className="flex flex-col items-center justify-end absolute bottom-0"
                                                            style={{
                                                                width: `${5 * PPD}px`,
                                                                left: `${deg * PPD}px`,
                                                                height: '24px'
                                                            }}
                                                        >
                                                            {/* Ticks */}
                                                            <div className={`w-0.5 bg-white/80 ${isCardinal ? 'h-3' : isMajor ? 'h-2 opacity-80' : 'h-1.5 opacity-40'}`} />

                                                            {/* Labels */}
                                                            {isCardinal ? (
                                                                <span className="absolute bottom-3 text-white font-bold font-mono text-xs drop-shadow-md">{cardinalLabel}</span>
                                                            ) : isMajor ? (
                                                                <span className="absolute bottom-3 text-white/60 font-mono text-[9px]">{deg}</span>
                                                            ) : null}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE: Brackets & Crosshair & Dynamic Tapes */}
                    <div className="flex-1 relative my-4 overflow-hidden">
                        {/* Aim Reticle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-60">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-white/50" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-6 bg-white/50" />
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-px bg-white/50" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-px bg-white/50" />
                            <div className="absolute inset-0 border border-white/10 rounded-full" />
                            <div className="absolute inset-[40%] border border-primary/30 rounded-full border-dashed animate-spin-slow" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-1 h-1 bg-red-500 rounded-full shadow-[0_0_5px_red]" />
                            </div>
                        </div>

                        {/* --- DYNAMIC ALTITUDE TAPE (Left) --- */}
                        {/* Outer wrapper: visible overflow for indicator */}
                        <div className="absolute left-0 top-1/2 -translate-x-2 md:-translate-x-4 -translate-y-1/2 h-[40vh] md:h-[60vh] w-16 md:w-24 pr-2 md:pr-4 py-6">
                            {/* Inner wrapper: clips the scrolling numbers */}
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] border-r border-white/10 overflow-hidden mask-vertical-fade">
                                {/* Ticks Map */}
                                {Array.from({ length: 25 }).map((_, i) => {
                                    const step = 2; // Every 2km
                                    const centerVal = telemetry.alt;
                                    const nearestStep = Math.round(centerVal / step) * step;
                                    const startVal = nearestStep + (12 * step);
                                    const currentVal = startVal - (i * step);
                                    const pxOffset = -(currentVal - telemetry.alt) * 20;

                                    return (
                                        <div
                                            key={i}
                                            className="flex items-center justify-end gap-2 md:gap-3 text-[9px] md:text-[10px] text-white/60 font-mono absolute right-2 md:right-4 transition-transform duration-75"
                                            style={{ top: '50%', transform: `translateY(${pxOffset}px) translateY(-50%)` }}
                                        >
                                            <span className="font-bold">{currentVal.toFixed(1)}</span>
                                            <div className="w-2 md:w-3 h-px bg-white/40" />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Indicator (Fixed) - Outside the overflow-hidden wrapper */}
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 flex items-center gap-1 md:gap-2 translate-x-full z-10 pl-1 md:pl-2">
                                <div className="w-0 h-0 border-y-[6px] md:border-y-[8px] border-y-transparent border-r-[8px] md:border-r-[10px] border-r-white" />
                                <div className="bg-primary text-white font-bold font-mono text-xs md:text-base px-2 py-0.5 md:px-3 md:py-1 rounded-sm border border-white/20">
                                    {telemetry.alt.toFixed(1)}
                                </div>
                            </div>
                        </div>

                        {/* --- DYNAMIC VELOCITY TAPE (Right) --- */}
                        <div className="absolute right-0 top-1/2 translate-x-2 md:translate-x-4 -translate-y-1/2 h-[40vh] md:h-[60vh] w-16 md:w-24 pl-2 md:pl-4 py-6">
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] border-l border-white/10 overflow-hidden mask-vertical-fade">
                                {Array.from({ length: 25 }).map((_, i) => {
                                    const step = 50; // Every 50 km/h
                                    const centerVal = telemetry.vel;
                                    const nearestStep = Math.round(centerVal / step) * step;
                                    const startVal = nearestStep + (12 * step);
                                    const currentVal = startVal - (i * step);
                                    const pxOffset = -(currentVal - telemetry.vel) * 0.8;

                                    return (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] text-white/60 font-mono absolute left-2 md:left-4 transition-transform duration-75"
                                            style={{ top: '50%', transform: `translateY(${pxOffset}px) translateY(-50%)` }}
                                        >
                                            <div className="w-2 md:w-3 h-px bg-white/40" />
                                            <span className="font-bold">{currentVal.toFixed(0)}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Indicator (Fixed) */}
                            <div className="absolute top-1/2 left-0 -translate-y-1/2 flex items-center gap-1 md:gap-2 -translate-x-full z-10 pr-1 md:pr-2">
                                <div className="bg-primary text-white font-bold font-mono text-xs md:text-base px-2 py-0.5 md:px-3 md:py-1 rounded-sm border border-white/20">
                                    {telemetry.vel.toFixed(0)}
                                </div>
                                <div className="w-0 h-0 border-y-[6px] md:border-y-[8px] border-y-transparent border-l-[8px] md:border-l-[10px] border-l-white" />
                            </div>
                        </div>

                    </div>

                    {/* BOTTOM BAR: Precision Data & RE-LOCATED TERMINATE BUTTON */}
                    <div className="border-t border-white/10 pt-4 md:pt-6 pb-2 bg-black/80 backdrop-blur-md px-4 md:px-32 pb-2 md:pb-4 flex flex-col md:flex-row justify-between items-center md:items-end mt-auto pointer-events-auto rounded-b-lg gap-4 md:gap-0">
                        <div className="flex gap-4 md:gap-12 w-full md:w-auto justify-between md:justify-start">
                            <div className="flex flex-col gap-0.5 md:gap-1">
                                <span className="text-[8px] md:text-[10px] text-white/40 tracking-widest uppercase">Latitude</span>
                                <span className="text-lg md:text-2xl font-mono text-white font-bold tracking-tight">{formatCoord(telemetry.lat, 'N')}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 md:gap-1">
                                <span className="text-[8px] md:text-[10px] text-white/40 tracking-widest uppercase">Longitude</span>
                                <span className="text-lg md:text-2xl font-mono text-white font-bold tracking-tight">{formatCoord(telemetry.lng, 'E')}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 md:gap-1 hidden sm:flex">
                                <span className="text-[8px] md:text-[10px] text-white/40 tracking-widest uppercase">Solar Lat</span>
                                <span className="text-base md:text-xl font-mono text-white font-bold">{telemetry.solar_lat?.toFixed(2)}°</span>
                            </div>
                        </div>

                        {/* Sensor Activity - Hide on Mobile? Or make small */}
                        <div className="flex flex-col items-center hidden md:flex">
                            <div className="text-white/40 text-[9px] uppercase tracking-[0.3em] mb-2">Sensor Array Active</div>
                            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary/60 w-[85%] animate-pulse" />
                            </div>
                        </div>

                        {/* System Status & Terminate */}
                        <div className="flex flex-row-reverse md:flex-col items-center md:items-end gap-4 md:gap-3 pointer-events-auto w-full md:w-auto justify-between md:justify-end">
                            {/* RELOCATED TERMINATE BUTTON */}
                            <button
                                onClick={onClose}
                                className="bg-red-500/20 hover:bg-red-500/40 text-red-100 border border-red-500/50 px-3 py-1 text-[10px] font-bold tracking-widest transition-all uppercase hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] md:mb-1"
                            >
                                [TERMINATE LINK]
                            </button>

                            <div className="text-left md:text-right">
                                <div className="text-[10px] md:text-xs text-white font-bold tracking-widest mb-1">SYSTEMS OPTIMAL</div>
                                <div className="text-[8px] md:text-[10px] text-white/30 font-mono hidden md:block">
                                    ID: ISS_ZARYA_MODULE
                                    <br />
                                    UPTIME: 99.98%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decoration Corners - Fixed to Viewport with Padding */}
                {/* These brackets define the "camera" borders - UI stays inside */}
                <div className="absolute top-4 left-4 md:top-12 md:left-12 w-8 h-8 md:w-16 md:h-16 border-l-2 border-t-2 border-primary/50 z-30 pointer-events-none" />
                <div className="absolute top-4 right-4 md:top-12 md:right-12 w-8 h-8 md:w-16 md:h-16 border-r-2 border-t-2 border-primary/50 z-30 pointer-events-none" />
                <div className="absolute bottom-4 left-4 md:bottom-12 md:left-12 w-8 h-8 md:w-16 md:h-16 border-l-2 border-b-2 border-primary/50 z-30 pointer-events-none" />
                <div className="absolute bottom-4 right-4 md:bottom-12 md:right-12 w-8 h-8 md:w-16 md:h-16 border-r-2 border-b-2 border-primary/50 z-30 pointer-events-none" />

            </div>
        </div>,
        document.body
    );
};
