# 📧 DNS Configuration for TeleMedCare Email Services

**Domain:** `telemedcare.it`  
**Last Updated:** 2025-10-30  
**Status:** ✅ Configuration Ready

---

## 🔧 SENDGRID DNS RECORDS

### **Domain Authentication for SendGrid**

Add these records to your DNS provider (e.g., Cloudflare, GoDaddy, etc.):

| Type  | Host/Name                          | Value                                      | Priority | TTL  | Status    |
|-------|------------------------------------|--------------------------------------------|----------|------|-----------|
| CNAME | `em6551.telemedcare.it`           | `u56677468.wl219.sendgrid.net`            | -        | Auto | ⚠️ Pending |
| CNAME | `s1._domainkey.telemedcare.it`    | `s1.domainkey.u56677468.wl219.sendgrid.net` | -      | Auto | ⚠️ Pending |
| CNAME | `s2._domainkey.telemedcare.it`    | `s2.domainkey.u56677468.wl219.sendgrid.net` | -      | Auto | ⚠️ Pending |
| TXT   | `_dmarc.telemedcare.it`           | `v=DMARC1; p=none;`                       | -        | Auto | ⚠️ Pending |

### **SendGrid API Key**
```
API_KEY: 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
Status: ✅ Configured in .dev.vars
```

---

## 🔧 RESEND DNS RECORDS

### **Domain Authentication for Resend**

Add these records to your DNS provider:

#### **MX Record (Mail Exchange)**
| Type | Host/Name | Value                                      | Priority | TTL  | Status    |
|------|-----------|-------------------------------------------|----------|------|-----------|
| MX   | `send`    | `feedback-smtp.eu-west-1.amazonses.com`   | 10       | Auto | ⚠️ Pending |

#### **SPF Record (Sender Policy Framework)**
| Type | Host/Name | Value                               | Priority | TTL  | Status    |
|------|-----------|-------------------------------------|----------|------|-----------|
| TXT  | `send`    | `v=spf1 include:amazonses.com ~all` | -        | Auto | ⚠️ Pending |

#### **DKIM Record (DomainKeys Identified Mail)**
| Type | Host/Name              | Value                                                                                                                                                                            | Priority | TTL  | Status    |
|------|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------|-----------|
| TXT  | `resend._domainkey`    | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCt/RRcWFvf3HRar5ft42c+/EXmzIBm9ITUQ/6huXfQcNYmXuwa4+r6VhcUCIHIoiR36JVPi22T7O+2bjc57NyY/ULfrZML4DPEymE1B1ETNdLZhJPIDswjfci8fgxeyyNMdw2v8t6ZOQEWk+smIp0SKRLbI7H9QbauF+z9Dn7mpQIDAQAB` | -        | Auto | ⚠️ Pending |

#### **DMARC Record (Domain-based Message Authentication)**
| Type | Host/Name | Value                  | Priority | TTL  | Status    |
|------|-----------|------------------------|----------|------|-----------|
| TXT  | `_dmarc`  | `v=DMARC1; p=none;`    | -        | Auto | ⚠️ Pending |

### **Resend API Key**
```
API_KEY: re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2
Status: ✅ Configured in .dev.vars
```

---

## 📋 SETUP INSTRUCTIONS

### **Step 1: Access Your DNS Provider**

1. Log into your domain registrar or DNS provider (e.g., Cloudflare, GoDaddy, Namecheap)
2. Navigate to DNS Management section
3. Find the zone for `telemedcare.it`

### **Step 2: Add SendGrid Records**

```bash
# CNAME Records
Type: CNAME
Host: em6551
Points to: u56677468.wl219.sendgrid.net
TTL: Automatic (or 3600)

Type: CNAME
Host: s1._domainkey
Points to: s1.domainkey.u56677468.wl219.sendgrid.net
TTL: Automatic (or 3600)

Type: CNAME
Host: s2._domainkey
Points to: s2.domainkey.u56677468.wl219.sendgrid.net
TTL: Automatic (or 3600)

# TXT Record (DMARC)
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none;
TTL: Automatic (or 3600)
```

### **Step 3: Add Resend Records**

```bash
# MX Record
Type: MX
Host: send
Points to: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
TTL: Automatic (or 3600)

# TXT Record (SPF)
Type: TXT
Host: send
Value: v=spf1 include:amazonses.com ~all
TTL: Automatic (or 3600)

# TXT Record (DKIM)
Type: TXT
Host: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCt/RRcWFvf3HRar5ft42c+/EXmzIBm9ITUQ/6huXfQcNYmXuwa4+r6VhcUCIHIoiR36JVPi22T7O+2bjc57NyY/ULfrZML4DPEymE1B1ETNdLZhJPIDswjfci8fgxeyyNMdw2v8t6ZOQEWk+smIp0SKRLbI7H9QbauF+z9Dn7mpQIDAQAB
TTL: Automatic (or 3600)

