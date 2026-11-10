# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take the security of Ipsumify seriously. If you discover a security vulnerability, please help us protect our users by following responsible disclosure practices.

### How to Report

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them by:

1. **Private advisory**: Open one at https://github.com/ICJIA/ipsumify-next-2026/security/advisories
2. **Title**: Include "SECURITY" in the title
3. **Details**: Provide as much information as possible:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt of your vulnerability report within 48 hours
- **Assessment**: We'll investigate and assess the severity within 5 business days
- **Updates**: We'll keep you informed about our progress
- **Resolution**: We'll work to address confirmed vulnerabilities promptly
- **Credit**: We'll credit you in the release notes (unless you prefer to remain anonymous)

### Response Timeline

| Severity | Initial Response | Fix Target |
|----------|-----------------|------------|
| Critical | 24 hours        | 7 days     |
| High     | 48 hours        | 14 days    |
| Medium   | 5 days          | 30 days    |
| Low      | 7 days          | 60 days    |

## Security Best Practices

### For Users

- Always use the latest version of Ipsumify
- Review the release notes for security fixes
- Report suspicious behavior or potential vulnerabilities

### For Contributors

- Never commit sensitive data (API keys, passwords, tokens)
- Use `.env.local` for local secrets (never committed)
- Follow OWASP guidelines for web security
- Run security audits with `yarn audit`
- Keep dependencies up to date

## Security Features

Ipsumify implements several security measures:

### HTTP Security Headers

- **Content-Security-Policy**: Restricts resource loading
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Strict-Transport-Security**: Forces HTTPS
- **Referrer-Policy**: Controls referrer information

### Client-Side Security

- No external JavaScript in production; the only third-party request fetches icon data (JSON) from `api.iconify.design`
- localStorage only (no cookies)
- No user authentication required
- No server-side data storage
- The page is prerendered and static; the only server code is the stateless `GET /api/generate` function, which validates its inputs and reads no user data

## Known Limitations

- **LocalStorage**: User preferences stored in browser (can be cleared)
- **Share URLs**: Settings encoded in URL (visible in browser history)
- **Security headers on the API**: The headers in `netlify.toml` apply to the static pages; `/api/generate` responses come from a Netlify Function and carry only `X-Content-Type-Options` and HSTS
- **Public API**: No authentication or rate limiting; responses are CDN-cached for an hour

## Vulnerability Disclosure Policy

- We follow a 90-day disclosure policy
- Security fixes are released as soon as possible
- We coordinate disclosure with affected parties
- Public disclosure happens after fix is released

## Third-Party Dependencies

We regularly monitor and update dependencies for security vulnerabilities:

- Automated updates via Dependabot
- Manual security audits quarterly
- Zero-tolerance for high-severity vulnerabilities

## Contact

For security concerns, contact:
- Private advisory: https://github.com/ICJIA/ipsumify-next-2026/security/advisories
- GitHub: @ICJIA (for general inquiries only, not vulnerabilities)

---

**Thank you for helping keep Ipsumify and our users safe!**
