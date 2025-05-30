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
      event.preventDefault(); // dont reload the page
  
      const formData = new FormData(formElement);
      const content = formData.get('content');
      if (!content) {
        throw new Error("Could not get 'content' from form");
      }
      //@ts-ignore
      messageHistory.messages.push({ role: 'user', content: content });
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
      console.log(json);
      // @ts-ignore
      messageHistory.messages.push(json.completion.choices[0].message);
      chatHistoryElement.innerHTML = addToChatHistoryElement(messageHistory);
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
  
  
  
  
  
  
  
  
  
  
  

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
