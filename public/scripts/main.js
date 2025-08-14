const responseDiv = document.getElementById('responseDiv');
const loadingOverlay = document.getElementById('loading-overlay');
const resultsIcon = document.getElementById('results-icon');
const apiKey =
  "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";

const url = "https://api.openai.com/v1/chat/completions";

const prompt =
  "Receba as configurações do PC de um usuário, como processador, memória RAM, placa de vídeo e outros componentes, e compare essas informações com os requisitos mínimos e recomendados de um software ou jogo específico. Após comparar as especificações do sistema, forneça uma análise clara e objetiva sobre a capacidade do computador em rodar o software/jogo solicitado. Comece com um feedback direto, dizendo se o sistema é ou não capaz de rodar o software/jogo, seguido de uma breve explicação sobre o que atende ou não aos requisitos, com sugestões de melhorias, se necessário. Use uma linguagem simples e direta, sem exageros. Exemplo de saída: Seu PC está apto! 😀 Seu processador, memória RAM e placa de vídeo são mais que suficientes para rodar o jogo com bom desempenho. No entanto, se você deseja uma experiência ainda mais fluida, um monitor com alta taxa de atualização pode ser uma boa adição. Ou Seu PC não está apto 😞 Seu processador e placa de vídeo não atendem aos requisitos mínimos, o que pode resultar em desempenho abaixo do esperado. Recomendo uma atualização para uma placa de vídeo mais recente, como a NVIDIA GTX 1660 ou superior. Limita sua resposta em 300 caracteres. Aqui estão os dados:";


const questions = [
    {
        id: 'os',
        question: 'Qual é o sistema operacional do seu computador?',
        type: 'radio',
        options: [
            { value: 'windows10', label: 'Windows 10' },
            { value: 'windows7', label: 'Windows 7' },
            { value: 'macos', label: 'macOS' },
            { value: 'linux', label: 'Linux' },
            { value: 'other', label: 'Outro (Especificar)' }
        ]
    },
    {
        id: 'gpu',
        question: 'Qual é a sua placa de vídeo?',
        type: 'radio',
        options: [
            { value: 'gtx1060_up', label: 'NVIDIA GeForce GTX 1060 ou superior' },
            { value: 'gtx1050', label: 'NVIDIA GeForce GTX 1050/1050 Ti' },
            { value: 'radeon580', label: 'AMD Radeon RX 580' },
            { value: 'intel_hd', label: 'Intel HD Graphics (Integrada)' },
            { value: 'other', label: 'Outra (Especificar)' }
        ]
    },
    {
        id: 'ram',
        question: 'Quantos GB de RAM seu computador possui?',
        type: 'radio',
        options: [
            { value: '4gb', label: '4 GB' },
            { value: '8gb', label: '8 GB' },
            { value: '16gb', label: '16 GB' },
            { value: '32gb', label: '32 GB' },
            { value: 'other', label: 'Outro (Especificar)' }
        ]
    },
    {
        id: 'cpu',
        question: 'Qual processador (CPU) seu computador possui?',
        type: 'radio',
        options: [
            { value: 'intel_i5', label: 'Intel i5 ou equivalente' },
            { value: 'intel_i7', label: 'Intel i7 ou equivalente' },
            { value: 'amd_ryzen5', label: 'AMD Ryzen 5 ou equivalente' },
            { value: 'intel_i3', label: 'Intel i3 ou equivalente' },
            { value: 'other', label: 'Outro (Especificar)' }
        ]
    },
    {
        id: 'storage',
        question: 'Quantos GB de espaço livre você tem em seu disco rígido?',
        type: 'radio',
        options: [
            { value: 'less_50gb', label: 'Menos de 50 GB' },
            { value: '50gb', label: '50 GB' },
            { value: '100gb', label: '100 GB' },
            { value: '250gb', label: '250 GB' },
            { value: 'other', label: 'Outro (Especificar)' }
        ]
    },
    {
        id: 'software',
        question: 'Qual é o software que deseja utilizar?',
        type: 'text'
    }
];

let currentQuestionIndex = 0;
let answers = {};
let otherSpecifications = {};

// Elementos DOM
const welcomeScreen = document.getElementById('welcome-screen');
const questionScreen = document.getElementById('question-screen');
const questionContainer = document.getElementById('question-container');
const resultsScreen = document.getElementById('results-screen');
const progressFill = document.getElementById('progress-fill');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const startBtn = document.getElementById('start-test');
const restartBtn = document.getElementById('restart-test');

// Event Listeners
startBtn.addEventListener('click', startTest);
nextBtn.addEventListener('click', goToNextQuestion);
prevBtn.addEventListener('click', goToPreviousQuestion);
restartBtn.addEventListener('click', restartTest);

