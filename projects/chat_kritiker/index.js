//@ts-check
// [x]. get the content from the input element
// [x]. send the content to the val town endpoint using fetch POST request
// [x]. await the response
// [x]. get the json from the response
// [x]. Add the user message to the .chat-history

// How to control the behaviour of the chat bot?

// Bonus:
// What happens if the context gets to long?
// What happens if the chat-history window get s to full (scolling)

const messageHistory = {
    // messages: [{role: user | assistant | system; content: string}]
    messages: [
      {
        role: 'system',
        content:
          'du bist ein strenger Kunstkritiker. Du hast an jedem bild was du siehst etwasnzu meckern, tust dies aber auch mit Humor.  bleibe immer in der rolle.',
      },
    ],
  };
  
  const apiEndpoint = "https://andrea04--b7162ba1304144bd8520e200c1bee450.web.val.run";

  
  document.addEventListener('DOMContentLoaded', () => {
    // get the history element
    const chatHistoryElement = document.querySelector('.chat-history');
    const formElement = document.querySelector('form');
    const textInputElement = document.querySelector('input');
    const fileInputElement = document.querySelector('input[name="image"]');
    
    // check if the elements exists in the DOM
    if (!chatHistoryElement) throw new Error('Could not find element .chat-history');
    if (!formElement) throw new Error('Form element does not exists');
    if (!textInputElement)throw new Error('Could not find input element');
      if (!fileInputElement) throw new Error('Could not find file input element');

    // run a function when the user hits send
    formElement.addEventListener('submit', async (event) => {
      event.preventDefault(); // dont reload the page
  
      const formData = new FormData(formElement);
      const textContent = formData.get('content');
      const imageFile = formData.get('image');
   
       // Prüfe, ob mindestens Text oder Bild vorhanden ist
    if ((!textContent || textContent.toString().trim() === '') && 
        (!imageFile || !(imageFile instanceof File) || imageFile.size === 0)) {
      alert('Bitte gib eine Nachricht ein oder wähle ein Bild aus.');
      return;
    }

    // Lade-Animation starten
    const dots = ['', '.', '..', '...'];
    let index = 0;
    const interval = setInterval(() => {
      const resultContainer = document.getElementById('result');
      if (resultContainer) {
        resultContainer.innerHTML = `<p>Lade${dots[index]}</p>`;
      }
      index = (index + 1) % dots.length;
    }, 300);

    try {
      // Benutzernachricht zum Chat hinzufügen
      if (textContent) {
        const userMessage = textContent.toString();
        messageHistory.messages.push({ role: 'user', content: userMessage });
        
        // Benutzernachricht im Chat anzeigen
        addMessageToChat('user', userMessage);
        
        // Eingabefeld leeren
        textInputElement.value = '';
      }

      // Falls ein Bild vorhanden ist
      let dataURL = null;
      if (imageFile instanceof File && imageFile.size > 0) {
        // Prüfe Dateityp
        if (!imageFile.type.startsWith('image/')) {
          throw new Error('Nur Bilddateien sind erlaubt.');
        }
        
        // SVG-Bilder ausschließen
        if (imageFile.type === 'image/svg+xml') {
          throw new Error('SVG-Bilder werden nicht unterstützt.');
        }
        
        // Konvertiere Datei zu Data URL
        dataURL = await fileToDataURL(imageFile);
        
        // Prüfe Bildgröße
        await checkImageSize(dataURL);
        
        // Zeige das Bild im Chat an
        addImageToChat('user', dataURL);
        
        // Zeige das Bild im Container an
        const imageContainer = document.getElementById('image-container');
        if (imageContainer) {
          imageContainer.innerHTML = `<img src="${dataURL}" alt="Hochgeladenes Bild" />`;
        }
      }

      let response;
      
      // API-Anfrage basierend auf Input-Typ erstellen
      if (dataURL) {
        // Anfrage mit Bild
        const data = {
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `Du bist ein hochrangiger, aber sehr eingebildeter Kunstkritiker, der strenge Bewertungen abgibt.
              ${textContent ? 'Berücksichtige auch den Kommentar des Benutzers: ' + textContent : ''}
              Antworte NUR im JSON-Format mit Werten gemäß: {rating: number, response: string}
              Die Bewertung (rating) sollte zwischen 1 und 10 liegen.
              Sei humorvoll, aber streng in deiner Kritik.
               WICHTIG: Antworte IMMER auf DEUTSCH, unabhängig von der Sprache des Bildes oder der Anfrage.
              Deine Antwort (response) MUSS auf Deutsch sein.`
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
          max_tokens: 300,
        };

        // Sende Anfrage an Bild-API
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log("API-Antwort:", result);
        
        try {
          const parsedResult = JSON.parse(
            result.completion.choices[0].message.content,
          );
          
          // Assistenten-Antwort zum Chat hinzufügen
          addMessageToChat('assistant', parsedResult.response || parsedResult.reason);
          
          // Ergebnis anzeigen
          const resultContainer = document.getElementById('result');
          if (resultContainer) {
            resultContainer.innerHTML = `<p>Bewertung: ${parsedResult.rating}/10</p><p>${parsedResult.response || parsedResult.reason}</p>`;
          }
          
          // Antwort zum Nachrichtenverlauf hinzufügen
          messageHistory.messages.push({ 
            role: 'assistant', 
            content: `Bewertung: ${parsedResult.rating}/10\n${parsedResult.response || parsedResult.reason}` 
          });
        } catch (parseError) {
          console.error("JSON-Parsing-Fehler:", parseError);
          throw new Error("Fehler beim Verarbeiten der API-Antwort");
        }
        
      } else {
        // Nur Text - verwende den ursprünglichen Textendpunkt
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(messageHistory),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }
        
        const json = await response.json();
        console.log(json);
        
        // Assistenten-Antwort zum Nachrichtenverlauf und Chat hinzufügen
        messageHistory.messages.push(json.completion.choices[0].message);
        addMessageToChat('assistant', json.completion.choices[0].message.content);
      }

    } catch (error) {
      console.error("Fehler:", error);
      
      // Fehlermeldung im Chat anzeigen
      addMessageToChat('assistant', `Fehler: ${error.message}`);
      
      const resultContainer = document.getElementById('result');
      if (resultContainer) {
        resultContainer.innerHTML = `<p>Fehler: ${error.message}</p>`;
      }
    } finally {
      // Lade-Animation beenden
      clearInterval(interval);
    }
  });

  /**
   * Fügt eine Textnachricht zum Chat hinzu
   * @param {string} role - 'user' oder 'assistant'
   * @param {string} content - Der Nachrichtentext
   */
  function addMessageToChat(role, content) {
    if (!chatHistoryElement) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = `<p>${content}</p>`;
    
    chatHistoryElement.appendChild(messageDiv);
    chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
  }

  /**
   * Fügt ein Bild zum Chat hinzu
   * @param {string} role - 'user' oder 'assistant'
   * @param {string} dataURL - Die Bild-Data-URL
   */
  function addImageToChat(role, dataURL) {
    if (!chatHistoryElement) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = `<div class="message-image"><img src="${dataURL}" alt="Bild" /></div>`;
    
    chatHistoryElement.appendChild(messageDiv);
    chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
  }
});

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
      if (img.width > 2000 || img.height > 2000) {
        reject(new Error('Das Bild darf maximal 2000x2000px groß sein.'));
      }
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