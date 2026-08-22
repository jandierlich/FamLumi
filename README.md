# FamLumi – PWA, 0 €

FERTIG FÜR GITHUB PAGES – FLACH HOCHLADEN (kein Unterordner!)

1. Alle Dateien dieses Ordners auf GitHub hochladen (Repo-Root, kein Unterordner)
2. GitHub Repo: Settings → Pages → Source: main / root → Save
3. 1 Min warten → Link: https://DEINNAME.github.io/famlumi/
4. Am Handy öffnen → Zum Home-Bildschirm hinzufügen

## Technik – bewusst ohne Abhängigkeiten gebaut
`index.html` enthält alles (Design + komplette App-Logik) als reines, natives
JavaScript – **kein React, kein Babel, kein Build-Schritt, keine externe
Bibliothek nötig** für die Kernfunktionen. Das bedeutet:
- Die App funktioniert auch komplett offline
- Sie funktioniert auch, wenn man `index.html` lokal per Doppelklick öffnet
  (nicht nur über GitHub Pages)
- Es gibt keine externe CDN-Abhängigkeit, die bei Netzwerkproblemen die
  ganze Seite leer/weiß aussehen lässt

Nur eine Sache lädt bei Bedarf zusätzlich aus dem Internet nach (kann
naturgemäß nicht offline funktionieren) - mit freundlichem Hinweis,
falls kein Internet da ist:
- **Karte** (Leaflet/OpenStreetMap, kostenlos) – wird nur geladen, wenn der
  Karte-Tab tatsächlich geöffnet wird

## Enthaltene Dateien
- `index.html` – alles in einer Datei: Design (CSS) + komplette App-Logik
- `app.js` – dieselbe App-Logik nochmal als eigene, lesbare Datei zum
  Nachschauen/Bearbeiten (wird von der laufenden App nicht separat geladen,
  ist nur eine Referenzkopie)
- `sw.js` – Service Worker für Offline-Start
- `manifest.json` – Installierbarkeit
- 5 Icons
- Rechtstexte: IMPRESSUM.md, PRIVACY.md, LICENSE, FONTS.md

**Wichtig bei künftigen Änderungen:** Wenn ich (Claude) etwas an der App-Logik
ändere, passe ich beide Stellen an – die Version in `index.html` UND die
separate `app.js` – damit sie nicht auseinanderlaufen.

## Was die App aktuell kann
- Feinschliff/Polish: spürbare Antipp-Rückmeldung auf Buttons/Karten,
  Skeleton-Ladezustände (Karte) statt hartem Aufpoppen,
  Pop-Animation beim Abhaken, sanft ein-/ausblendende Dialoge, gleitender
  Kalender-Monatswechsel; respektiert die Systemeinstellung "Bewegung
  reduzieren"
- Aufgaben (mit Haken, den JEDES Familienmitglied setzen kann, unabhängig
  davon wer die Aufgabe angelegt hat), Chat (💛-Reaktionen) – alles anlegen,
  bearbeiten, löschen, automatisch neueste zuerst; ab dem 11. Eintrag klappen
  sich ältere in einen Stapel ein
- Gemeinsamer Kalender mit echter Monatsansicht: jedes Familienmitglied kann
  Termine (Titel, Datum, Uhrzeit) eintragen, bearbeiten und löschen; Tage mit
  Terminen sind im Monatsraster mit einem Punkt markiert, antippen zeigt die
  Termine des Tages; der nächste anstehende Termin erscheint zusätzlich als
  Karte auf der Startseite
- Freundliche Hinweise statt leerer Flächen, wenn eine Liste noch leer ist –
  keine Beispiel-/Demo-Inhalte mehr, alle Listen starten leer
- Konfetti + Sound/Vibration beim Danke/Abhaken (Ton abschaltbar, Schalter
  jetzt oben im Banner)
- Freigabe-Schalter pro Mitglied "Standort teilen" (Standard: AUS)
- Online-Status pro Mitglied (grüner Punkt am Avatar) + einmalige Anmeldung
  pro Gerät ("wer bist du"), Abmelden/Wieder-anmelden über Familien-Code
- Namen & Avatare frei einstellbar (Avatar oben antippen); beim allerersten
  Start verpflichtend, bevor die App nutzbar ist
- **Hell-/Dunkelmodus** (Schalter jetzt oben im Banner, wird gemerkt;
  Dunkelmodus bewusst nicht pechschwarz)
- **Kurzes Onboarding** beim allerersten Öffnen, danach das verpflichtende
  Namen/Avatar/"wer bist du"-Setup (danach nie wieder)
- **Echtes Backup**: "Backup sichern" lädt eine Datei aufs Handy, "Backup
  laden" spielt sie auf einem anderen Gerät wieder ein
- **Cloud-Sync (optional)**: eigenes kostenloses Firebase-Projekt eintragen
  (Anleitung direkt in der App unter "Cloud-Sync"), dann gleichen sich
  Aufgaben & Co. automatisch zwischen den Familien-Handys ab
- Alle Objekte haben `createdAt` und `updatedAt` – Basis für den Sync-Abgleich

## Mehrgeräte-Sync aktivieren
Cloud-Sync ist bereits eingebaut, aber standardmäßig aus. So aktivierst du ihn:
1. In der App unten auf "☁️ Cloud-Sync" tippen
2. Der Anleitung dort folgen (kostenloses Firebase-Projekt anlegen, ca. 5 Min)
3. Die angezeigten Zugangsdaten einfügen und speichern

Das machst du auf JEDEM Gerät der Familie einmal, mit denselben Firebase-
Zugangsdaten. Danach gleichen sich Aufgaben, Kalender, Chat usw. automatisch
ab. Ohne diesen Schritt bleibt alles wie bisher rein lokal – "Backup sichern"
/ "Backup laden" funktioniert davon unabhängig immer.

## Rechtliches
Privates, nicht-kommerzielles Familienprojekt (Jan Dierlich). Details in
IMPRESSUM.md / PRIVACY.md / FONTS.md.

Alle eingebundenen Drittanbieter-Dienste und Bibliotheken wurden auf ihre
Lizenzbedingungen geprüft (siehe auch PRIVACY.md → "Drittanbieter-Dienste &
Lizenzen"):
- **OpenStreetMap-Kacheln + Leaflet** (Karte): Attribution wird von Leaflet
  automatisch sichtbar eingeblendet (Pflicht der OSM-Nutzungsrichtlinie),
  kein Offline-Bulk-Download; Leaflet selbst BSD-2-Clause.
- **Firebase Realtime Database** (optionaler Sync): kostenloser Spark-Tarif,
  ausdrücklich für Hobby-/Privatprojekte dieser Größe gedacht; läuft über
  ein von Jan selbst angelegtes Google-Projekt.
- System-Schriften statt Google Fonts, keine externen Bild-/Icon-Bibliotheken.
