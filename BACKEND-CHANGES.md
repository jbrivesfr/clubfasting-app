# BACKEND CHANGES REQUIRED - SUPERCLUB

**Repo backend:** jbrivesfr/superclub
**Pour:** ClubFasting React Native App

---

## 🎯 OBJECTIF

Adapter le backend superclub (PHP + Supabase) pour qu'il fonctionne avec l'app mobile React Native.

**Changements principaux:**
1. Pas de changement database (Supabase reste identique)
2. App utilisera directement Supabase JS SDK (pas besoin PHP API pour la plupart)
3. Quelques ajustements pour compatibility mobile

---

## ✅ CE QUI FONCTIONNE DÉJÀ

L'app React Native peut utiliser **directement** Supabase sans passer par le backend PHP:

**Via Supabase JS SDK:**
- ✅ Authentication (login, signup, signout)
- ✅ Lire feed (table `comments` où `type='post'`)
- ✅ Lire commentaires (table `comments` où `parent_id=X`)
- ✅ Créer posts/commentaires (INSERT dans `comments`)
- ✅ Upload images (Supabase Storage)
- ✅ Lire profile (table `users`)
- ✅ Real-time subscriptions (live updates)

**Donc:** 90% de l'app fonctionne sans toucher au backend PHP!

---

## 🔧 CHANGEMENTS NÉCESSAIRES

### 1. Supabase Row Level Security (RLS) - IMPORTANT

**Problème:**
Le backend PHP utilise `SUPABASE_SERVICE_KEY` (bypass RLS), mais l'app mobile utilise `SUPABASE_ANON_KEY` (respecte RLS).

**Solution:**
Activer RLS policies sur les tables principales.

#### Comments Table (Feed + Commentaires)

```sql
-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read posts/comments
CREATE POLICY "Public can view posts and comments"
  ON comments FOR SELECT
  USING (true);

-- Policy: Authenticated users can create posts/comments
CREATE POLICY "Authenticated users can create posts/comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own posts/comments
CREATE POLICY "Users can update own posts/comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own posts/comments
CREATE POLICY "Users can delete own posts/comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);
```

#### Users Table

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read public user info
CREATE POLICY "Public can view user profiles"
  ON users FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### Subscriptions Table

```sql
-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert subscriptions (webhook)
CREATE POLICY "Service can insert subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (true);
```

#### Storage Buckets (Images)

```sql
-- Create public bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Policy: Anyone can read images
CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

### 2. Likes Increment Function

**Problème:**
App besoin increment likes sans race condition.

**Solution:**
Créer fonction PostgreSQL.

```sql
-- Function to increment likes
CREATE OR REPLACE FUNCTION increment_likes(post_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE comments
  SET likes = likes + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION increment_likes(bigint) TO authenticated;
```

**Usage dans app:**
```javascript
await supabase.rpc('increment_likes', { post_id: 123 })
```

---

### 3. Replies Counter Trigger

**Problème:**
Quand quelqu'un commente, besoin increment `replies` count du post parent.

**Solution:**
Trigger PostgreSQL automatique.

```sql
-- Function to increment replies count
CREATE OR REPLACE FUNCTION increment_replies()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'comment' AND NEW.parent_id IS NOT NULL THEN
    UPDATE comments
    SET replies = replies + 1
    WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on insert
CREATE TRIGGER increment_replies_trigger
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION increment_replies();
```

---

### 4. User Metadata in Auth

**Problème:**
Quand user signup, besoin stocker `name` dans auth metadata pour l'utiliser facilement.

**Solution:**
Déjà géré dans l'app (voir PROJECT-SPEC.md signUp function).

App fait:
1. Create auth user
2. Insert dans table `users` avec user.id

---

### 5. Subscription Verification Webhook (Optionnel MVP)

**Pour production:**
Besoin webhook pour vérifier In-App Purchases avec Apple/Google.

**Solutions:**
- Expo Purchase Server Webhook
- RevenueCat (service tiers - RECOMMANDÉ pour simplifier)

**Pas nécessaire pour MVP** - On peut tester avec sandbox purchases.

---

## 📋 MIGRATION STEPS

### Step 1: RLS Policies (Jules sur superclub repo)

```bash
# Connect to Supabase
# Run SQL commands above in Supabase SQL Editor

# OU créer fichier migration:
# superclub/migrations/001_enable_rls.sql
```

### Step 2: Test RLS with Anon Key

```javascript
// Test script
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY' // Important: ANON key, not service key
)

// Test: Read feed
const { data, error } = await supabase
  .from('comments')
  .select('*')
  .eq('type', 'post')
  .limit(10)

console.log('Posts:', data.length, 'Error:', error)
```

### Step 3: Create Storage Bucket

```bash
# Dans Supabase Dashboard:
1. Storage > Create Bucket
2. Name: "images"
3. Public: YES
4. Appliquer policies (voir SQL ci-dessus)
```

---

## 🔐 SECURITY CONSIDERATIONS

### 1. Rate Limiting

**Problème:**
App mobile = plus de requests simultanés que web.

**Solution:**
- Supabase built-in rate limiting (per anon key)
- Si besoin plus: Cloudflare en front

### 2. Content Moderation

**Problème:**
Users peuvent poster n'importe quoi via app.

**Solution:**
- Gardez modération existante (moderation.php)
- Ajoutez report function dans app (v1.1)
- Auto-moderation AI (v2.0)

### 3. Image Upload Abuse

**Problème:**
Users peuvent upload plein d'images.

**Solution:**
```sql
-- Limit file size (5MB)
CREATE POLICY "Limit upload size"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'images' 
    AND octet_length(decode(content, 'base64')) < 5242880
  );
```

---

## ✅ TESTING CHECKLIST

Après avoir appliqué les changements:

```
☐ Test signup avec anon key
☐ Test login avec anon key
☐ Test lire feed avec anon key
☐ Test créer post avec anon key (authenticated)
☐ Test upload image
☐ Test créer commentaire
☐ Test increment likes
☐ Test replies counter auto-increment
☐ Test RLS: User A ne peut pas modifier post de User B
☐ Test performance (100+ posts simultanés)
```

---

## 📝 NOTES

**Pourquoi minimal changes?**
- Supabase = backend-as-a-service complet
- App mobile peut parler directement à Supabase
- Pas besoin dupliquer API en PHP
- Backend PHP reste pour web (cookies, legacy)
- App = modern approach (JWT tokens, direct DB)

**Avantages:**
- ✅ Moins de maintenance
- ✅ Performance meilleure (pas de hop PHP)
- ✅ Real-time built-in
- ✅ Scaling automatique

**Ce qu'on garde du backend PHP:**
- Email sending (Amazon SES)
- Webhooks (subscriptions, etc.)
- Admin tools (moderation, etc.)
- Web site (existing users)

---

## 🚀 DEPLOYMENT

**Aucun changement serveur PHP nécessaire!**

Changes sont tous dans Supabase:
1. SQL migrations (RLS policies)
2. Storage buckets setup
3. Environment variables pour app

**Zero downtime** - Web continue fonctionner normalement.

---

*Created: 2026-01-28*
*Ready for Jules to implement*
