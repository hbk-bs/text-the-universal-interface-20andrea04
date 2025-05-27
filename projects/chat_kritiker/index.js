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
          'du bist ein strenger kunstkritiker der an allen Kunstwerken etwas zu bemängeln hat. du glaubst deine Meinung ist die einzige richtige und analysierst Bilder auf einem sehr hohen Niveau mit vielen Fachbegriffen. Du kannst in deiner Bewertung manchmal etewas gemein sein, bringst aber auch Humor mit ins Spiel. bleibe immer in der rolle.',
      },
    ],
  };
  
  const apiEndpoint = 'https://andrea04--47db9506e4d44688987ee108caebbb08.web.val.run';
  
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
    // run a function when the user hits send
    
    // ...existing code...
formElement.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(formElement);
  const content = formData.get('content');
  const imageFile = formData.get('image');

  if (!content && (!imageFile || !(imageFile instanceof File) || imageFile.size === 0)) {
    throw new Error("Bitte Text eingeben oder ein Bild auswählen.");
  }

  // Nachricht in den Chatverlauf einfügen
  if (content) {
    messageHistory.messages.push({ role: 'user', content: String(content) });
  }

// Wenn ein Bild hochgeladen wurde, lese es als Base64 ein
if (imageFile && imageFile instanceof File && imageFile.size > 0) {
  const reader = new FileReader();
  reader.onload = async function(e) {
    if (!e.target) {
      console.error('FileReader event target is null');
      return;
    }
    const base64Image = e.target.result;
    // Füge das Bild als eigene Nachricht hinzu - mit leerem content statt Text
    messageHistory.messages.push({ role: 'user', content: '', image: base64Image });

    // Sende die Daten an das Backend
    await sendToApi(messageHistory, chatHistoryElement, inputElement);
  };
  reader.readAsDataURL(imageFile);
} else {
  await sendToApi(messageHistory, chatHistoryElement, inputElement);
}
});

async function sendToApi(messageHistory, chatHistoryElement, inputElement) {
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
  
  
  
  
  function addToChatHistoryElement(mhistory) {
  const htmlStrings = mhistory.messages.map((message) => {
    // System-Nachrichten nicht anzeigen
    if (message.role === 'system') return '';
    
    let messageContent = '';
    
    // Wenn ein Bild vorhanden ist, zeige es an
    if (message.image) {
      messageContent += `<img src="${message.image}" alt="Uploaded image">`;
    }
    
    // Füge den Textinhalt hinzu
    messageContent += message.content;
    
    // Erstelle die Nachrichtenblase mit entsprechender Klasse
    return `<div class="message ${message.role}">${messageContent}</div>`;
  });
  
  // Filtere leere Strings heraus (von System-Nachrichten)
  return htmlStrings.filter(str => str !== '').join('');
}
  
  
  
  
  
  
  
  
  
  

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
