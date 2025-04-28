# Passwordless Authentication Flow for Wix Velo

## Overview

This project implements a **custom passwordless login system** using the **Wix Velo** backend platform.  
It replaces traditional password-based login with a **secure, email-based verification code** workflow.  
The goal was to enhance user experience and security for external users on a Wix-built platform.

While built for Wix, the design principles behind this project are applicable to broader serverless environments.

---

## Why Passwordless?

- Reduce user friction during login
- Eliminate risks associated with password storage
- Provide a modern authentication experience aligned with industry trends (e.g., magic links, verification codes)

---

## Architecture

- **Frontend**: Triggers backend verification code request
- **Backend (Wix Velo)**:
  - Generates a one-time use code
  - Saves code with expiration to Wix Data collection
  - Sends code to user's email using Wix CRM/Email APIs
  - Verifies user code during login attempt
  - Issues session authentication

**Key Libraries:**
- `wix-members-backend`
- `wix-crm-backend`
- `wix-data`
- `wix-web-module`

---

## Core Flow

1. **Request Login**:  
   User submits their email → backend generates random code → email sent.

2. **Submit Verification Code**:  
   User enters code → backend checks validity → authenticates the user.

3. **Security**:  
   Codes expire after [X] minutes to prevent misuse.

---

## Code Files

- **wix-passwordless.js** — The full implementation using Wix libraries.
- **generic-passwordless.js** — A framework-independent version, demonstrating the same logic without Wix APIs.

---

## Challenges Addressed

- No native passwordless login support on Wix at the time
- Designed for scalability: future-proof for SMS-based verification or OAuth expansion
- Modular and reusable backend functions

---

## Potential Improvements

- Add rate limiting for code requests
- Enhance monitoring for failed login attempts
- Use token-based session instead of Wix default sessions

---

## About This Project

This was developed as part of a customer portal modernization project, focused on improving the user experience and aligning with security best practices in web authentication.

---

