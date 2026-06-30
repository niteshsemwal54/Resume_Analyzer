# AI Resume Analyzer

A complete MERN stack app for uploading resumes, extracting text, analyzing ATS fit with AI, and reviewing previous results.

## Features
- JWT authentication with bcrypt
- Resume upload restricted to PDF files
- Text extraction with pdf-parse
- AI analysis with OpenAI-compatible API
- Dashboard, history, and analysis detail views
- Tailwind UI with toast notifications

## Setup
1. Run `npm install`
2. Copy `.env.example` to `.env` and configure values
3. Start MongoDB locally
4. Run `npm run dev`

## Project Structure
- client: React + Vite frontend
- server: Express + MongoDB backend
