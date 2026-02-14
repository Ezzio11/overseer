'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { createRoot } from 'react-dom/client';
import SunCalc from 'suncalc';

import { COUNTRIES } from '@/data/countries';
import { TargetingMarker } from '../UI/TargetingMarker';

import { useStore } from '@/lib/store';
import { fetchLatestEarthquakes, EarthquakeFeature } from '@/lib/usgs';
import { fetchLatestNews, NewsFeature } from '@/lib/news';



const GlobeView: React.FC = () => {
    // STORE
    const setFocusedCountry = useStore((state) => state.setFocusedCountry);
    const focusedCountry = useStore((state) => state.focusedCountry);
    const setNews = useStore((state) => state.setNews);
    const news = useStore((state) => state.news);

    // Comparison Mode
    const isComparisonMode = useStore((state) => state.isComparisonMode);
    const setComparisonCountry = useStore((state) => state.setComparisonCountry);

    // OPTIMIZED POLYGONS
    // This block would typically be inside the Globe component's JSX, but based on the instruction's placement,
    // I'm inserting it here as a placeholder for where it would logically be used.
    // The actual Globe component JSX is not provided in the original snippet.
    // Assuming `countries` already holds the processed features array, `.features` is not needed.
    // polygonsData={countries}
    // polygonCapColor={(d: any) => d.properties.ISO_A3 === focusedCountry ? 'rgba(0, 217, 255, 0.4)' : 'rgba(0, 100, 255, 0.1)'}
    // polygonSideColor={() => 'rgba(0, 50, 100, 0.05)'}
    // polygonStrokeColor={() => '#111'}

    const globeEl = useRef<any>(null);
    const [countries, setCountries] = useState<any[]>([]);
    const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);
    // const [news, setNews] = useState<NewsFeature[]>([]); // MOVED TO STORE
    const [focusedLocation, setFocusedLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
    const [mounted, setMounted] = useState(false);

    // SYNC FOCUS STATE: Clear reticle/resume rotation when panel is closed
    useEffect(() => {
        if (!focusedCountry) {
            setFocusedLocation(null);
        }
    }, [focusedCountry]);

    useEffect(() => {
        // Fetch GeoJSON
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(data => {
                // Process GeoJSON
                const processed = data.features.map((feat: any) => {
                    const iso = feat.properties.ISO_A3;
                    const countryData = COUNTRIES[iso];

                    if (countryData) {
                        feat.properties.color = '#00FF94'; // Primary color
                        feat.properties.data = countryData; // Attach full data object
                    } else {
                        feat.properties.color = '#0a0a0a'; // Default void color for untracked
                    }
                    return feat;
                });
                setCountries(processed);
            })
            .catch(err => console.error("Failed to load globe data", err));

        // Initial Fetch
        fetchLatestEarthquakes().then(setEarthquakes);
        fetchLatestNews().then(setNews);

        // Poll every 5 minutes
        const interval = setInterval(() => {
            fetchLatestEarthquakes().then(setEarthquakes);
            fetchLatestNews().then(setNews);
        }, 300000);

        // Enable rendering
        setMounted(true);

        return () => clearInterval(interval);
    }, []);

    // 1. GLOBAL INTEL: Real-time conflict/disaster events
    const setGlobalEvents = useStore((state) => state.setGlobalEvents);
    const globalEvents = useStore((state) => state.globalEvents);

    // INITIALIZATION: PHYSICS & CONTROLS
    useEffect(() => {
        if (globeEl.current) {
            // Wait for controls to be available (sometimes needs a frame)
            setTimeout(() => {
                const controls = globeEl.current.controls();
                if (controls) {
                    controls.enableDamping = true;
                    controls.dampingFactor = 0.05; // "Heavy" feel
                    controls.rotateSpeed = 0.6;
                    // Tilt limits
                    controls.minPolarAngle = Math.PI / 4;
                    controls.maxPolarAngle = Math.PI - (Math.PI / 4);
                }
            }, 100);
        }
    }, []);

    // FETCH GLOBAL EVENTS (Multi-source intel: GDELT Conflicts + NASA EONET Disasters)
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/intel/global-events');
                const data = await response.json();

                const events: any[] = data.events.map((event: any) => ({
                    id: event.id,
                    type: event.type, // CONFLICT, PROTEST, or DISASTER
                    properties: {
                        mag: event.intensity || 5,
                        place: event.description,
                        type: event.type
                    },
                    geometry: {
                        coordinates: event.coordinates // Already [lat, lng]
                    },
                    coordinates: event.coordinates, // Direct access for heatmap
                }));

                setGlobalEvents(events);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            }
        };

        fetchEvents();
        const interval = setInterval(fetchEvents, 300000); // Refresh every 5 min
        return () => clearInterval(interval);
    }, [setGlobalEvents]);

    // HEATMAP: Calculate event density per country
    const [eventHeatmap, setEventHeatmap] = useState<Record<string, number>>({});

    useEffect(() => {
        if (globalEvents.length > 0 && countries.length > 0) {
            // Helper: Calculate BBox for a feature if missing
            const getFeatureBBox = (feature: any) => {
                if (feature.bbox) return feature.bbox;

                let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90;

                const updateBounds = (coords: any[]) => {
                    coords.forEach(c => {
                        const [lng, lat] = c;
                        if (lng < minLng) minLng = lng;
                        if (lng > maxLng) maxLng = lng;
                        if (lat < minLat) minLat = lat;
                        if (lat > maxLat) maxLat = lat;
                    });
                };

                const geom = feature.geometry;
                if (geom.type === 'Polygon') {
                    updateBounds(geom.coordinates[0]);
                } else if (geom.type === 'MultiPolygon') {
                    geom.coordinates.forEach((polygon: any) => updateBounds(polygon[0]));
                }

                return [minLng, minLat, maxLng, maxLat];
            };

            const heatmap: Record<string, number> = {};
            // Count events per country (basic proximity check)
            globalEvents.forEach((event: any) => {
                // FIX: API returns [lat, lng], so we destructure accordingly.
                const [eventLat, eventLng] = event.coordinates || [0, 0];

                countries.forEach((country: any) => {
                    const iso = country.properties.ISO_A3;
                    if (!iso) return;

                    if (!heatmap[iso]) heatmap[iso] = 0;

                    // robust bounding box check
                    const bbox = getFeatureBBox(country);
                    if (bbox) {
                        const [minLng, minLat, maxLng, maxLat] = bbox;
                        if (eventLat >= minLat && eventLat <= maxLat &&
                            eventLng >= minLng && eventLng <= maxLng) {
                            heatmap[iso]++;
                        }
                    }
                });
            });

            setEventHeatmap(heatmap);
        }
    }, [globalEvents, countries]);

    // 2. SURVEILLANCE: ISS Tracking
    const [issPosition, setIssPosition] = useState<{ lat: number; lng: number; alt: number } | null>(null);

    useEffect(() => {
        const fetchISS = async () => {
            try {
                const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
                const data = await res.json();
                setIssPosition({ lat: data.latitude, lng: data.longitude, alt: data.altitude });
            } catch (e) {
                console.warn("ISS Track Failed", e);
            }
        };

        fetchISS();
        const interval = setInterval(fetchISS, 5000); // Live tracking 5s
        return () => clearInterval(interval);
    }, []);

    // 3. SURVEILLANCE: Mock State Aircraft (Visual Density)
    const [aircraft, setAircraft] = useState<any[]>([]);
    useEffect(() => {
        // Generate stable random aircraft paths
        const mockAircraft = Array.from({ length: 30 }).map((_, i) => ({
            id: `AF-${2000 + i}`,
            lat: (Math.random() * 140) - 70, // Avoid poles
            lng: (Math.random() * 360) - 180,
            alt: 0.15 + (Math.random() * 0.1), // Varied high altitude
            color: '#FFD700', // Gold/Yellow
            label: `USAF-${Math.floor(Math.random() * 900)}`
        }));
        setAircraft(mockAircraft);

        // Simple orbit animation
        const interval = setInterval(() => {
            setAircraft(prev => prev.map(plane => ({
                ...plane,
                lng: plane.lng + 0.1 > 180 ? -180 : plane.lng + 0.1 // Move East
            })));
        }, 50); // 20fps smooth motion

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (globeEl.current) {
            // Config controls
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.1; // Slower rotation
            globeEl.current.controls().enableZoom = true;
            globeEl.current.controls().minDistance = 150;
            globeEl.current.controls().maxDistance = 400; // Constrain zoom

            globeEl.current.pointOfView({ altitude: 1.5 }, 0); // Closer view like reference

            // REAL-TIME SUN POSITIONING (Astronomically Accurate)
            const updateSunPosition = () => {
                const now = new Date();

                // Get solar position (we need the subsolar point - where sun is directly overhead)
                // SunCalc gives us the sun's position for an observer at a location
                // We want the inverse: the location where the sun is at zenith

                // Solar declination (latitude where sun is overhead)
                // Use equator as reference point - altitude gives us the declination
                const sunPosition = SunCalc.getPosition(now, 0, 0);
                const sunLat = (Math.PI / 2 - sunPosition.altitude) * (180 / Math.PI);

                // Solar hour angle (longitude where sun is overhead)
                // SunCalc doesn't directly give hour angle, but we can derive from azimuth
                // Or use the time-based calculation with equation of time correction
                // For subsolar longitude: it's still primarily time-based
                const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

                // Apply equation of time correction (SunCalc accounts for this in azimuth)
                // For our purposes, the simple time-based calc is still valid for longitude
                const sunLng = (utcHours - 12) * -15;

                return { lat: sunLat, lng: sunLng };
            };

            const sunPos = updateSunPosition();

            // Main Key Light (THE SUN) - Only light source for realistic day/night
            const dirLight = new THREE.DirectionalLight(0xffffff, 4);

            // CUSTOM 3D SUN MODEL (Simple Glowing Sphere)
            const sunGroup = new THREE.Group();

            // Core
            const sunGeometry = new THREE.SphereGeometry(18, 32, 32);
            const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });
            const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
            sunGroup.add(sunMesh);

            // Glow / Corona (Sprite) -- simplified for performance
            // Just a large point light for now, or maybe a simple transparent sphere
            const glowGeometry = new THREE.SphereGeometry(35, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xffaa00,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            });
            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            sunGroup.add(glowMesh);

            // Add to scene but make invisible (keep light source active)
            globeEl.current.scene().add(sunGroup);
            sunGroup.visible = false; // Hide visual model, keep physics/light logic running

            const updateLighting = () => {
                const pos = updateSunPosition();
                const coords = globeEl.current.getCoords(pos.lat, pos.lng, 4); // Sun Distance

                dirLight.position.set(coords.x, coords.y, coords.z);
                sunGroup.position.set(coords.x, coords.y, coords.z);

                // Make sun look at earth center (0,0,0) - not strictly necessary for a sphere but good for groups
                sunGroup.lookAt(0, 0, 0);
            };

            // Initial Position
            const sunCoords = globeEl.current.getCoords(sunPos.lat, sunPos.lng, 4);
            dirLight.position.set(sunCoords.x, sunCoords.y, sunCoords.z);
            sunGroup.position.set(sunCoords.x, sunCoords.y, sunCoords.z);

            globeEl.current.scene().add(dirLight);

            // Minimal ambient
            const ambientLight = new THREE.AmbientLight(0x0a0a0a, 0.01);
            globeEl.current.scene().add(ambientLight);

            // Update Sun periodically
            const sunInterval = setInterval(() => {
                updateLighting();
            }, 60000);

            // MATERIAL HACK: Make globe glossy/metallic
            // We need to wait for the globe mesh to be created
            setTimeout(() => {
                const globeMesh = globeEl.current.scene().children.find((obj: any) => obj.type === 'Mesh');
                if (globeMesh && globeMesh.material) {
                    globeMesh.material.metalness = 0.2; // Reduced from 0.8 to avoid overly dark specular-only look
                    globeMesh.material.roughness = 0.7; // Increased to catch more diffuse light
                    globeMesh.material.bumpScale = 5; // Exaggerate topology
                }
            }, 1000);

            // TACTICAL CLOUD LAYER (Final Polish: Matching Reference)
            const CLOUDS_IMG = '/earth-clouds.png';
            new THREE.TextureLoader().load(CLOUDS_IMG, (cloudsTexture) => {
                // High-resolution sphere (128 segments) to prevent artifacts
                const cloudGeometry = new THREE.SphereGeometry(globeEl.current.getGlobeRadius() * 1.04, 128, 128);
                const cloudMaterial = new THREE.MeshLambertMaterial({
                    map: cloudsTexture,
                    transparent: true,
                    opacity: 0.05, // Extremely subtle (5%) to match reference
                    blending: THREE.NormalBlending,
                    emissive: new THREE.Color(0x0a0a0a),
                    emissiveIntensity: 0.02, // Barely visible night-side glow
                    depthWrite: false,
                    depthTest: true,
                    side: THREE.FrontSide,
                });
                const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
                clouds.name = 'atmosphere-clouds';
                // Render formatting to ensure it sits on top
                clouds.renderOrder = 1;
                // CRITICAL: Disable shadows to prevent "stripes" (self-shadowing artifacts)
                clouds.castShadow = false;
                clouds.receiveShadow = false;
                globeEl.current.scene().add(clouds);

                // Animate Clouds (Slower drift)
                (function rotateClouds() {
                    clouds.rotation.y += 0.0002;
                    requestAnimationFrame(rotateClouds);
                })();
            });

            // Apply Axial Tilt to Globe Mesh (not entire scene, preserves HTML overlays)
            const globeMesh = globeEl.current.scene().children.find((obj: any) => obj.type === 'Mesh' && obj.__globeObjType === 'globe');
            if (globeMesh) {
                const axialTilt = 23.4 * Math.PI / 180;
                globeMesh.rotation.z = axialTilt;
            }

            // --- TACTICAL VISUAL UPGRADES (Phase 8) ---

            // 1. ANIMATED STARFIELD (Twinkling)
            const STARFIELD_NAME = 'background-stars';
            let starField: THREE.Points;
            const existingStars = globeEl.current.scene().getObjectByName(STARFIELD_NAME);

            if (!existingStars) {
                const starCount = 3500;
                const starGeometry = new THREE.BufferGeometry();
                const positions = new Float32Array(starCount * 3);
                const colors = new Float32Array(starCount * 3);
                const sizes = new Float32Array(starCount);
                const phases = new Float32Array(starCount); // For twinkling phase

                const r = 450; // Far background
                const color1 = new THREE.Color('#ffffff');
                const color2 = new THREE.Color('#00D9FF'); // Tactical Cyan

                for (let i = 0; i < starCount; i++) {
                    const theta = 2 * Math.PI * Math.random();
                    const phi = Math.acos(2 * Math.random() - 1);
                    // Vary radius slightly for depth
                    const radius = r * (0.8 + Math.random() * 0.4);

                    const x = radius * Math.sin(phi) * Math.cos(theta);
                    const y = radius * Math.sin(phi) * Math.sin(theta);
                    const z = radius * Math.cos(phi);

                    positions[i * 3] = x;
                    positions[i * 3 + 1] = y;
                    positions[i * 3 + 2] = z;

                    // 20% Cyan stars
                    const mixedColor = i % 5 === 0 ? color2 : color1;
                    colors[i * 3] = mixedColor.r;
                    colors[i * 3 + 1] = mixedColor.g;
                    colors[i * 3 + 2] = mixedColor.b;

                    sizes[i] = 0.5 + Math.random(); // Varied sizes 0.5 - 1.5
                    phases[i] = Math.random() * Math.PI * 2; // Random start phase
                }

                starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

                // Store phases in user data to access in animation loop
                starGeometry.userData = { phases, baseColors: colors.slice() };

                const starMaterial = new THREE.PointsMaterial({
                    size: 1.2,
                    vertexColors: true,
                    transparent: true,
                    opacity: 0.9,
                    sizeAttenuation: false, // Keep them crisp
                    depthWrite: false, // Don't block other objects
                    blending: THREE.AdditiveBlending
                });

                starField = new THREE.Points(starGeometry, starMaterial);
                starField.name = STARFIELD_NAME;
                globeEl.current.scene().add(starField);
            } else {
                starField = existingStars as THREE.Points;
            }


            // 2. FRESNEL ATMOSPHERE (Holographic Glow)
            const ATMOSPHERE_NAME = 'atmosphere-fresnel';
            const existingAtmosphere = globeEl.current.scene().getObjectByName(ATMOSPHERE_NAME);

            // Remove existing if it exists to force update coordinates/material
            if (existingAtmosphere) {
                globeEl.current.scene().remove(existingAtmosphere);
            }

            const rimHex = 0x00D9FF;
            const facingHex = 0x000000;

            const uniforms = {
                color1: { value: new THREE.Color(rimHex) },
                color2: { value: new THREE.Color(facingHex) },
                fresnelBias: { value: 0.1 },
                fresnelScale: { value: 1.0 },
                fresnelPower: { value: 4.0 },
            };

            const vs = `
            uniform float fresnelBias;
            uniform float fresnelScale;
            uniform float fresnelPower;
            varying float vReflectionFactor;
            void main() {
              vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
              vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
              vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
              vec3 I = worldPosition.xyz - cameraPosition;
              vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );
              gl_Position = projectionMatrix * mvPosition;
            }
            `;

            const fs = `
            uniform vec3 color1;
            uniform vec3 color2;
            varying float vReflectionFactor;
            void main() {
              float f = clamp( vReflectionFactor, 0.0, 1.0 );
              gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
            }
            `;

            const globeRadius = globeEl.current.getGlobeRadius();
            const atmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.025, 64, 64);
            const atmosphereMaterial = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vs,
                fragmentShader: fs,
                transparent: true,
                blending: THREE.AdditiveBlending,
                side: THREE.FrontSide,
            });

            const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            atmosphereMesh.name = ATMOSPHERE_NAME;
            globeEl.current.scene().add(atmosphereMesh);

            // 3. TACTICAL CLOUDS (Selective Visibility)
            // Existing clouds setup handles the basics.

            // 4. OPTIMIZED DOTTED AURA (Restored)
            const SCENE_AURA_NAME = 'atmosphere-aura-points';
            let auraMesh: THREE.Points;
            const existingAura = globeEl.current.scene().getObjectByName(SCENE_AURA_NAME);

            if (!existingAura) {
                const auraGeometry = new THREE.BufferGeometry();
                const auraPositions = [];
                const samples = 4000;
                const phi = Math.PI * (3 - Math.sqrt(5));
                const globeRadius = globeEl.current.getGlobeRadius();
                const auraRadius = globeRadius * 1.2; // Keep aura slightly larger than Fresnel

                for (let i = 0; i < samples; i++) {
                    const y = 1 - (i / (samples - 1)) * 2;
                    const radiusAtY = Math.sqrt(1 - y * y);
                    const theta = phi * i;
                    const x = Math.cos(theta) * radiusAtY;
                    const z = Math.sin(theta) * radiusAtY;

                    auraPositions.push(x * auraRadius, y * auraRadius, z * auraRadius);
                }

                auraGeometry.setAttribute('position', new THREE.Float32BufferAttribute(auraPositions, 3));
                const auraMaterial = new THREE.PointsMaterial({
                    color: 0x00D9FF,
                    size: 0.8,
                    transparent: true,
                    opacity: 0.3,
                    sizeAttenuation: true,
                    blending: THREE.AdditiveBlending
                });
                auraMesh = new THREE.Points(auraGeometry, auraMaterial);
                auraMesh.name = SCENE_AURA_NAME;
                globeEl.current.scene().add(auraMesh);
            } else {
                auraMesh = existingAura as THREE.Points;
            }

            // --- ANIMATION LOOP ---
            let animationFrameId: number;
            const animate = () => {
                const now = Date.now() * 0.001; // Seconds

                // Twinkle Stars
                if (starField && starField.geometry) {
                    const colors = starField.geometry.attributes.color.array as Float32Array;
                    // Check if userData exists before accessing
                    if (starField.geometry.userData && starField.geometry.userData.phases) {
                        const phases = starField.geometry.userData.phases;
                        const baseColors = starField.geometry.userData.baseColors;
                        const count = starField.geometry.attributes.position.count;

                        for (let i = 0; i < count; i++) {
                            const twinkle = 0.7 + 0.3 * Math.sin(now * 2.0 + phases[i]);
                            colors[i * 3] = baseColors[i * 3] * twinkle;
                            colors[i * 3 + 1] = baseColors[i * 3 + 1] * twinkle;
                            colors[i * 3 + 2] = baseColors[i * 3 + 2] * twinkle;
                        }
                        starField.geometry.attributes.color.needsUpdate = true;
                    }

                    // Slow rotation of starfield
                    starField.rotation.y = now * 0.02;
                }

                // Rotate Aura
                if (auraMesh) {
                    auraMesh.rotation.y = -now * 0.05; // Counter-rotate for parallax
                }

                animationFrameId = requestAnimationFrame(animate);
            };

            animate();


            // Cleanup
            return () => {
                clearInterval(sunInterval);
                cancelAnimationFrame(animationFrameId);
            };
        }
    }, [mounted]);

    // PAUSE ROTATION ON FOCUS
    useEffect(() => {
        if (globeEl.current) {
            const controls = globeEl.current.controls();
            if (controls) {
                controls.autoRotate = !focusedLocation;
            }
        }
    }, [focusedLocation]);

    // Holographic Style Constants
    const HOLO_BLUE = '#00F0FF';
    const HOLO_BG = '#000000'; // Pure black for high contrast (or transparent)

    // CUSTOM OVERLAY TRACKING (Flicker Fix)

    // CUSTOM OVERLAY TRACKING (Flicker Fix)
    const overlayRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        let animationFrameId: number;

        const updateOverlay = () => {
            if (focusedLocation && globeEl.current && overlayRef.current) {
                try {
                    const { lat, lng } = focusedLocation;
                    const altitude = 0.02;

                    // Project 3D coords to 2D screen
                    // Use optional chaining just in case
                    const coords = globeEl.current.getScreenCoords?.(lat, lng, altitude);

                    if (coords && typeof coords.x === 'number') {
                        overlayRef.current.style.transform = `translate(${coords.x}px, ${coords.y}px)`;
                        overlayRef.current.style.opacity = '1';
                        overlayRef.current.style.display = 'block';
                    } else {
                        overlayRef.current.style.display = 'none';
                    }
                } catch (err) {
                    // Suppress projection errors during fast spins
                }
            } else if (overlayRef.current) {
                overlayRef.current.style.opacity = '0';
            }
            animationFrameId = requestAnimationFrame(updateOverlay);
        };

        updateOverlay();
        return () => cancelAnimationFrame(animationFrameId);
    }, [focusedLocation]);


    // Memoize polygon color to ensure reactivity
    const getPolygonColor = useCallback((d: any) => {
        const iso = d.properties.ISO_A3;
        const eventCount = eventHeatmap[iso] || 0;

        // THREAT LEVEL SCALE (HOLOGRAPHIC)

        // Level 0: Idle (Transparent - let Night Lights show)
        if (eventCount === 0) return 'rgba(0, 0, 0, 0)';

        // Cap at 25 events for max intensity
        const intensity = Math.min(eventCount / 25, 1);

        // Level 3: CRITICAL (Electric Red) - High Activity (>15 events)
        if (intensity > 0.6) return `rgba(255, 0, 60, ${0.3 + (intensity * 0.2)})`;

        // Level 2: WARNING (Electric Amber) - Medium Activity (5-15 events)
        if (intensity > 0.2) return `rgba(255, 180, 0, ${0.2 + (intensity * 0.2)})`;

        // Level 1: ROUTINE (Electric Cyan) - Low Activity (1-5 events)
        // Matches the blue interface
        return `rgba(0, 220, 255, ${0.1 + (intensity * 0.2)})`;
    }, [eventHeatmap]);



    const ringsData = useMemo(() => {
        return earthquakes.filter(eq => eq.properties.mag >= 5.0);
    }, [earthquakes]);


    const htmlElements = useMemo(() => {
        const markers: any[] = [];
        if (issPosition) markers.push({ ...issPosition, type: 'ISS' });

        // Limit news markers to 15 to prevent DOM bloat
        news.slice(0, 15).forEach((n: any) => {
            if (n.coordinates && n.coordinates.length >= 2) {
                markers.push({
                    lat: n.coordinates[0],
                    lng: n.coordinates[1],
                    type: 'NEWS',
                    properties: n
                });
            }
        });
        return markers;
    }, [issPosition, news]);

    // HOLOGRAPHIC CLOUDS (Procedural)
    const getRingColor = useCallback((magnitude: number) => {
        const intensity = Math.min(magnitude / 10, 1);
        if (magnitude >= 7) return `rgba(255, 0, 50, ${0.2 + (intensity * 0.5)})`; // Critical Red
        if (magnitude >= 6) return `rgba(255, 100, 0, ${0.2 + (intensity * 0.4)})`; // High Orange
        if (magnitude >= 5) return `rgba(255, 200, 0, ${0.2 + (intensity * 0.3)})`; // Med Yellow

        // Matches the blue interface
        return `rgba(0, 220, 255, ${0.1 + (intensity * 0.2)})`;
    }, []);

    const polygonsData = useMemo(() => (countries as any).features || countries, [countries, eventHeatmap, focusedCountry]);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 z-0 bg-transparent">
            <Globe
                ref={globeEl}
                // HOLOGRAPHIC TRANSFORMATION
                // CONFIGURATION
                backgroundColor="rgba(0,0,0,0)"
                // REALISTIC EARTH: Night texture for tactical feel
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

                // ATMOSPHERE & LIGHTING (Cinematic Upgrade)
                atmosphereColor="#4db2ff" // Pale Blue / Cyan (Rayleigh Scattering)
                atmosphereAltitude={0.25} // 25% of radius extension

                // OPTIMIZED POLYGONS (Event Heatmap Active)
                polygonsData={polygonsData}
                polygonCapColor={(d: any) => {
                    const iso = d.properties.ISO_A3;
                    if (iso === focusedCountry) return 'rgba(0, 255, 255, 0.4)'; // Focused (Bright Cyan)

                    const count = eventHeatmap[iso] || 0;
                    if (count > 10) return `rgba(255, 0, 50, 0.4)`; // Critical Red
                    if (count > 5) return `rgba(255, 100, 0, 0.3)`; // High Orange
                    if (count > 2) return `rgba(255, 200, 0, 0.25)`; // Medium Yellow
                    if (count > 0) return `rgba(0, 220, 255, 0.15)`; // Low Cyan

                    return 'rgba(0,0,0,0)'; // Transparent
                }}
                polygonSideColor={() => 'rgba(0,0,0,0)'}
                polygonStrokeColor={() => 'rgba(0,0,0,0)'} // Removed neon borders
                polygonAltitude={(d: any) => {
                    const iso = d.properties.ISO_A3;
                    if (iso === focusedCountry) return 0.03; // Raised focus
                    const count = eventHeatmap[iso] || 0;
                    return count > 0 ? 0.015 + (Math.min(count, 10) * 0.0015) : 0.005;
                }}
                polygonsTransitionDuration={0} // Instant snap (no morphing)

                // EVENTS
                ringsData={ringsData}
                ringLat={(d: any) => d.geometry.coordinates[1]}
                ringLng={(d: any) => d.geometry.coordinates[0]}
                ringAltitude={0.03}
                ringMaxRadius={(d: any) => Math.pow(d.properties.mag, 1.1)}
                ringPropagationSpeed={3}
                ringRepeatPeriod={800}
                ringColor={(d: any) => getRingColor(d.properties.mag)}

                // AIRCRAFT REMOVED FOR CLEANER UI

                // HTML MARKERS
                htmlElementsData={htmlElements}
                htmlLat={(d: any) => d.lat || d.geometry?.coordinates?.[1]}
                htmlLng={(d: any) => d.lng || d.geometry?.coordinates?.[0]}
                htmlAltitude={(d: any) => {
                    if (d.type === 'ISS') return 0.4; // High orbit
                    return 0.05; // News
                }}
                htmlElement={(d: any) => {
                    if (d.type === 'ISS') {
                        const el = document.createElement('div');
                        el.innerHTML = `
                            <div style="transform: translate(-50%, -50%); text-align: center;">
                                <div style="color: #00F0FF; font-size: 24px;">🛰️</div>
                                <div style="
                                    background: rgba(0,0,0,0.8); 
                                    border: 1px solid #00F0FF; 
                                    color: #00F0FF;
                                    padding: 2px 6px; 
                                    font-family: monospace; 
                                    font-size: 10px;
                                    margin-top: 4px;
                                    box-shadow: 0 0 10px #00F0FF;
                                ">ISS LIVE</div>
                            </div>
                        `;
                        return el;
                    }

                    // News Markers
                    const el = document.createElement('div');
                    el.innerHTML = `
                        <div class="news-marker group cursor-pointer">
                            <div class="w-1 h-1 bg-white/60 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)] animate-pulse"></div>
                            <div class="hidden group-hover:block absolute left-4 top-1/2 -translate-y-1/2 w-48 bg-black/90 border border-white/20 p-2 text-[10px] text-white backdrop-blur-md shadow-xl pointer-events-none z-50">
                                <div class="font-bold text-primary mb-1 truncate">${d.properties.domain.toUpperCase()}</div>
                                <div class="leading-tight line-clamp-3">${d.properties.title}</div>
                            </div>
                        </div>
                    `;
                    el.onclick = () => window.open(d.properties.url, '_blank');
                    return el;
                }}



                // INTERACTION & PHYSICS (The "Batmobile" Feel)


                // HEX BIN SPIKES REMOVED FOR PERFORMANCE

                // Interaction
                onPolygonClick={(d: any) => {
                    if (d.properties.data) {
                        const countryId = d.properties.data.id;

                        // COMPARISON MODE LOGIC
                        if (isComparisonMode && focusedCountry) {
                            setComparisonCountry(countryId);
                            // Optional: Don't move camera or move to midpoint?
                            // For now, let's keep camera focus on the "new" selection so user sees it.
                        } else {
                            setFocusedCountry(countryId);
                            setComparisonCountry(null); // Reset comparison if exiting/switching primary
                        }

                        // Calculate visuals centroid
                        let lat = d.properties.LABEL_Y;
                        let lng = d.properties.LABEL_X;

                        if (!lat || !lng) {
                            if (d.bbox) {
                                lng = (d.bbox[0] + d.bbox[2]) / 2;
                                lat = (d.bbox[1] + d.bbox[3]) / 2;
                            } else {
                                const coords = d.geometry.type === 'MultiPolygon'
                                    ? d.geometry.coordinates[0][0][0]
                                    : d.geometry.coordinates[0][0];
                                lng = coords[0];
                                lat = coords[1];
                            }
                        }

                        // Only update "Focused Location" marker if changing primary
                        // Or maybe show marker for both?
                        // For simplicity, update marker to latest clicked.
                        setFocusedLocation({ lat, lng, label: countryId });

                        // CAMERA HOMING: Smooth transition to country
                        if (globeEl.current) {
                            globeEl.current.pointOfView(
                                { lat, lng, altitude: 1.5 },
                                1500 // 1.5s transition
                            );
                        }
                    }
                }}
                polygonLabel={({ properties: p }: any) => {
                    if (!p.data) return '';
                    return `
            <div style="
                background: rgba(0, 5, 20, 0.9); 
                border: 1px solid ${HOLO_BLUE};
                padding: 8px 12px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 12px;
                color: #fff;
                box-shadow: 0 0 15px ${HOLO_BLUE}40;
            ">
                <div style="font-weight: bold; color: ${HOLO_BLUE}; letter-spacing: 1px;">
                    [${p.ISO_A3}] ${p.ADMIN.toUpperCase()}
                </div>
            </div>
            `;
                }}



                width={typeof window !== 'undefined' ? window.innerWidth : 1000}
                height={typeof window !== 'undefined' ? window.innerHeight : 1000}
            />

            {/* DECOUPLED TARGETING OVERLAY (Flicker Free) */}
            <div
                ref={overlayRef}
                className="absolute top-0 left-0 pointer-events-none transition-opacity duration-300"
                style={{ opacity: 0, zIndex: 100 }}
            >
                {focusedLocation && <TargetingMarker label={focusedLocation.label} />}
            </div>
        </div>
    );
};

export default GlobeView;
