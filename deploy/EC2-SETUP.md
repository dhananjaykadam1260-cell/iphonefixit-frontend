# iPhoneFixit frontend CI/CD

Complete the shared setup in the backend repository:
https://github.com/dhananjaykadam1260-cell/iphonefixit-backend/blob/codex/ec2-cicd/deploy/EC2-SETUP.md

Set the six repository secrets listed there, plus PUBLIC_URL to your website
origin (no trailing slash). VITE_API_URL is /api; VITE_BACKEND_URL uses PUBLIC_URL
for uploaded images. Local .env files are excluded from the Docker build.

Deploy the backend first. Then set ENABLE_EC2_DEPLOY=true and run the frontend
workflow on main. Nginx owns port 80 and routes /api and /uploads to the shared
Docker network. React routes such as /admin/login support direct navigation.

Pull requests build without pushing/deploying. Main pushes publish SHA-tagged
images and deploy only when enabled. The frontend has no test script, so CI
validates its production build. Verify login, tracking, uploads and bills after
the first deployment; the container health check only checks Nginx.

Configure HTTPS and update PUBLIC_URL and the backend URL settings before real
use. These files provide the initial HTTP deployment, not HTTPS provisioning.
