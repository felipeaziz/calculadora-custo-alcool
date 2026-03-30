const API_URL = 'http://192.168.0.30:5000'

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

            html += `
                <div class="card-historico ${eOMelhor ? 'melhor-escolha' : ''}">
                    <div class="price-tag">R$ ${item.price.toFixed(2)} <small style="font-size: 12px; font-weight: 400; color: #6c757d;">${medalha}</small></div>
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

//3. Função para limpar o histórico
function limparHistorico() {
    document.getElementById('modal-confirmacao').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal-confirmacao').style.display = 'none';
}

async function executarLimpeza() {
    fecharModal();
    try {
        const response = await fetch(`${API_URL}/limpar`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Erro ao limpar histórico');

        showToast('Histórico removido.');
        carregarHistorico();
    } catch (error) {
        showToast('Erro ao limpar histórico.', 'error');
    }
}