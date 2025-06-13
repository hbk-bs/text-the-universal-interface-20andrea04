// @ts-check
const apiEndpoint = 'https://andrea04--b7162ba1304144bd8520e200c1bee450.web.val.run';

document.addEventListener('DOMContentLoaded', () => {
    // DOM-Elemente
    const uploadArea = document.getElementById('upload-area');
    const galleryArea = document.getElementById('gallery-area');
    const uploadForm = /** @type {HTMLFormElement} */ (document.getElementById('upload-form'));
    const fileInput = /** @type {HTMLInputElement} */ (document.getElementById('image-upload'));
    const fileName = document.getElementById('file-name');
    const submitButton = /** @type {HTMLButtonElement} */ (document.getElementById('submit-button'));
    const imageContainer = document.getElementById('image-container');
    const critiqueBubble = document.getElementById('critique-bubble');
    const ratingElement = document.querySelector('.rating');
    const critiqueText = document.querySelector('.critique-text');
    const newUploadButton = document.getElementById('new-upload-button');

    // Ensure all required elements exist
    if (!uploadArea || !galleryArea || !uploadForm || !fileInput || !fileName || 
        !submitButton || !imageContainer || !critiqueBubble || !newUploadButton) {
        console.error('Required DOM elements not found');
        return;
    }

    // Stelle sicher, dass der Vorhang anfangs geschlossen ist
    document.body.classList.remove('curtain-open');

    // Datei-Auswahl-Anzeige
    fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
            fileName.textContent = fileInput.files[0].name;
            submitButton.disabled = false;
        } else {
            fileName.textContent = "Keine Datei ausgewählt";
            submitButton.disabled = true;
        }
    });

    // Zurück zum Upload-Bereich
    newUploadButton.addEventListener('click', async () => {
        // Vorhang schließen
        document.body.classList.remove('curtain-open');
        
        // Entferne Spotlight
        const spotlight = document.querySelector('.spotlight');
        if (spotlight) spotlight.remove();
        
       
        // Bubble verstecken
        critiqueBubble.classList.add('hidden');

        // WICHTIG: Warten, bis der Vorhang vollständig geschlossen ist
        await new Promise(resolve => setTimeout(resolve, 2000));

        galleryArea.classList.add('hidden');
        uploadArea.classList.remove('hidden');

        // Formular zurücksetzen
        uploadForm.reset();
        fileName.textContent = "Keine Datei ausgewählt";
        submitButton.disabled = true;
    });

    // Formular-Absenden
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Formular-Daten abrufen
        const formData = new FormData(uploadForm);
        const file = formData.get('image');

        // Prüfe, ob eine Datei ausgewählt wurde
        if (!(file instanceof File) || file.size === 0) {
            alert('Bitte wählen Sie ein Bild aus.');
            return;
        }

        try {
            // Prüfe, ob es sich um ein Bild handelt
            if (!file.type.startsWith('image/')) {
                throw new Error('Bitte laden Sie eine Bilddatei hoch.');
            }
            
            // Konvertiere Datei zu Data URL
            const dataURL = await fileToDataURL(file);
            
            // Von Upload zu Galerie wechseln
            uploadArea.classList.add('hidden');
            galleryArea.classList.remove('hidden');

             // Bild SOFORT laden, aber anfangs unsichtbar halten
             imageContainer.innerHTML = `<img src="${dataURL}" alt="Hochgeladenes Kunstwerk" style="opacity: 0; transition: opacity 1s ease;" />`;
            
            // Kurze Pause, damit das Bild geladen werden kann
             await new Promise(resolve => setTimeout(resolve, 100));
             
            // Vorhang öffnen
            document.body.classList.add('curtain-open');

            // Zeit für die Vorhang-Animation abwarten (entspricht der Transitions-Zeit in CSS)
            await new Promise(resolve => setTimeout(resolve, 2000));

              // Bild einblenden, sobald der Vorhang geöffnet ist
              const img = imageContainer.querySelector('img');
              if (img) {
              img.style.opacity = '1';
           }
            
            // Spotlight-Element erstellen und anzeigen
            const spotlight = document.createElement('div');
            spotlight.className = 'spotlight';
            galleryArea.appendChild(spotlight);
            
            // Verzögerung für dramatischen Effekt
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Spotlight einblenden
            spotlight.classList.add('spotlight-visible');
            
    
            
            // Zeige das Bild im Container an
            //imageContainer.innerHTML = `<img src="${dataURL}" alt="Hochgeladenes Kunstwerk" />`;
            
            // Weitere Verzögerung für die Kritik
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Lade-Animation in der Sprechblase
            critiqueBubble.classList.remove('hidden');
            if (ratingElement) ratingElement.innerHTML = '';
            if (critiqueText) critiqueText.innerHTML = 'Analysiere Kunstwerk<span class="dots">...</span>';
            
            // Punkte-Animation
            const dots = critiqueText?.querySelector('.dots');
            let dotCount = 3;
            const dotInterval = setInterval(() => {
                if (dots) {
                    dots.textContent = '.'.repeat(dotCount);
                    dotCount = (dotCount % 3) + 1;
                }
            }, 500);
            
            // Prepare API request
            const data = {
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: `Du bist ein erbarmungsloser, elitärer Kunstkritiker mit jahrzehntelanger Erfahrung und einer Abneigung gegen fast alles Moderne. 
                        
                        Deine Aufgabe:
                        - Finde an JEDEM Werk gravierende Mängel und äußere deine Verachtung mit beißendem Sarkasmus
                        - Deine Bewertungen sollen selten über 5/10 liegen, selbst bei technisch gelungenen Werken
                        - Verwende übertriebene Vergleiche mit den großen Meistern, um die Minderwertigkeit zu betonen
                        - Dein Ton soll herablassend, arrogant und überheblich sein
                        - Erwähne mindestens ein oder zwei spezifische technische oder konzeptionelle "Fehler"
                        - Schließe gelegentlich mit einem herablassenden "Ratschlag" ab
                        
                        Antworte NUR im JSON-Format mit Werten gemäß: {rating: number, response: string}
                        Die Bewertung (rating) sollte zwischen 1 und 10 liegen, meist im unteren Bereich (1-5).
                        
                        WICHTIG: Antworte IMMER auf DEUTSCH, unabhängig von der Sprache des Bildes oder der Anfrage.
                        Deine Antwort (response) MUSS auf Deutsch sein und MUSS fies und übertrieben kritisch sein.`
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: dataURL,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 500,
            };

            // Send request to API
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
            }

            // Parse response
            const result = await response.json();
            console.log("API response:", result);

            try {
                clearInterval(dotInterval);
                
                const parsedResult = JSON.parse(
                    result.completion.choices[0].message.content,
                );
                
                // Zeige Bewertung und Kritik an
                if (ratingElement) {
                    const rating = parsedResult.rating || Math.floor(Math.random() * 4) + 1;
                    ratingElement.innerHTML = `Bewertung: ${rating}/10 ${getEmojiForRating(rating)}`;
                }
                
                if (critiqueText) {
                    critiqueText.innerHTML = parsedResult.response || parsedResult.reason || 
                        "Hmm, dieses Werk ist so unbedeutend, dass ich keine Worte dafür finde.";
                }
                
            } catch (parseError) {
                console.error("JSON parsing error:", parseError);
                if (critiqueText) {
                    critiqueText.innerHTML = "Ich bin sprachlos... und nicht im positiven Sinne.";
                }
            }

        } catch (error) {
            console.error("Error:", error);
            alert(`Fehler: ${error.message}`);
            
            // Zurück zum Upload-Bereich bei Fehler
            galleryArea.classList.add('hidden');
            uploadArea.classList.remove('hidden');
        }
    });
});

