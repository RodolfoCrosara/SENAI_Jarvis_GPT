//Aqui vamos capturar a fala do usuario
let i = document.querySelector('i');
const OpenAPIKey = process.env.OPENAI_API_KEY;
const Azurekey = process.env.AZURE_API_KEY;
document.addEventListener('DOMContentLoaded', function () {
    const body = document.body;
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    darkModeToggle.addEventListener('click', function () {
        body.classList.toggle('dark-mode');
        // Você pode armazenar a preferência do usuário no localStorage aqui para lembrar a seleção do usuário.
    });
});


const CapturarFala = () => {
    let botao = document.querySelector('#microfone');
    let input = document.querySelector('input');

    //Aqui vamos criar um objeto de reconhecimento de fala
    const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.lang = window.navigator.language;
    recognition.interimResults = true;
       

    botao.addEventListener('mousedown', () =>{
        recognition.start();
    });


    botao.addEventListener('mouseup', () =>{
        recognition.stop();
        PergunteAoJarvis(input.value);
        
    });

    //Aqui vamos capturar o resultado da fala
    recognition.addEventListener('result', (e) => {
        input.value = e.results[0][0].transcript;
    });
}

const AtivarJarvis = () => {
    let input = document.querySelector('input');
    // Crie uma instância de SpeechRecognition
    const recognition = new webkitSpeechRecognition();

    // Defina configurações para a instância
    recognition.continuous = true; // Permite que ele continue escutando
    recognition.interimResults = false; // Define para true se quiser resultados parciais

    // Inicie o reconhecimento de voz
    recognition.start();

    // Adicione um evento de escuta para lidar com os resultados
    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1]; // Último resultado

        // Verifique o texto reconhecido
        const recognizedText = result[0].transcript;

        // Verifique se a palavra "Jarvis" está no texto
        if (recognizedText.toLowerCase().includes('jarvis')) {

            // Comece a salvar a pergunta quando "Jarvis" é detectado
            let array_pergunta = recognizedText.toLowerCase().split('jarvis');
            array_pergunta = array_pergunta[array_pergunta.length - 1];

            input.value = array_pergunta;
            PergunteAoJarvis(array_pergunta);

            // Pare o reconhecimento de voz para economizar recursos
            recognition.stop();
        }
    };

    // Adicione um evento para reiniciar o reconhecimento após um tempo
    recognition.onend = () => {
        setTimeout(() => {
            recognition.start();
        }, 1000); // Espere 1 segundo antes de reiniciar
    };


}

const PergunteAoJarvis = async (pergunta) => {
    const header = {
        "Content-Type" : "application/json",
        "Authorization" : `Bearer ${OpenAPIKey} `
    }

    const body = {
        model: "ft:gpt-3.5-turbo-0613:zeros-e-um::8DDHyrh4",
        messages: [
            {
                role: "system",
                content: "Jarvis é um chatbot pontual e muito simpático que ajuda as pessoas",
            },
            {
                role: "user",
                content: pergunta,
            },
        ],
        temperature: 0.7,
    };

    fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: header,
        body: JSON.stringify(body)
    }).then((res)=>{
        return res.json()
    }).then((data)=>{
        console.log(data.choices[0].message.content);
        RespostaEmFala(data.choices[0].message.content)
    })
}

function RespostaEmFala(resposta){
    const header = {
        "Ocp-Apim-Subscription-Key" : Azurekey,
        "Content-Type" : "application/ssml+xml",
        "X-Microsoft-OutputFormat" : "audio-16khz-128kbitrate-mono-mp3",
        "User-Agent" : "curl"
    };
    var raw = `<speak version='1.0' xml:lang='pt-BR'><voice xml:lang='en-US' xml:gender='Male' name='pt-BR-JulioNeural'>${resposta}</voice></speak>`;

    fetch("https://brazilsouth.tts.speech.microsoft.com/cognitiveservices/v1", {
        method: 'POST',
        headers: header,
        body: raw,
        redirect: "follow"
    }).then(response => response.arrayBuffer())
    .then(audioData => {
      // Convert the audio data to a Blob
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create an audio element and set the source to the audio URL
      const audioElement = new Audio(audioUrl);
      
      // Play the audio
      audioElement.play();
      i.classList.remove('fas');
      i.classList.remove('fa-microphone');
      i.classList.add('fas');
      i.classList.add('fa-chart-bar');

      audioElement.addEventListener("ended", () => {
        i.classList.remove('fas');
        i.classList.remove('fa-chart-bar');
        i.classList.add('fas');
        i.classList.add('fa-microphone');
    })
    })

    
    .catch(error => console.log('error', error));
}


AtivarJarvis();

//CapturarFala();