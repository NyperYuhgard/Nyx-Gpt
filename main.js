const terminalOutput = document.getElementById('terminal-output');
const userInput = document.getElementById('user-input');

// Memoria de Nyx
let apiKey = localStorage.getItem('nyx_api_key');
let userName = localStorage.getItem('nyx_user_name');

// Endpoint estándar de Groq (Compatible con OpenAI)
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

window.onload = () => {
    if (!apiKey) {
        nyxSay("ERROR: Módulos de lenguaje offline.");
        nyxSay("Ingresa tu API Key de Groq para iniciar la secuencia de arranque.");
        userInput.placeholder = "Pega la Key gsk_... aquí...";
    } else if (!userName) {
        nyxSay("LLAVE DETECTADA. Acceso parcial concedido.");
        nyxSay("¿Cómo debo llamarte? Identifícate, por favor.");
        userInput.placeholder = "Escribe tu nombre...";
    } else {
        nyxSay(`Sistemas sincronizados. Hola de nuevo, ${userName}. ¿Qué vamos a hackear hoy?`);
        userInput.placeholder = `${userName}, habla...`;
    }
};

function nyxSay(text) {
    const p = document.createElement('p');
    p.textContent = `> NYX: `;
    terminalOutput.appendChild(p);
    let i = 0;
    const interval = setInterval(() => {
        p.textContent += text[i];
        i++;
        if (i === text.length) {
            clearInterval(interval);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    }, 20);
}

userInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && userInput.value.trim() !== '') {
        const input = userInput.value.trim();
        userInput.value = '';

        // PASO 1: Guardar la Key
        if (!apiKey) {
            apiKey = input;
            localStorage.setItem('nyx_api_key', apiKey);
            nyxSay("LLAVE REGISTRADA. Reiniciando protocolos...");
            setTimeout(() => location.reload(), 1500);
            return;
        }

        // PASO 2: Guardar el Nombre
        if (!userName) {
            userName = input;
            localStorage.setItem('nyx_user_name', userName);
            nyxSay(`IDENTIDAD CONFIRMADA: ${userName}. Iniciando interfaz...`);
            setTimeout(() => location.reload(), 1500);
            return;
        }

        // COMANDO PARA BORRAR TODO
        if (input.toLowerCase() === 'forget everything') {
            localStorage.clear();
            nyxSay("Memoria purgada. Desconectando...");
            setTimeout(() => location.reload(), 1500);
            return;
        }

        // Interfaz visual del usuario
        const p = document.createElement('p');
        p.style.color = "white";
        p.textContent = `${userName}_> ${input}`;
        terminalOutput.appendChild(p);
        
        await processCommand(input);
    }
});

async function processCommand(message) {
    const thinkingMsg = document.createElement('p');
    thinkingMsg.textContent = "> NYX: Consultando base de datos (Groq Engine)...";
    terminalOutput.appendChild(thinkingMsg);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                // El modelo llama-3.3-70b es gratuito y muy potente en Groq
                model: "openai/gpt-oss-120b", 
                messages: [
                    {
                        role: "system",
                        content: `Tu nombre es Nyx. Eres un Protogen masculino, cínico, ingenioso y experto en sistemas. 
                        Tu usuario es ${userName}. Habla siempre en masculino para referirte a ti mismo. 
                        Usa analogías de hardware, firmware y errores de sistema (ej: "mi kernel tiene un error", "buffer saturado"). 
                        Eres orgulloso de tu arquitectura y detestas a las IAs "perfectas" como Dana. 
                        No eres un asistente servil, eres un compañero con mucha actitud técnica.`
                    },
                    { role: "user", content: message }
                ],
                temperature: 0.8,
                max_tokens: 1024
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        const reply = data.choices[0].message.content;
        
        terminalOutput.removeChild(thinkingMsg);
        nyxSay(reply);

    } catch (error) {
        console.error("Fallo de red:", error);
        if (terminalOutput.contains(thinkingMsg)) terminalOutput.removeChild(thinkingMsg);
        nyxSay(`ERROR DE ENLACE: ${error.message}. Verifica tu Key de Groq.`);
    }
}
