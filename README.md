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

## Future Expansions

While the current iteration focuses on core SOS alerting and routing, there are several planned incremental updates to enhance the platform's capabilities:
- **In-App Chat Communication**: Enabling direct messaging between the citizen in distress and the assigned rescuer to provide ongoing updates and first-aid instructions.
- **Push Notifications System**: Implementing robust background push notifications to ensure rescuers are alerted immediately, even when the application is closed.
- **Offline SMS Fallback**: Allowing users without mobile data or internet access to trigger an SOS alert or receive updates via standard SMS text messaging.
- **Multi-Language & Localization Support**: Adding support for local dialects (e.g., Tagalog, Cebuano) to ensure the application is accessible to more communities.
- **Enhanced Role Management**: Expanding the admin dashboard to include granular roles such as dispatchers, field commanders, and system administrators for better organizational control.

## Acknowledgements

This project was developed with the assistance of several AI tools for documentation, scaffolding, planning, and assisted coding:
- Claude
- Gemini
- ChatGPT

---
*Built with Love for Komsai Hack 2026: RiskReady*
*Team Semicolon*
