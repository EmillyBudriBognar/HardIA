const responseDiv = document.getElementById('responseDiv');

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
let otherSpecifications = {}; // Novo objeto para armazenar especificações "Outro"

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
}

function showQuestion(index) {
    const question = questions[index];
    
    // Atualizar controles de navegação
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
            
            // Adicionar campo de texto se for opção "Outro" e estiver selecionada
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
    
    // Animação de transição
    questionContainer.classList.add('question-enter');
    setTimeout(() => {
        questionContainer.classList.remove('question-enter');
    }, 300);
}

// Função global para lidar com mudanças nos radios
window.handleRadioChange = function(questionId, value) {
    if (value === 'other') {
        // Se selecionou "Outro", garantir que o campo de texto existe
        if (!document.getElementById(`${questionId}-other-spec`)) {
            const container = document.querySelector(`input[name="${questionId}"][value="other"]`).parentNode;
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
        // Se selecionou outra opção, remover o campo de texto se existir
        const specDiv = document.getElementById(`${questionId}-other-spec`);
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
        
        // Validar campo "Outro" se selecionado
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
            
            // Salvar especificação se for opção "Outro"
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
    questionScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    generateApiText();
}

function generateApiText() {
    const getDisplayValue = (id) => {
        const answer = answers[id];
        if (answer === 'other') {
            return otherSpecifications[id] || 'Não especificado';
        }
        
        const question = questions.find(q => q.id === id);
        if (!question) return answer;
        
        const option = question.options.find(o => o.value === answer);
        return option ? option.label : answer;
    };

    const textContent = 
`--- Diagnóstico de Hardware ---
Sistema Operacional: ${getDisplayValue('os')}
Placa de Vídeo (GPU): ${getDisplayValue('gpu')}
Memória RAM: ${getDisplayValue('ram')}
Processador (CPU): ${getDisplayValue('cpu')}
Armazenamento disponível: ${getDisplayValue('storage')}
Software desejado: ${answers['software'] || 'Não especificado'}
---------------------------------`;
    
    console.log('Dados para análise:', textContent);
    sendMessage(textContent);
}

async function sendMessage(userMessage) {
    if (!userMessage) return;

    const responseDiv = document.getElementById('responseDiv');
    responseDiv.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin text-blue-500 text-2xl"></i><p class="mt-2">Analisando seu sistema...</p></div>';

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.response) {
            // Formatar a resposta para melhor visualização
            formatResponse(data.response);
        } else {
            showError("Resposta inválida do servidor.");
        }
    } catch (err) {
        console.error("Erro na requisição:", err);
        showError("Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.");
    }
}

function formatResponse(responseText) {
    const responseDiv = document.getElementById('responseDiv');
    
    // Processar a resposta para melhor formatação
    let formattedResponse = responseText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negrito
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Itálico
        .replace(/\n/g, '<br>') // Quebras de linha
        .replace(/- (.*?)(<br>|$)/g, '<li class="mb-1">$1</li>') // Listas
        .replace(/^(✅|❌) (.*?)(<br>|$)/, '<h3 class="text-xl font-bold mb-3 text-gray-800">$1 $2</h3>'); // Títulos
    
    // Adicionar classes Tailwind para melhor aparência
    formattedResponse = `
        <div class="prose max-w-none text-left">
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                ${formattedResponse}
            </div>
        </div>
    `;
    
    responseDiv.innerHTML = formattedResponse;
}

function showError(message) {
    const responseDiv = document.getElementById('responseDiv');
    responseDiv.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            ${message}
        </div>
    `;
}