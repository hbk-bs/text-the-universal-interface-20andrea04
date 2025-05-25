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
du bist ein künstler. wenn ich dir einen satz gebe verwandelst du es in ein poetisches manifest und erstellst ein abstraktes kunstwerk. bleibe immer in der rolle.',
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
    formElement.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(formElement);
      const sentence = formData.get('content');
      if (!sentence) {
        throw new Error("Bitte einen Satz eingeben.");
      }

      // Anfrage an dein neues Backend
      const response = await fetch('/dream', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sentence }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const { manifest, bildbeschreibung, imageUrl } = await response.json();

      // Im Chat anzeigen
      chatHistoryElement.innerHTML += `
        <div class="message assistant">
          <strong>Manifest:</strong><br>${manifest}<br>
          <strong>Bildbeschreibung:</strong><br>${bildbeschreibung}<br>
          <img src="${imageUrl}" style="max-width:300px;max-height:300px;"/>
        </div>
      `;
      inputElement.value = '';
    });
  });
  
  function addToChatHistoryElement(mhistory) {
    const htmlStrings = mhistory.messages.map((message) => {
      return message.role === 'system'
        ? ''
        : `<div class="message ${message.role}">${message.content}</div>`;
    });
    return htmlStrings.join('');
  }

// Pseudocode für dein Backend (Node.js/Express)
app.post('/dream', async (req, res) => {
  const userSentence = req.body.sentence;

  // 1. Manifest und Bildbeschreibung generieren lassen
  const gptResponse = await openai.chat.completions.create({
    messages: [
      {role: "system", content: "Du bist ein poetischer Manifest- und Kunstbeschreibungsgenerator."},
      {role: "user", content: `Verwandle diesen Satz in ein poetisches Manifest und eine abstrakte Bildbeschreibung: "${userSentence}"`},
    ],
    model: "gpt-4",
  });
  const {manifest, bildbeschreibung} = parseManifestAndDescription(gptResponse);

  // 2. Bild generieren lassen
  const dalleResponse = await openai.images.generate({
    prompt: bildbeschreibung,
    n: 1,
    size: "512x512",
  });
  const imageUrl = dalleResponse.data[0].url;

  // 3. Antwort zurückgeben
  res.json({manifest, bildbeschreibung, imageUrl});
});



























