// Tenta usar o IP configurado, mas permite fallback para localhost se estiver testando localmente
// Dica: Em produção, o ideal é que o frontend e backend estejam no mesmo domínio/IP
const BACKEND_CONFIG = {
    production_ip: '192.168.0.30',
    port: '5000'
};

const API_URL = window.location.hostname === 'localhost'
    ? `http://localhost:${BACKEND_CONFIG.port}`
    : `http://${BACKEND_CONFIG.production_ip}:${BACKEND_CONFIG.port}`;

// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log("Service Worker registrado com sucesso!"))
        .catch(err => console.log("Erro ao registrar Service Worker:", err));
}

// Configuração do Day.js para datas relativas em Português
dayjs.extend(window.dayjs_plugin_relativeTime);
dayjs.locale('pt-br');

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function calcularCustoBeneficio() {
    //1. Capturar os valores dos inputs
    const price = parseFloat(document.getElementById('price').value);
    const volumeMl = parseFloat(document.getElementById('volumeMl').value);
    const alcoholicContent = parseFloat(document.getElementById('alcoholic').value);

    //2. Validações simples
    if (isNaN(price) || isNaN(volumeMl) || isNaN(alcoholicContent) || volumeMl <= 0) {
        showToast('Preencha os campos corretamente.', 'error');
        return;
    }

    //3. Cálculo
    const mlPureAlcohol = volumeMl * (alcoholicContent / 100);
    const costByMl = price / mlPureAlcohol;

    //4. Mostrar resultado no HTML
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <h3>Resultado</h3>
        <p>Custo por ml de álcool puro: <strong>R$ ${costByMl.toFixed(2)}</strong></p>
    `;
    console.log("Cálculo realizado com sucesso!");

    //5. Criando um objeto com os dados para enviar
    const calcData = {
        price: price,
        volumeMl: volumeMl,
        alcoholicContent: alcoholicContent,
        costByMl: costByMl
    };

    //6. Enviar para o python backend usando async/await
    try {
        const response = await fetch(`${API_URL}/salvar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(calcData)
        });

        if (!response.ok) {
            // Tenta ler a mensagem de erro enviada pelo Flask
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Erro desconhecido no servidor');
        }

        showToast('Cálculo salvo com sucesso!');
    } catch (error) {
        showToast(error.message, 'error');
        return; // Interrompe para não limpar os campos em caso de erro
    }

    document.getElementById('price').value = '';
    document.getElementById('volumeMl').value = '';
    document.getElementById('alcoholic').value = '';

    // Feedback visual: Muda o texto do botão temporariamente
    const btn = document.getElementById('btn-calcular');
    const originalText = btn.innerText;
    btn.innerText = "Calculado! ✅";
    btn.style.backgroundColor = "#28a745";

    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = "#007bff";
    }, 1500);
}

// 1. Função para trocar de tela (Simples manipulação de CSS)
function mostrarTela(tela) {
    const btnCalc = document.getElementById('btn-nav-calc');
    const btnHist = document.getElementById('btn-nav-hist');

    if (tela === 'calculadora') {
        document.getElementById('tela-calculadora').style.display = 'block';
        document.getElementById('tela-historico').style.display = 'none';
        btnCalc.classList.add('active');
        btnHist.classList.remove('active');
    } else {
        document.getElementById('tela-calculadora').style.display = 'none';
        document.getElementById('tela-historico').style.display = 'block';
        btnCalc.classList.remove('active');
        btnHist.classList.add('active');
        carregarHistorico(); // Sempre que abrir o histórico, busca os dados
    }
}

// Variável global para controlar o que será deletado
let acaoPendente = {
    tipo: null, // 'individual' ou 'todos'
    id: null
};

// 2. Função para buscar os dados do Python
async function carregarHistorico() {
    const container = document.getElementById('lista-historico');

    // Estado de carregamento visual
    container.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Buscando histórico...</p>
        </div>`;

    try {
        const response = await fetch(`${API_URL}/historico`);
        if (!response.ok) throw new Error('Erro ao carregar histórico');

        const dados = await response.json();

        if (dados.length === 0) {
            container.innerHTML = "<p>Nenhum cálculo salvo ainda.</p>";
            return;
        }

        // Encontrar o melhor custo no array
        const menorCusto = Math.min(...dados.map(item => item.costByMl));

        let html = '';

        dados.forEach(item => {
            const eOMelhor = item.costByMl === menorCusto;
            const classeDestaque = eOMelhor ? 'class="melhor-escolha"' : '';
            const medalha = eOMelhor ? '🏆 Melhor Escolha' : '';

            // Formatação da data
            const dataFormatada = item.data_calculo
                ? dayjs(item.data_calculo).fromNow()
                : '---';

            html += `
                <div class="card-historico ${eOMelhor ? 'melhor-escolha' : ''}">
                    <button class="btn-deletar-card" onclick="deletarCalculo(${item.id})" title="Remover">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                    <div class="price-tag">R$ ${item.price.toFixed(2)} <small style="font-size: 11px; font-weight: 400; color: #6c757d; margin-left: auto; padding-right: 25px;">${dataFormatada}</small></div>
                    <div class="info" style="grid-column: span 2; margin-top: -5px; margin-bottom: 5px;"><small>${medalha}</small></div>
                    <div class="info">Volume: ${item.volumeMl}ml</div>
                    <div class="cost-highlight">R$ ${item.costByMl.toFixed(2)}/ml</div>
                    <div class="info">Teor: ${item.alcoholicContent}%</div>
                </div>`;
        });

        container.innerHTML = html;
    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
    }
}

async function deletarCalculo(id) {
    acaoPendente = { tipo: 'individual', id: id };

    document.getElementById('modal-titulo').innerText = 'Remover Registro?';
    document.getElementById('modal-mensagem').innerText = 'Deseja excluir este cálculo do seu histórico?';
    document.getElementById('btn-confirmar-modal').innerText = 'Excluir';

    document.getElementById('modal-confirmacao').style.display = 'flex';
}

//3. Função para limpar o histórico
function limparHistorico() {
    acaoPendente = { tipo: 'todos', id: null };

    document.getElementById('modal-titulo').innerText = 'Limpar Histórico?';
    document.getElementById('modal-mensagem').innerText = 'Esta ação removerá todos os registros permanentemente.';
    document.getElementById('btn-confirmar-modal').innerText = 'Limpar Tudo';

    document.getElementById('modal-confirmacao').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal-confirmacao').style.display = 'none';
    acaoPendente = { tipo: null, id: null };
}

async function executarAcaoConfirmada() {
    const { tipo, id } = acaoPendente;
    fecharModal();

    try {
        let url = tipo === 'individual' ? `${API_URL}/deletar/${id}` : `${API_URL}/limpar`;
        const response = await fetch(url, { method: 'DELETE' });

        if (!response.ok) throw new Error('Erro ao processar exclusão');

        showToast(tipo === 'individual' ? 'Cálculo removido.' : 'Histórico limpo.');
        carregarHistorico();
    } catch (error) {
        showToast('Erro ao realizar operação.', 'error');
    }
}