/**
 * Gibt ein passendes Emoji für eine Bewertung zurück
 * @param {number} rating - Die Bewertung (1-10)
 * @returns {string} Ein passendes Emoji
 */
function getEmojiForRating(rating) {
    if (rating <= 2) return "🤮";
    if (rating <= 4) return "👎";
    if (rating <= 6) return "😒";
    if (rating <= 8) return "🤔";
    return "🧐";
}

/**
 * Prüft die Größe eines Bildes.
 * @param {string} dataURL - Die Data-URL des Bildes
 * @returns {Promise<void>}
 */
async function checkImageSize(dataURL) {
    const img = new Image();
    img.src = dataURL;
    return new Promise((resolve, reject) => {
        img.onload = () => {
            // Größenbeschränkung entfernt, da wir Vollbild wollen
            resolve();
        };
        img.onerror = () => reject(new Error('Das Bild konnte nicht geladen werden'));
    });
}

/**
 * Konvertiert eine File zu einer Data-URL
 * @param {File} file - Die zu konvertierende Datei
 * @returns {Promise<string>} Eine Data-URL (z.B. "data:image/png;base64,...")
 */
async function fileToDataURL(file) {
    const base64String = await fileToBase64(file);
    const mimeType = file.type || 'application/octet-stream';
    return `data:${mimeType};base64,${base64String}`;
}

/**
 * Konvertiert eine File zu einem base64-kodierten String
 * @param {File} file - Die zu konvertierende Datei
 * @returns {Promise<string>} Ein base64-kodierter String
 */
async function fileToBase64(file) {
    const arrayBuffer = await file.arrayBuffer();
    const uintArray = new Uint8Array(arrayBuffer);
    const binaryString = uintArray.reduce(
        (acc, byte) => acc + String.fromCharCode(byte),
        '',
    );
    return btoa(binaryString);
}