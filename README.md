# Tignan: SOS and Emergency Response System

**Official Entry for Komsai Hack 2026: RiskReady**

Tignan is a real-time emergency response platform built to streamline citizen safety and incident management. It was developed to answer the call of RiskReady: Tech Solutions for Disaster Readiness, aiming to empower communities and increase awareness of disaster risk reduction and management.

## The Challenge

The Komsai Hack 2026 required a solution to support people during emergencies and promote resiliency in times of crisis. 

Tignan addresses this by connecting people directly to the nearest available support groups. It provides a unified system where:
- Citizens can broadcast emergency alerts with their exact location.
- Rescuers get fast-tracked dispatch information so they can arrive faster.
- Command centers have a live map-based view to orchestrate the response.

By linking these parties efficiently, we hope to foster a more disaster-ready community.

## Features

- Real-time SOS Alerting: Instant emergency triggers with location tracking.
- Dynamic Dispatching: Route incidents to the nearest available responders.
- Live Monitoring: Map-based dashboard for managing incidents and rescuer teams.
- Incident Management: Track everything from the initial alert creation until the patient is safe.

## Technical Stack

Tignan is a monorepo spanning web and mobile:

- `admin/`: Web-based command center (React 19, Vite 8, Tailwind CSS 4).
- `rescuer/`: Mobile application for field responders (Expo, NativeWind, Mapbox).
- `user/`: Mobile application for citizens needing assistance (Expo, NativeWind).
- `schema/`: Database, authentication, and real-time backend (PostgreSQL & Supabase).

---
*Built with Mwamwa for Komsai Hack 2026: RiskReady*
