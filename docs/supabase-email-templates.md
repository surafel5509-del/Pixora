# Pixora email verification setup

The app sends new users back to `https://pixora-surafel5509-del.vercel.app/?verified=1` after Supabase confirms their email. The app can display the success message and open the sign-in dialog, but the sender name, SMTP delivery, and message HTML are controlled by the Supabase Auth project settings—not by frontend code.

## Required Supabase dashboard settings

1. Open **Authentication → URL Configuration** for the existing Pixora Supabase project.
2. Set **Site URL** to `https://pixora-surafel5509-del.vercel.app`.
3. Add `https://pixora-surafel5509-del.vercel.app/**` to the allowed redirect URLs.
4. Open **Authentication → Email Templates → Confirm signup**.
5. Set the subject to **Welcome to Pixora — verify your email** and sender display name to **Pixora** where supported by the configured SMTP provider.
6. Replace the confirmation template body with the HTML below. Keep Supabase's `{{ .ConfirmationURL }}` variable intact.
7. For reliable delivery and branded sender addresses, configure a verified domain and SMTP provider in **Authentication → SMTP Settings**. Without custom SMTP, Supabase's default mail service may have delivery limits or show Supabase as sender. Do not claim mail is sent until a real inbox test succeeds.

## Suggested confirmation email HTML

```html
<div style="margin:0;background:#f6f7f1;padding:36px 12px;font-family:Arial,sans-serif;color:#25251f">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e7e9df;border-radius:20px;overflow:hidden">
    <div style="padding:28px 32px;background:#d9fb65">
      <div style="font-size:26px;font-weight:800;letter-spacing:-1px">✳ Pixora</div>
      <p style="margin:8px 0 0;font-size:12px;letter-spacing:2px;font-weight:700">YOUR SPACE FOR INSPIRATION</p>
    </div>
    <div style="padding:32px">
      <h1 style="font-size:26px;line-height:1.25;margin:0 0 16px">Welcome to Pixora!</h1>
      <p style="font-size:15px;line-height:1.7">Thanks for joining Pixora. You're one step away from saving ideas, discovering fresh visuals, and building your own creative collection.</p>
      <p style="font-size:15px;line-height:1.7">Please confirm that this email address belongs to you. This helps keep your account secure.</p>
      <p style="text-align:center;margin:28px 0">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#25251f;color:#ffffff;text-decoration:none;padding:15px 25px;border-radius:10px;font-weight:700">Click to verify</a>
      </p>
      <p style="font-size:12px;line-height:1.7;color:#77796f">If you didn't create a Pixora account, you can safely ignore this email.</p>
      <hr style="border:0;border-top:1px solid #e7e9df;margin:26px 0">
      <p style="font-size:11px;color:#8b8d82">Pixora · Made for the endlessly curious</p>
    </div>
  </div>
</div>
```

## Verification test checklist

- Sign up with an inbox you can access.
- Confirm the message arrives and the sender shows Pixora.
- Click **Click to verify**.
- Confirm the browser returns to Pixora, shows the verified notice, and opens the sign-in dialog.
- Sign in with the new account and verify the session is active.

Never paste service-role keys or SMTP passwords into the frontend or commit them to Git.
