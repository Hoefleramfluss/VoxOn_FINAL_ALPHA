
# VoiceOmni SaaS - Deployment Guide

This repository contains the SOTA Voice AI Platform powered by Google Gemini Live API.

## 🏗 Architecture

*   **Frontend**: React + Vite + TypeScript (SPA).
*   **Infrastructure**: Google Cloud Platform (Cloud Run, Artifact Registry).
*   **IAC**: Terraform.
*   **CI/CD**: GitHub Actions (Recommended for Windsurf usage).

## 🚀 Going Live (Step-by-Step)

### 1. Prerequisites
*   Google Cloud Platform Account.
*   `gcloud` CLI installed.
*   `terraform` installed.

### 2. Configuration
The application uses `src/config.ts` to manage environments.
Create a `.env` file in the root for local development:
```bash
VITE_USE_MOCK=true
VITE_GEMINI_API_KEY=your_key_here
```

### 3. Build Docker Image
To deploy, we containerize the application.
```bash
# Build
docker build -t gcr.io/[PROJECT_ID]/voiceomni-app:latest .

# Push to GCP
gcloud auth configure-docker
docker push gcr.io/[PROJECT_ID]/voiceomni-app:latest
```

### 4. Infrastructure with Terraform
This will set up your Cloud Run service and Secret Manager.

1.  Navigate to `terraform/`.
2.  Update `variables` or create a `terraform.tfvars` file.
3.  Run:
    ```bash
    terraform init
    terraform plan
    terraform apply
    ```

### 5. Switching to Real Data
Currently, the app runs in **Mock Mode** (`VITE_USE_MOCK=true`).
To connect to a real backend:

1.  Deploy your Node.js backend (using the code generated in the Dashboard "Twilio" tab).
2.  Update the `VITE_API_URL` environment variable in your deployment to point to the backend URL.
3.  Set `VITE_USE_MOCK=false`.
4.  Uncomment the fetch logic in `src/services/api.ts`.

## 🛠 Tech Stack
*   **Gemini Live API**: Real-time WebSocket audio streaming.
*   **TailwindCSS**: Styling.
*   **React 19**: Frontend Framework.
*   **Twilio**: (Prepared) Phone number provisioning.
