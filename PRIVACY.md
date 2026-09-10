# Datenschutzerklärung

**Kurzfassung:** FamLumi läuft komplett lokal auf deinem Gerät. Es gibt aktuell keinen Server, der eure Daten sammelt. Wo in dieser Erklärung von "keine Weitergabe an Dritte" die Rede ist, sind damit ausschließlich die in der App eingegebenen Daten (Aufgaben, Termine, Chat-Nachrichten, Fotos usw.) gemeint – die App selbst darfst du gerne an Familie oder Freunde weitergeben.

## Welche Daten werden gespeichert?
Aufgaben, Kalender-Termine, Chat-Nachrichten (inkl. Fotos und Sprachnachrichten im Chat) und der "Zuhause/unterwegs"-Status werden ausschließlich im lokalen Speicher deines Browsers (localStorage) abgelegt. Diese Daten verlassen dein Gerät nicht, außer du nutzt aktiv die Funktion "Sichern" (Backup-Datei) oder richtest den optionalen Cloud-Sync ein. Welches Familienmitglied du auf diesem Gerät bist, wird ebenfalls nur lokal gespeichert (kein Passwort, keine echte Anmeldung – nur eine Zuordnung "das bin ich"). Beim ersten Start erzeugt die App außerdem lokal einen zufälligen "Familien-Code", der bei aktivem Cloud-Sync als Zugriffsschlüssel für den gemeinsamen Speicherpfad dient (siehe Abschnitt Drittanbieter-Dienste); dieser Code wird ebenfalls nur lokal gespeichert und nur dann an Firebase übermittelt, wenn du den Sync aktiv einrichtest.


## Fotos & Sprachnachrichten im Chat
Im Chat können optional Fotos oder Sprachnachrichten verschickt werden. Für ein Foto fragt das Gerät einmalig Zugriff auf die Kamera/Fotomediathek ab, für eine Sprachnachricht einmalig Zugriff auf das Mikrofon – jeweils nur beim aktiven Antippen der entsprechenden Schaltfläche, nie im Hintergrund. Fotos werden vor dem Speichern im Browser verkleinert und komprimiert. Beide Inhalte werden wie Text-Nachrichten ausschließlich lokal gespeichert und nur bei aktivem Cloud-Sync an das eigene Firebase-Projekt der Familie übermittelt – nie an einen sonstigen Server oder Dritte.

## Standort
Es wird kein GPS und keine echte Standortposition erfasst. Der "Unterwegs"-Status ist ein von Hand gesetzter Schalter ("zu Hause" / "unterwegs"), keine automatische Ortung.

Für die Kartenansicht im Karte-Bereich gibt es einen Schalter ("Standort teilen"), der standardmäßig **ausgeschaltet** ist und jederzeit selbst umgeschaltet werden kann. Jede Person sieht und ändert dort ausschließlich ihre eigene Freigabe – nicht die der anderen Familienmitglieder. Solange diese Funktion nicht aktiv genutzt wird, wird kein Standort erfasst oder geteilt. Beim Öffnen des Karte-Bereichs fragt die App einmalig den aktuellen Standort ab (nicht dauerhaft), nur um die eigene Kartenansicht zu zentrieren; dieser Wert wird nicht gespeichert und nicht an Dritte übermittelt.

## Benachrichtigungen
Im Hinweise-Bereich lässt sich optional ein Schalter für Benachrichtigungen aktivieren (standardmäßig **ausgeschaltet**). Bei Aktivierung fragt das Gerät einmalig die übliche Benachrichtigungs-Berechtigung ab. Neue Aufgaben, Termine und Chat-Nachrichten anderer Familienmitglieder werden dann direkt auf dem Gerät angezeigt, solange die App geöffnet oder im Hintergrund aktiv ist. Es findet dabei keine Verbindung zu einem externen Push-Dienst statt – die Benachrichtigung wird ausschließlich lokal auf dem Gerät erzeugt, es werden keine Daten dafür an Dritte übermittelt.

## Rechtsgrundlage
Die Verarbeitung erfolgt auf Grundlage deiner Einwilligung bzw. im berechtigten Interesse der Nutzung als privates Familienwerkzeug, Art. 6 Abs. 1 lit. a, f DSGVO.

## Schriftarten
FamLumi lädt keine Schriften von externen Servern nach. Es werden ausschließlich Schriften genutzt, die bereits auf dem jeweiligen Gerät (iOS) vorinstalliert sind. Dadurch entsteht keine Verbindung zu Google- oder anderen Dritt-Servern beim Laden der App, und es wird auch keine IP-Adresse zu diesem Zweck übertragen.

## Hosting
Die App wird statisch über GitHub Pages ausgeliefert. Es gelten die Datenschutzhinweise von GitHub für den reinen Seitenaufruf (Server-Logs).

## Kalender-Export (.ics)
Der optionale ".ics exportieren"-Button im Kalender-Bereich erzeugt die Datei komplett lokal im Browser und bietet sie direkt zum Download an. Dabei wird keine Verbindung zu einem Server aufgebaut und nichts an Dritte übermittelt.

## Drittanbieter-Dienste & Lizenzen
Diese Dienste werden nur bei aktiver Nutzung der jeweiligen Funktion angefragt, nie im Hintergrund:

- **OpenStreetMap / Leaflet** (Karte-Bereich): Beim Öffnen des Karte-Bereichs wird die Kartenbibliothek Leaflet (JS/CSS) vom CDN **unpkg.com** nachgeladen, danach die Kartenkacheln von **tile.openstreetmap.org**. Quellenangabe "© OpenStreetMap-Mitwirkende" wird automatisch sichtbar eingeblendet (Pflicht der OSM-Nutzungsrichtlinie). Es werden nur die gerade sichtbaren Kartenausschnitte geladen, kein Offline-Download im Voraus. Die Kartenbibliothek Leaflet selbst steht unter der sehr freizügigen BSD-2-Clause-Lizenz.
- **Firebase Realtime Database** (optionaler Geräte-Sync, Google): Nur aktiv, wenn eigene, selbst angelegte Firebase-Zugangsdaten in der App hinterlegt werden. Beim Einrichten/Nutzen des Sync wird das Firebase-SDK von **www.gstatic.com** nachgeladen, danach läuft der Datenabgleich über die Firebase Realtime Database deines eigenen Projekts. Der kostenlose Spark-Tarif bleibt für die Realtime Database ohne Zahlungsmethode nutzbar (Stand 2026: großzügige tägliche Kontingente, u.a. 1 GB Speicher, jeweils mehrere zehntausend Lese-/Schreibvorgänge pro Tag) – für eine Familie dieser Größe realistisch nie erreichbar. Wichtig: FamLumi nutzt ausschließlich die Realtime Database, nicht den separaten Dienst "Firebase Cloud Storage" (dort ist seit Februar 2026 zwingend ein Zahlungskonto hinterlegt, auch wenn nichts berechnet wird) – Fotos/Sprachnachrichten werden komprimiert direkt als Daten in der Realtime Database gespeichert, nicht in Cloud Storage. Da du dabei ein eigenes Google-Konto/Projekt nutzt, gelten dafür die Nutzungsbedingungen von Google gegenüber dir direkt, nicht gegenüber der App.
