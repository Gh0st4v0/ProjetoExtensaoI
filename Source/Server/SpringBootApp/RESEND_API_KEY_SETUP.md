# How to Configure RESEND_API_KEY

The application now starts successfully without the API key, but **email sending is disabled**. To enable password recovery emails:

## Option 1: Set Environment Variable (Recommended for Production)

### Windows (Command Prompt):
```cmd
set RESEND_API_KEY=your-api-key-here
mvn spring-boot:run
```

### Windows (PowerShell):
```powershell
$env:RESEND_API_KEY="your-api-key-here"
mvn spring-boot:run
```

### Linux/Mac:
```bash
export RESEND_API_KEY=your-api-key-here
mvn spring-boot:run
```

## Option 2: IntelliJ IDEA / IDE Configuration

1. Go to **Run** → **Edit Configurations**
2. Select your Spring Boot application
3. In **Environment Variables**, add:
   ```
   RESEND_API_KEY=your-api-key-here
   ```
4. Click **Apply** and **OK**

## Option 3: application.yaml (For Development Only - NOT recommended for production)

Add to `src/main/resources/application.yaml`:
```yaml
RESEND_API_KEY: your-api-key-here
```

⚠️ **WARNING**: Never commit API keys to Git!

## Getting Your API Key

1. Go to https://resend.com/
2. Sign up or log in
3. Go to https://resend.com/api-keys
4. Create a new API key
5. Copy the key (it starts with `re_`)

## Testing Without Email

The application will now start **without** the API key configured. When you test password recovery:

- The API will work normally (check rate limiting, generate tokens, etc.)
- **No email will be sent**
- Instead, you'll see a **log message** in the console with the reset token
- You can copy the token from the logs to test the reset-password endpoint

### Example Log Output:
```
WARN: RESEND_API_KEY not configured. Email would be sent to: gustavo.135.andrade@gmail.com
      Reset link: http://localhost:3000/reset-password?token=abc-123-def-456
      To enable email sending, set the RESEND_API_KEY environment variable.
```

## Current Behavior

✅ **App starts successfully** (even without API key)  
✅ **All endpoints work** (login, password recovery request, reset password)  
✅ **Rate limiting works** (5-minute cooldown)  
✅ **Token generation works** (1-hour expiration)  
⚠️ **Emails are logged to console** (not sent) when API key is missing  
✅ **Emails are sent via Resend** when API key is configured  

This allows you to test the complete flow locally without needing to configure email immediately!
