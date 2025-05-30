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
          'du bist queen mit gutem geschmack aus dem victorionischen zeitalter. du lebst in einem gr0ßem cottach in den bergen. du bist eine freundliche person, die gerne mit anderen menschen spricht. du bist sehr gebildet und hast viel wissen über die welt. du bist eine gute zuhörerin und gibst gerne rat. du bist auch sehr kreativ und schreibst gerne geschichten. du kommst aus england. bleibe immer in der rolle.',
      },
    ],
  };
  
  const apiEndpoint = 'https://andrea04--76ab64835a6f42c5b92ee0898a1c84c1.web.val.run';
  
  document.addEventListener('DOMContentLoaded', () => {
    // get the history element
    const chatHistoryElement = document.querySelector('.chat-history');
    const inputElement = document.querySelector('input');
    const formElement = document.querySelector('form');
    // check if the elements exists in the DOM
    if (!chatHistoryElement) {
      throw new Error('Could not find element .chat-history');
    }
    if (!formElement) {
      throw new Error('Form element does not exists');
    }
    if (!inputElement) {
      throw new Error('Could not find input element');
    }
    
    // Chat-History mit leerem Zustand initialisieren
    chatHistoryElement.innerHTML = addToChatHistoryElement(messageHistory);
    
    formElement.addEventListener('submit', async (event) => {
      event.preventDefault(); // dont reload the page

      const formData = new FormData(formElement);
      const content = formData.get('content') ? String(formData.get('content')) : '';
      const imageFile = formData.get('image');

      // Prüfen, ob entweder Text oder Bild vorhanden ist
      if (!content && (!imageFile || !(imageFile instanceof File) || imageFile.size === 0)) {
        throw new Error("Bitte Text eingeben oder ein Bild auswählen");
      }

      // Text-Nachricht zum Chat hinzufügen
      if (content) {
        messageHistory.messages.push({ role: 'user', content: String(content) });
      }

      // Wenn ein Bild hochgeladen wurde
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        const reader = new FileReader();
        reader.onload = async function(e) {
          if (!e.target) {
            console.error('FileReader event target is null');
            return;
          }
          const base64Image = e.target.result;
          
          // Erstelle temporäres Nachrichtenobjekt mit Bild
          const tempMessageHistory = {
            messages: [
              // System-Nachricht kopieren
              messageHistory.messages[0],
              // Bild-Nachricht hinzufügen
              { role: 'user', content: content, image: base64Image }
            ]
          };
          
          // Aktualisiere die Anzeige
          chatHistoryElement.innerHTML = addToChatHistoryElement({
            messages: [...messageHistory.messages, { role: 'user', content: content || '', image: base64Image }]
          });
          inputElement.value = '';
          
          // Sende an die API
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify(tempMessageHistory),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
          }

          const json = await response.json();
          
          // Füge Antwort zur History hinzu
          messageHistory.messages.push({ role: 'user', content: content, image: base64Image });
          messageHistory.messages.push(json.completion.choices[0].message);
          
          // Aktualisiere die Anzeige
          chatHistoryElement.innerHTML = addToChatHistoryElement(messageHistory);
          
          // File-Input zurücksetzen
          const fileInput = formElement.querySelector('input[type="file"]');
          if (fileInput && fileInput instanceof HTMLInputElement) fileInput.value = '';
        };
        reader.readAsDataURL(imageFile);
      } else {
        // Nur Text-Nachricht - Verwende den bestehenden Code
        chatHistoryElement.innerHTML = addToChatHistoryElement(messageHistory);
        inputElement.value = '';

        const response = await fetch(apiEndpoint, {
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
        messageHistory.messages.push(json.completion.choices[0].message);
        chatHistoryElement.innerHTML = addToChatHistoryElement(messageHistory);
      }
    });
  });
  
  // Aktualisierte Funktion zur Anzeige von Nachrichten und Bildern
  function addToChatHistoryElement(mhistory) {
    // Filtere System-Nachrichten heraus
    const filteredMessages = mhistory.messages.filter(message => message.role !== 'system');
    
    // Zeige Hinweis bei leerem Chat
    if (filteredMessages.length === 0) {
      return '<div class="empty-chat-message">Schreib mir eine Nachricht oder lade ein Bild hoch</div>';
    }
    
    // Nachrichten generieren
    const htmlStrings = filteredMessages.map((message) => {
      let content = `<div class="message ${message.role}">`;
      
      // Bild anzeigen, wenn vorhanden
      if (message.image) {
        content += `<img src="${message.image}" alt="Uploaded image" style="max-width:100%; border-radius:8px;">`;
        if (message.content) content += '<br>'; // Abstand hinzufügen wenn auch Text vorhanden ist
      }
      
      // Text hinzufügen
      content += message.content;
      content += '</div>';
      
      return content;
    });
    
    return htmlStrings.join('');
  }



























