# Supabase email templates

Pixora delegates authentication to Supabase. The app sends users back to `{{SITE_URL}}/auth` after email
confirmation, magic-link sign-in or password reset — the sender name, SMTP delivery and message HTML are all
controlled by the Supabase Auth project settings, **not** by frontend code.

Redirect targets used by the app (see `src/context/AuthProvider.tsx`):

| Flow           | Redirect                      |
| -------------- | ----------------------------- |
| Confirm signup | `${SITE_URL}/auth?verified=1` |
| Magic link     | `${SITE_URL}/auth`            |
| Password reset | `${SITE_URL}/auth?reset=1`    |

`SITE_URL` comes from `VITE_SITE_URL` (falls back to `window.location.origin` in development).

## 1. URL configuration

1. Open **Authentication → URL Configuration** in your Supabase project.
2. Set **Site URL** to your production origin, e.g. `https://pixora.example.com`.
3. Add these to **Redirect URLs**:
   - `https://pixora.example.com/auth`
   - `https://pixora.example.com/auth?verified=1`
   - `https://pixora.example.com/auth?reset=1`
   - `http://localhost:5173/auth` (and the other two variants, for local development)

Confirmation links are opened in the browser where the sign-up started. If the link is opened on another device,
Supabase falls back to the Site URL — Pixora then shows a sign-in prompt rather than silently failing.

## 2. Sender and SMTP

Open **Authentication → Emails → SMTP Settings** and configure a verified domain. Without custom SMTP, Supabase's
default mailer has strict rate limits and shows Supabase as the sender. Do not claim mail delivery works until a real
inbox test succeeds.

Recommended identities:

- Confirm signup — `Pixora <hello@pixora.example.com>`, subject `Welcome to Pixora — verify your email`
- Magic link — `Pixora <hello@pixora.example.com>`, subject `Your Pixora sign-in link`
- Reset password — `Pixora <hello@pixora.example.com>`, subject `Reset your Pixora password`

## 3. Confirmation email HTML

Paste into **Authentication → Emails → Confirm signup**. Keep Supabase's `{{ .ConfirmationURL }}` variable intact.

```html
<div style="margin:0;background:#fbfaf7;padding:36px 12px;font-family:Inter,Arial,sans-serif;color:#14150f">
  <div
    style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e7e4da;border-radius:24px;overflow:hidden"
  >
    <div style="padding:28px 32px;background:#c6f24e;color:#24270d">
      <div style="font-size:26px;font-weight:800;letter-spacing:-1px">✳ Pixora</div>
      <p style="margin:8px 0 0;font-size:11px;letter-spacing:2px;font-weight:700">
        YOUR SPACE FOR INSPIRATION
      </p>
    </div>
    <div style="padding:32px">
      <h1 style="font-size:26px;line-height:1.25;margin:0 0 16px">Welcome to Pixora</h1>
      <p style="font-size:15px;line-height:1.7;margin:0 0 14px">
        Thanks for joining Pixora. You're one step away from saving ideas, discovering fresh visuals and
        building boards you can actually make from.
      </p>
      <p style="font-size:15px;line-height:1.7;margin:0">
        Please confirm this email address belongs to you — it keeps your account and library secure.
      </p>
      <p style="text-align:center;margin:28px 0">
        <a
          href="{{ .ConfirmationURL }}"
          style="display:inline-block;background:#14150f;color:#fbfaf7;text-decoration:none;padding:15px 26px;border-radius:12px;font-weight:700"
        >
          Verify my email
        </a>
      </p>
      <p style="font-size:12px;line-height:1.7;color:#6c7263">
        If you didn't create a Pixora account, you can safely ignore this email.
      </p>
      <hr style="border:0;border-top:1px solid #e7e4da;margin:26px 0" />
      <p style="font-size:11px;color:#8b8d82;margin:0">Pixora · Made for the endlessly curious</p>
    </div>
  </div>
</div>
```

## 4. Reset password email HTML

Paste into **Authentication → Emails → Reset password**. Keep `{{ .ConfirmationURL }}` intact.

```html
<div style="margin:0;background:#fbfaf7;padding:36px 12px;font-family:Inter,Arial,sans-serif;color:#14150f">
  <div
    style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e7e4da;border-radius:24px;padding:32px"
  >
    <div style="font-size:22px;font-weight:800;letter-spacing:-1px">✳ Pixora</div>
    <h1 style="font-size:24px;line-height:1.25;margin:20px 0 14px">Reset your password</h1>
    <p style="font-size:15px;line-height:1.7;margin:0 0 24px">
      We received a request to reset the password for this account. Use the button below to choose a new one.
      The link expires shortly for your security.
    </p>
    <p style="text-align:center;margin:0 0 24px">
      <a
        href="{{ .ConfirmationURL }}"
        style="display:inline-block;background:#14150f;color:#fbfaf7;text-decoration:none;padding:15px 26px;border-radius:12px;font-weight:700"
      >
        Choose a new password
      </a>
    </p>
    <p style="font-size:12px;line-height:1.7;color:#6c7263;margin:0">
      If you didn't request this, no action is needed — your password stays unchanged.
    </p>
  </div>
</div>
```

## 5. Verification checklist

- [ ] Sign up with an inbox you can access.
- [ ] The message arrives, shows the Pixora sender and renders on mobile.
- [ ] Clicking through lands on `/auth` with a "Email confirmed" toast and the sign-in form.
- [ ] Sign in with the new account; the sidebar shows your email and the sync badge turns to **Cloud sync active**.
- [ ] Request a magic link from the account dialog; it signs you in on the same device.
- [ ] Request a password reset; the link lands on `/auth` and the new password works.

## Security notes

- Never paste service-role keys or SMTP passwords into frontend code, `.env.local` files committed to Git, or issues.
- Only `VITE_`-prefixed variables are exposed to the browser — everything else stays server-side.
- If you disable email confirmation for local development, re-enable it before launching.
