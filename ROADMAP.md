# ClubFasting App - Roadmap to App Store

**Estimation totale:** 2-4 semaines (travail full-time)

---

## Phase 1: Core Features (Semaine 1-2)

### Feed & Posts
- [ ] Affichage du feed avec posts
- [ ] Création de posts (texte + image)
- [ ] Likes et compteurs
- [ ] Commentaires
- [ ] Infinite scroll / pagination

### Profile
- [ ] Affichage profil utilisateur
- [ ] Edit profile (nom, bio, photo)
- [ ] Upload photo de profil
- [ ] Statistiques utilisateur

### Fasting Tracker
- [ ] Timer de jeûne (start/stop)
- [ ] Historique des jeûnes
- [ ] Graphiques de progression
- [ ] Notifications de rappel

---

## Phase 2: Subscriptions & Monétisation (Semaine 2)

### In-App Purchases
- [ ] Configuration App Store Connect (iOS)
- [ ] Configuration Google Play Console (Android)
- [ ] Implémentation expo-in-app-purchases
- [ ] Écran de paywall
- [ ] Server-side receipt verification (Supabase Edge Functions)
- [ ] Bouton "Restore Purchases"
- [ ] Gestion des états FREE/PREMIUM

---

## Phase 3: Polish & Assets (Semaine 3)

### App Assets
- [ ] App Icon (1024x1024)
- [ ] Splash screen
- [ ] Screenshots App Store (5-10 par plateforme)
- [ ] App preview video (optionnel)

### Legal & Compliance
- [ ] Privacy Policy (obligatoire!)
- [ ] Terms of Service
- [ ] Support URL/email
- [ ] Data deletion flow (GDPR/CCPA)

### Build Configuration
- [ ] app.config.js finalisé (bundleId, versionCode, etc.)
- [ ] Environment variables sécurisées
- [ ] Production Supabase setup

---

## Phase 4: Testing & Submission (Semaine 3-4)

### Testing
- [ ] Tests sur iPhone physique
- [ ] Tests sur Android physique
- [ ] TestFlight beta (iOS)
- [ ] Internal testing track (Android)
- [ ] Test tous les flows d'achat

### Developer Accounts
- [ ] Apple Developer Program ($99/year) ✓
- [ ] Google Play Console ($25 one-time) ✓

### Soumission
- [ ] App Store metadata (description, keywords, etc.)
- [ ] Google Play metadata
- [ ] Submit iOS pour review
- [ ] Submit Android pour review

---

## Bonus (Highly Recommended)

- [ ] Push notifications (expo-notifications)
- [ ] Analytics (Mixpanel / Firebase)
- [ ] Crash reporting (Sentry)
- [ ] Deep linking
- [ ] Proper error handling partout
- [ ] Loading states & animations

---

## Notes

- **Apple Review:** 1-3 jours typiquement
- **Google Review:** quelques heures à 1 jour
- **Subscriptions:** Apple est très strict sur la clarté des prix et privacy policy
- **Free tier:** Obligatoire pour tester avant app review

---

*Dernière mise à jour: 2026-01-28*