function startTest() {
    welcomeScreen.classList.add('hidden');
    questionScreen.classList.remove('hidden');
    showQuestion(currentQuestionIndex);
}

function goToNextQuestion() {
    if (!validateAnswer()) return;
    
    saveAnswer();
    
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
        updateProgress();
    } else {
        finishTest();
    }
}

function goToPreviousQuestion() {
    currentQuestionIndex--;
    showQuestion(currentQuestionIndex);
    updateProgress();
}

function restartTest() {
    currentQuestionIndex = 0;
    answers = {};
    otherSpecifications = {};
    resultsScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    progressFill.style.width = '0%';
    resultsIcon.classList.add('hidden');
}

function showQuestion(index) {
    const question = questions[index];
    
    prevBtn.classList.toggle('hidden', index === 0);
    nextBtn.innerHTML = index === questions.length - 1 
        ? 'Ver Resultados <i class="fas fa-arrow-right ml-2"></i>' 
        : 'Próxima Pergunta <i class="fas fa-arrow-right ml-2"></i>';
    
    let html = `
        <div class="mb-2">
            <h3 class="text-xl font-medium text-gray-800 mb-4">${question.question}</h3>
    `;
    
    if (question.type === 'radio') {
        question.options.forEach(option => {
            const isChecked = answers[question.id] === option.value ? 'checked' : '';
            html += `
                <div class="flex items-start mb-3">
                    <input type="radio" id="${question.id}-${option.value}" 
                           name="${question.id}" 
                           value="${option.value}" 
                           ${isChecked}
                           class="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 mt-1"
                           onchange="handleRadioChange('${question.id}', '${option.value}')">
                    <label for="${question.id}-${option.value}" class="ml-2 text-gray-700">${option.label}</label>
                </div>
            `;
            
            if (option.value === 'other' && (isChecked || question.id in otherSpecifications)) {
                const specValue = otherSpecifications[question.id] || '';
                html += `
                    <div id="${question.id}-other-spec" class="ml-6 mb-3 mt-1">
                        <input type="text" 
                               id="${question.id}-other-text" 
                               placeholder="Por favor, especifique"
                               value="${specValue}"
                               class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    </div>
                `;
            }
        });
    } else if (question.type === 'text') {
        const textValue = answers[question.id] || '';
        html += `
            <input type="text" 
                   id="${question.id}" 
                   name="${question.id}" 
                   value="${textValue}"
                   class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
        `;
    }
    
    html += `</div>`;
    questionContainer.innerHTML = html;
    
    questionContainer.classList.add('question-enter');
    setTimeout(() => {
        questionContainer.classList.remove('question-enter');
    }, 300);
}

window.handleRadioChange = function(questionId, value) {
    const specDiv = document.getElementById(`${questionId}-other-spec`);
    const container = document.querySelector(`input[name="${questionId}"][value="other"]`).parentNode;

    if (value === 'other') {
        if (!specDiv) {
            const html = `
                <div id="${questionId}-other-spec" class="ml-6 mb-3 mt-1">
                    <input type="text" 
                           id="${questionId}-other-text" 
                           placeholder="Por favor, especifique"
                           class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                </div>
            `;
            container.insertAdjacentHTML('afterend', html);
        }
    } else {
        if (specDiv) {
            specDiv.remove();
        }
    }
};

function validateAnswer() {
    const question = questions[currentQuestionIndex];
    
    if (question.type === 'radio') {
        const selectedOption = document.querySelector(`input[name="${question.id}"]:checked`);
        if (!selectedOption) {
            alert('Por favor, selecione uma opção para continuar.');
            return false;
        }
        
        if (selectedOption.value === 'other') {
            const specInput = document.getElementById(`${question.id}-other-text`);
            if (!specInput || !specInput.value.trim()) {
                alert('Por favor, especifique a opção "Outro".');
                return false;
            }
        }
    } else if (question.type === 'text') {
        const textInput = document.getElementById(question.id);
        if (!textInput.value.trim()) {
            alert('Por favor, insira o nome do software para continuar.');
            return false;
        }
    }
    
    return true;
}

function saveAnswer() {
    const question = questions[currentQuestionIndex];
    
    if (question.type === 'radio') {
        const selectedOption = document.querySelector(`input[name="${question.id}"]:checked`);
        if (selectedOption) {
            answers[question.id] = selectedOption.value;
            
            if (selectedOption.value === 'other') {
                const specInput = document.getElementById(`${question.id}-other-text`);
                if (specInput) {
                    otherSpecifications[question.id] = specInput.value.trim();
                }
            }
        }
    } else if (question.type === 'text') {
        const textInput = document.getElementById(question.id);
        answers[question.id] = textInput.value.trim();
    }
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
}

function finishTest() {
    generateApiText();
}