# TXT Record (DMARC)
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none;
TTL: Automatic (or 3600)
```

### **Step 4: Verify DNS Propagation**

**Wait Time:** DNS changes can take 24-48 hours to propagate globally, but typically take 1-2 hours.

**Check Propagation:**
```bash
# Check CNAME records
dig em6551.telemedcare.it CNAME
dig s1._domainkey.telemedcare.it CNAME
dig s2._domainkey.telemedcare.it CNAME

# Check TXT records
dig _dmarc.telemedcare.it TXT
dig send.telemedcare.it TXT
dig resend._domainkey.telemedcare.it TXT

# Check MX record
dig send.telemedcare.it MX
```

**Online Tools:**
- https://mxtoolbox.com/SuperTool.aspx
- https://dnschecker.org/
- https://www.whatsmydns.net/

### **Step 5: Verify in SendGrid Dashboard**

1. Log into SendGrid: https://app.sendgrid.com
2. Go to **Settings** → **Sender Authentication**
3. Find your domain `telemedcare.it`
4. Click **Verify** to check DNS records
5. Wait for ✅ green checkmarks on all records

### **Step 6: Verify in Resend Dashboard**

1. Log into Resend: https://resend.com/domains
2. Go to **Domains** section
3. Find your domain `send.telemedcare.it`
4. Click **Verify** to check DNS records
5. Wait for ✅ verified status

---

## ⚠️ IMPORTANT NOTES

### **DNS Record Priority**

1. **DKIM (Highest Priority)** - Required for email authentication
2. **SPF (High Priority)** - Prevents email spoofing
3. **DMARC (Medium Priority)** - Email policy enforcement
4. **MX (Resend Only)** - Required for Resend to receive emails

### **Common Issues**

#### **Issue 1: DNS Not Propagating**
**Solution:** Wait 1-2 hours. Check with online tools listed above.

#### **Issue 2: TXT Record Too Long**
**Solution:** Some DNS providers require splitting long TXT records. Contact your DNS provider.

#### **Issue 3: CNAME Already Exists**
**Solution:** Remove existing CNAME and add the new one. Cannot have duplicate CNAMEs.

#### **Issue 4: Verification Fails**
**Solution:** 
- Double-check all values are exact (no extra spaces)
- Ensure TTL is set correctly
- Wait for full DNS propagation (up to 48 hours)

---

## 🔐 SECURITY RECOMMENDATIONS

### **DMARC Policy Evolution**

Start with `p=none` (monitoring mode), then gradually increase:

```
Phase 1 (Current): v=DMARC1; p=none;
  → Monitor only, no action taken

Phase 2 (After 30 days): v=DMARC1; p=quarantine; pct=10;
  → Quarantine 10% of suspicious emails

Phase 3 (After 90 days): v=DMARC1; p=quarantine; pct=100;
  → Quarantine all suspicious emails

Phase 4 (After 180 days): v=DMARC1; p=reject;
  → Reject all suspicious emails
```

### **SPF Hardening**

Consider changing from `~all` (soft fail) to `-all` (hard fail) after verification:

```
Current: v=spf1 include:amazonses.com ~all
Hardened: v=spf1 include:amazonses.com -all
```

---

## 📊 TESTING AFTER DNS SETUP

### **Test Email Sending**

```bash
# Test with Resend (primary)
curl -X POST http://localhost:3000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email - Resend",
    "provider": "resend"
  }'

# Test with SendGrid (failover)
curl -X POST http://localhost:3000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email - SendGrid",
    "provider": "sendgrid"
  }'
```

### **Verify Email Headers**

When you receive test emails, check headers for:
- ✅ `SPF: PASS`
- ✅ `DKIM: PASS`
- ✅ `DMARC: PASS`

---

## 📞 SUPPORT CONTACTS

### **SendGrid Support**
- Dashboard: https://app.sendgrid.com
- Documentation: https://docs.sendgrid.com
- Support: https://support.sendgrid.com

### **Resend Support**
- Dashboard: https://resend.com
- Documentation: https://resend.com/docs
- Support: support@resend.com

### **DNS Provider Support**
Contact your domain registrar/DNS provider for DNS-specific issues.

---

## ✅ CHECKLIST

Before going live with email sending:

- [ ] All SendGrid CNAME records added to DNS
- [ ] SendGrid DMARC record added to DNS
- [ ] All Resend MX/SPF/DKIM/DMARC records added to DNS
- [ ] DNS propagation verified (1-2 hours wait)
- [ ] SendGrid domain verified in dashboard
- [ ] Resend domain verified in dashboard
- [ ] Test email sent successfully with Resend
- [ ] Test email sent successfully with SendGrid
- [ ] Email headers verified (SPF/DKIM/DMARC pass)
- [ ] API keys configured in production (Cloudflare Secrets)

---

**Document Status:** ✅ Ready for DNS Configuration  
**Next Step:** Add DNS records to your DNS provider  
**Estimated Setup Time:** 15 minutes + 1-2 hours DNS propagation
