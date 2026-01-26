# Contributing to GenQR

## 🚀 Recent Architecture Changes
To resolve navigation issues on deployment platforms (Vercel, Netlify), the project structure was updated on January 26, 2026. Please adhere to this new structure when contributing.

### 1. File Renaming & Routing
*   **`index.html` (formerly `landing.html`)**: This is now the **Project Root/Landing Page**. It serves as the marketing entry point.
*   **`app.html` (formerly `index.html`)**: This is now the **Application Page**. It contains the actual QR Code Generator tool.

### 2. Navigation Flow
*   **Forward**: Users navigate from `index.html` to `app.html` via "Launch App" buttons.
*   **Backward**: Users navigate from `app.html` back to `index.html` via the "← Back to Home" link.

### 3. Deployment Configuration (`vercel.json`)
*   **Clean URLs**: Enabled `cleanUrls: true` to allow accessing the app via `/app` instead of `/app.html`.
*   **Routing**: Removed wildcard rewrites (`source: "/(.*)"`) that were causing 404 errors by conflicting with static file serving.
*   **Root Directory**: The project is designed to be deployed from the `genqr` directory (files must be at the root of the deployment).

---

## 🛠️ Development Workflow

### Project Structure
```text
genqr/
├── index.html        # Landing Page (Marketing)
├── app.html          # Application Page (Generator Logic)
├── main.js           # Core JS Logic for QR Generation
├── styles.css        # App specific styles
├── landing.css       # Landing page specific styles
└── vercel.json       # Deployment configuration
```

### Running Locally
1.  Navigate to the project directory:
    ```bash
    cd genqr
    ```
2.  Start a local server (e.g., using Python):
    ```bash
    python -m http.server 8000
    ```
3.  Access the site:
    *   Landing: `http://localhost:8000/`
    *   App: `http://localhost:8000/app.html`

## 📝 How to Contribute
1.  **Fork** the repository.
2.  **Clone** your fork locally.
3.  **Create a Branch** for your feature or fix.
4.  **Test/Preview** your changes locally to ensure navigation works as expected.
5.  **Submit a Pull Request**.