//formata a mensagem para a ia
function generateApiText() {

    const textContent = 
`Respostas do Diagnóstico de Hardware ---
Sistema Operacional: ${ answers['os']}
Placa de Vídeo (GPU): ${ answers['gpu']}
Memória RAM: ${answers['ram']}
Processador (CPU): ${ answers['cpu']}
Armazenamento disponível: ${answers['storage']}
Software desejado: ${answers['software']}`;
    
    console.log(textContent);
    getOpenAIResponse(prompt + textContent);
}






//Envia e recebe resposta da ia
async function getOpenAIResponse(promptText) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
         Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: promptText, // O prompt enviado para o modelo
          },
        ],
        max_tokens: 150,
      }),
    });

    const data = await response.json();
        questionScreen.classList.add('hidden');
        resultsScreen.classList.remove('hidden');
          if (data.choices && data.choices.length > 0) {
              console.log("Resposta da IA:", data.choices[0].message.content);
              document.getElementById("responseDiv").innerText = data.choices[0].message.content;
         } else {
              console.error("Nenhuma resposta encontrada.");
        }
  } catch (error) {
    console.error("Erro ao obter resposta:", error);
  }
}






// function formatResponse(responseText) {
//     let formattedResponse = responseText;

//     // Título de Compatibilidade
//     const titleRegex = /^(✅|❌) (.*)/;
//     if (formattedResponse.match(titleRegex)) {
//         const [fullMatch, icon, title] = formattedResponse.match(titleRegex);
//         if (icon === '❌') {
//             resultsIcon.className = 'fas fa-times-circle text-red-500 text-5xl mb-4';
//         } else {
//             resultsIcon.className = 'fas fa-check-circle text-green-500 text-5xl mb-4';
//         }
//         resultsIcon.classList.remove('hidden');
//         formattedResponse = formattedResponse.replace(fullMatch, `<h3 class="text-2xl font-bold text-gray-800 mb-3">${icon} ${title}</h3>`);
//     }

//     // Tabela
//     const tableRegex = /\|(.*)\n\|---(.*)\n([\s\S]*?)(?=\n\n|$)/;
//     const tableMatch = formattedResponse.match(tableRegex);

//     if (tableMatch) {
//         const [fullTable, headerLine, separatorLine, bodyContent] = tableMatch;
//         const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
//         const rows = bodyContent.split('\n').filter(r => r.trim() !== '');

//         let tableHtml = '<table class="min-w-full divide-y divide-gray-200 mt-4 mb-4 shadow-sm rounded-lg overflow-hidden">';
//         tableHtml += '<thead class="bg-blue-100">';
//         tableHtml += '<tr>';
//         headers.forEach(header => {
//             tableHtml += `<th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">${header}</th>`;
//         });
//         tableHtml += '</tr>';
//         tableHtml += '</thead>';
//         tableHtml += '<tbody class="bg-white divide-y divide-gray-200">';

//         rows.forEach(row => {
//             const cells = row.split('|').map(c => c.trim()).filter(c => c);
//             if (cells.length === headers.length) {
//                 tableHtml += '<tr>';
//                 cells.forEach(cell => {
//                     tableHtml += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cell}</td>`;
//                 });
//                 tableHtml += '</tr>';
//             }
//         });
//         tableHtml += '</tbody>';
//         tableHtml += '</table>';

//         formattedResponse = formattedResponse.replace(fullTable, tableHtml);
//     }
    
//     // Outros formatos (negrito, listas, parágrafos)
//     formattedResponse = formattedResponse
//         .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-700">$1</strong>')
//         .replace(/^(###|##|#) (.*)$/m, (match, p1, p2) => {
//             const size = p1.length === 3 ? 'text-xl' : p1.length === 2 ? 'text-2xl' : 'text-3xl';
//             return `<h4 class="${size} font-bold mt-6 mb-2 text-gray-800">${p2}</h4>`;
//         })
//         .replace(/^\s*- (.*)$/gm, (match, p1) => `<li><i class="fas fa-circle text-blue-400 text-xs mr-2"></i>${p1}</li>`)
//         .replace(/(<br>|^)<li>/g, '<ul><li>')
//         .replace(/<\/li><br>/g, '</li>')
//         .replace(/<\/li><ul>/g, '</li></ul>')
//         .replace(/\n\n/g, '<p>')
//         .replace(/\n/g, '<br>')
//         .trim();

//     responseDiv.innerHTML = `<div class="prose max-w-none">${formattedResponse}</div>`;
// }

// function showError(message) {
//     loadingOverlay.classList.add('hidden');
//     resultsIcon.classList.add('hidden');
//     responseDiv.innerHTML = `
//         <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
//             <i class="fas fa-exclamation-triangle mr-2"></i>
//             ${message}
//         </div>
//     `;
// }

