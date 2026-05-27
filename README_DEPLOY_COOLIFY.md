# Coolify Deployment

Coolify settings:
- Build Pack: Dockerfile
- Base Directory: /
- Dockerfile Location: /Dockerfile
- Ports Exposes: 80
- Ports Mappings: empty
- Environment Variables: set `GHL_PRIVATE_INTEGRATION_TOKEN` and `GHL_LOCATION_ID`; optional values are listed in `.env.example`
- Force HTTPS: disable for first test, enable after HTTP works
- Test temporary domain first with http://xxxxx.sslip.io
