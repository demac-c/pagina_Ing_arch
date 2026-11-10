# Sito Studio Mariaceleste de Mauro

Sito statico multipagina (HTML, CSS e JavaScript), senza framework e senza installazioni.

## Struttura

```
sito/
├── index.html      Home
├── progetti.html   Progetti (con filtri per categoria)
├── chi-sono.html   Chi sono
├── contatti.html   Contatti (modulo + FAQ)
├── style.css       Stile condiviso da tutte le pagine
├── script.js       Animazioni e funzioni condivise
└── README.md       Questo file
```

Tutte le pagine usano lo stesso `style.css` e lo stesso `script.js`: una modifica fatta lì vale per l'intero sito.

## Come aprirlo sul tuo computer

1. Estrai la cartella dallo zip.
2. Fai doppio clic su `index.html`: si apre nel browser.

Per vedere il sito come sarebbe online, puoi anche avviare un piccolo server locale. Dalla cartella `sito` esegui:

```
python3 -m http.server 8000
```

e apri `http://localhost:8000`.

Nota: i caratteri (Fraunces e Inter) vengono caricati da Google Fonts, quindi servono internet. Senza connessione il sito usa caratteri di sistema.

## Come pubblicarlo online

Basta caricare tutti i file della cartella, mantenendoli insieme:

- **Netlify Drop** (gratis): vai su app.netlify.com/drop e trascina la cartella `sito`.
- **GitHub Pages** (gratis): carica i file in un repository e attiva Pages nelle impostazioni.
- **Hosting tradizionale** (Aruba, Register, ecc.): carica i file via FTP nella cartella principale (`public_html` o simile).

Il file di partenza deve chiamarsi `index.html`. Per usare un dominio tuo, collegalo dal pannello del servizio scelto.

## Come personalizzarlo

### Colori
In `style.css`, all'inizio, trovi le variabili:

```css
:root{
  --bg:#f4efe7;        /* sfondo */
  --ink:#1f2a24;       /* testo */
  --green:#2f4a3c;     /* verde principale */
  --green-deep:#18271f;/* verde scuro (footer, sezioni scure) */
  --accent:#b8643c;    /* terracotta, colore di risalto */
}
```
Cambiando questi valori cambia l'intero sito.

### Testi
Apri la pagina `.html` e modifica il testo tra i tag. Per i testi che compaiono in più pagine (footer, indirizzo, telefono) modifica ogni pagina.

### Foto dei progetti
Le anteprime in `progetti.html` e `index.html` sono disegni segnaposto (tag `<svg>` dentro ogni `.card`). Per usare le tue foto:

1. Crea una cartella `img` e inserisci le foto (consigliato formato verticale 4:5, file leggeri in `.jpg` o `.webp`).
2. Sostituisci il tag `<svg>...</svg>` di una card con:
   ```html
   <img src="img/progetto-01.jpg" alt="Descrizione del progetto" loading="lazy">
   ```
3. Aggiungi una volta sola in `style.css`:
   ```css
   .card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--ease)}
   .card:hover img{transform:scale(1.08)}
   ```
4. Cambia titolo e categoria (`<h4>` e `<small>`).

### Aggiungere o togliere un progetto
In `progetti.html` copia un blocco `<div class="cell reveal" data-cat="...">...</div>`. Il valore di `data-cat` deve essere uno di: `residenziale`, `interior`, `strutture`, `commerciale`. Per una nuova categoria aggiungi anche un pulsante `<button class="chip" data-filter="nome">` con lo stesso nome.

### Link social
In fondo a ogni pagina (footer) sostituisci `href="#"` di Instagram e LinkedIn con i link ai tuoi profili.

### Aggiungere una nuova pagina
1. Duplica una pagina esistente (ad esempio `contatti.html`) e rinominala.
2. Aggiorna titolo, descrizione e contenuto.
3. Aggiungi la voce nel menu (`<nav>`) e nel footer di **tutte** le pagine, spostando `aria-current="page"` sulla voce giusta.

## Modulo di contatto

Ora il modulo apre il programma di posta del visitatore con il messaggio già compilato, indirizzato a `demauromariaceleste@gmail.com`. Funziona subito, ma l'invio dipende dal programma di posta del visitatore.

Per ricevere i messaggi direttamente nella tua casella, senza programmi di posta, puoi usare un servizio come Formspree o Netlify Forms:

1. Crea un modulo sul servizio scelto e copia l'indirizzo che ti fornisce.
2. In `contatti.html` aggiungi al tag `<form>` l'azione, ad esempio `action="https://formspree.io/f/IL-TUO-CODICE" method="POST"`.
3. Aggiungi l'attributo `name` a ogni campo (`name="nome"`, `name="email"`, ecc.).
4. In `script.js` rimuovi o disattiva il blocco "Modulo contatti".

## Animazioni

- **Caricamento iniziale:** compare solo alla prima visita della sessione. Per rivederlo, chiudi la scheda e riaprila.
- **Passaggio tra pagine:** tendina scura gestita in `script.js` (sezione "Transizione tra pagine").
- **Accessibilità:** se il dispositivo ha le animazioni ridotte nelle impostazioni, il sito le disattiva automaticamente.
- Per rallentare, velocizzare o togliere un effetto, cerca il nome dell'effetto nei commenti di `style.css` e `script.js`.

## Consigli prima di pubblicare

- Sostituisci le anteprime dei progetti con foto reali.
- Aggiungi formazione e percorso professionale nella pagina Chi sono.
- Controlla titoli e descrizioni nel `<head>` di ogni pagina: sono ciò che compare su Google.
- Prova il sito da telefono: è pensato per adattarsi a tutti gli schermi.
