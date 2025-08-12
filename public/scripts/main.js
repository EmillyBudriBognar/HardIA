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
let scores = {
    cpu: 0,
    gpu: 0,
    ram: 0,
    storage: 0
};

const welcomeScreen = document.getElementById('welcome-screen');
const questionScreen = document.getElementById('question-screen');
const questionContainer = document.getElementById('question-container');
const resultsScreen = document.getElementById('results-screen');
const progressFill = document.getElementById('progress-fill');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const startBtn = document.getElementById('start-test');
const restartBtn = document.getElementById('restart-test');

startBtn.addEventListener('click', () => {
    welcomeScreen.classList.add('hidden');
    questionScreen.classList.remove('hidden');
    showQuestion(currentQuestionIndex);
});

nextBtn.addEventListener('click', () => {
    if (!validateAnswer()) return;
    
    saveAnswer();
    
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
        updateProgress();
    } else {
        questionScreen.classList.add('hidden');
        resultsScreen.classList.remove('hidden');
        generateApiText();
    }
});

prevBtn.addEventListener('click', () => {
    currentQuestionIndex--;
    showQuestion(currentQuestionIndex);
    updateProgress();
});

restartBtn.addEventListener('click', () => {
    currentQuestionIndex = 0;
    answers = {};
    resultsScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    progressFill.style.width = '0%';
});

function showQuestion(index) {
    const question = questions[index];
    
    prevBtn.classList.toggle('hidden', index === 0);
    nextBtn.innerHTML = index === questions.length - 1 ? 'Ver Resultados <i class="fas fa-arrow-right ml-2"></i>' : 'Próxima Pergunta <i class="fas fa-arrow-right ml-2"></i>';
    
    let html = `
        <div class="mb-2">
            <h3 class="text-xl font-medium text-gray-800 mb-4">${question.question}</h3>
    `;
    
    if (question.type === 'radio') {
        question.options.forEach(option => {
            const isChecked = answers[question.id] === option.value ? 'checked' : '';
            html += `
                <div class="flex items-center mb-3">
                    <input type="radio" id="${question.id}-${option.value}" name="${question.id}" value="${option.value}" ${isChecked}
                        class="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300">
                    <label for="${question.id}-${option.value}" class="ml-2 text-gray-700">${option.label}</label>
                </div>
            `;
        });
    } else if (question.type === 'text') {
        const textValue = answers[question.id] || '';
        html += `
            <input type="text" id="${question.id}" name="${question.id}" value="${textValue}"
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

function validateAnswer() {
    const question = questions[currentQuestionIndex];
    if (question.type === 'radio') {
        const selectedOption = document.querySelector(`input[name="${question.id}"]:checked`);
        if (!selectedOption) {
            alert('Por favor, selecione uma opção para continuar.');
            return false;
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
        answers[question.id] = selectedOption.value;
    } else if (question.type === 'text') {
        const textInput = document.getElementById(question.id);
        answers[question.id] = textInput.value.trim();
    }
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
}


function generateApiText() {
    const getLabel = (id, value) => {
        const question = questions.find(q => q.id === id);
        if (!question) return value;
        const option = question.options.find(o => o.value === value);
        return option ? option.label : value;
    };

    const textContent = 
`--- Respostas do Diagnóstico de Hardware ---
Sistema Operacional: ${getLabel('os', answers['os'])}
Placa de Vídeo (GPU): ${getLabel('gpu', answers['gpu'])}
Memória RAM: ${getLabel('ram', answers['ram'])}
Processador (CPU): ${getLabel('cpu', answers['cpu'])}
Armazenamento disponível: ${getLabel('storage', answers['storage'])}
Software desejado: ${answers['software']}
---------------------------------------------`;
    
    console.log('--- Dados para a API ---');
    console.log(textContent);
    console.log('-------------------------');
    sendMessage(textContent);
}

async function sendMessage(userMessage) {
    if (!userMessage) return;

    const responseDiv = document.getElementById('responseDiv'); // Acesso ao div de resposta

    try {
        const modelResponse = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: userMessage,
            }),
        });

        const data = await modelResponse.json();
        if (data && data.response) {
            responseDiv.textContent = `\n ${data.response}`;
        } else {
            responseDiv.textContent = "\nAssistente: Erro na resposta.";
        }
    } catch (err) {
        console.error(err);
        responseDiv.textContent = "\nAssistente: Erro ao processar sua mensagem.";
    }
}
  
