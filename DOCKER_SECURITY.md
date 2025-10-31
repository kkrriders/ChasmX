# Docker Security Guide

## 🔒 Addressing Vulnerability Warnings

### What Are These Vulnerabilities?

Docker images can have security vulnerabilities in:
1. **Base OS packages** (Alpine, Debian packages)
2. **Language runtime** (Node.js, Python)
3. **Dependencies** (npm packages, pip packages)

## ✅ What We've Fixed

### 1. Updated Dockerfiles with Security Patches

**Frontend** (`apps/web/Dockerfile`):
- Added `apk update && apk upgrade` to patch Alpine packages
- Using specific Alpine version (3.19)

**Backend** (`apps/backend/Dockerfile`):
- Added `apt-get upgrade -y` to patch Debian packages
- Added `curl` for health checks

### 2. Use Specific Version Tags

✅ **Good:**
```dockerfile
FROM node:20-alpine3.19
FROM python:3.11-slim
```

❌ **Avoid:**
```dockerfile
FROM node:latest
FROM python:latest
```

## 🛠️ Additional Security Measures

### Scan Your Images

```bash
# Install trivy (security scanner)
# On macOS
brew install trivy

# On Linux
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update && sudo apt-get install trivy

# Scan your images
trivy image chasmx-backend
trivy image chasmx-frontend
```

### Rebuild Images Regularly

```bash
# Rebuild to get latest security patches
docker-compose -f config/docker-compose.dev.yml build --no-cache
```

### Keep Dependencies Updated

**Backend:**
```bash
cd apps/backend
pip list --outdated
pip install --upgrade <package>
```

**Frontend:**
```bash
cd apps/web
npm outdated
npm update
npm audit fix
```

## 📊 Understanding Vulnerability Severity

| Severity | Action Needed | Timeline |
|----------|---------------|----------|
| **CRITICAL** | Fix immediately | ASAP |
| **HIGH** | Fix soon | Within days |
| **MEDIUM** | Fix when possible | Within weeks |
| **LOW** | Optional | When convenient |

## 🔐 Production Security Checklist

- [ ] Use specific image tags (not `latest`)
- [ ] Run containers as non-root user
- [ ] Keep base images updated
- [ ] Scan images for vulnerabilities
- [ ] Update dependencies regularly
- [ ] Use `.dockerignore` to exclude sensitive files
- [ ] Don't include secrets in images
- [ ] Enable Docker Content Trust
- [ ] Use read-only filesystems when possible
- [ ] Limit container resources (CPU, memory)

## 🚀 Current Security Status

### Frontend
- ✅ Using `node:20-alpine3.19` (specific version)
- ✅ Runs as non-root user (`nextjs`)
- ✅ Alpine packages updated on build
- ✅ Multi-stage build (smaller attack surface)

### Backend
- ✅ Using `python:3.11-slim` (specific version)
- ✅ System packages updated on build
- ✅ Minimal dependencies installed
- ⚠️ Runs as root (can improve)

### Redis
- ✅ Official Redis image (`redis:7-alpine`)
- ✅ Password protected
- ✅ Persistent storage

## 🔧 Improving Backend Security

To run backend as non-root:

```dockerfile
# Add after installing dependencies
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser
```

## 📝 Monitoring Vulnerabilities

### Set Up Automated Scanning

**GitHub (if using):**
- Enable Dependabot alerts
- Enable security scanning
- Review PRs for security issues

**Docker Hub:**
- Enable automatic security scanning
- Review scan results regularly

### Manual Checks

```bash
# Check npm vulnerabilities
cd apps/web
npm audit

# Check Python vulnerabilities
cd apps/backend
pip-audit  # install: pip install pip-audit
```

## 🎯 Best Practices

1. **Update regularly** - Rebuild images weekly/monthly
2. **Scan before deploy** - Run security scans in CI/CD
3. **Monitor alerts** - Subscribe to security advisories
4. **Minimal images** - Use slim/alpine variants
5. **Layer optimization** - Fewer layers = less to scan
6. **No secrets** - Never hardcode credentials

## 🆘 If You See Critical Vulnerabilities

1. **Check if exploitable** - Is the vulnerable code actually used?
2. **Update base image** - Try newer version tag
3. **Update dependencies** - `npm update` / `pip install --upgrade`
4. **Check for patches** - Look for security patches
5. **Consider alternatives** - Switch to more secure packages

## 📚 Resources

- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [OWASP Docker Security](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Snyk Vulnerability Database](https://security.snyk.io/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)

---

**Remember:** Some vulnerabilities are acceptable in development but should be fixed for production!
