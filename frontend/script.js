const API_URL = 'http://192.168.0.30:5000'

function calcularCustoBeneficio() {
    //1. Capturar os valores dos inputs
    const price = parseFloat(document.getElementById('price').value);
    const volumeMl = parseFloat(document.getElementById('volumeMl').value);
    const alcoholicContent = parseFloat(document.getElementById('alcoholic').value);

    //2. Validações simples
    if (isNaN(price) || isNaN(volumeMl) || isNaN(alcoholicContent) || volumeMl <= 0) {
        alert('Por favor, preencha todos os campos corretamente.');
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

    //6. Enviar para o python backend
    fetch(`${API_URL}/salvar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(calcData)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Sucesso:', data);
        })
        .catch(error => {
            console.error('Erro:', error);
        });

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
    if (tela === 'calculadora') {
        document.getElementById('tela-calculadora').style.display = 'block';
        document.getElementById('tela-historico').style.display = 'none';
    } else {
        document.getElementById('tela-calculadora').style.display = 'none';
        document.getElementById('tela-historico').style.display = 'block';
        carregarHistorico(); // Sempre que abrir o histórico, busca os dados
    }
}

// 2. Função para buscar os dados do Python
function carregarHistorico() {
    fetch(`${API_URL}/historico`)
        .then(response => response.json())
        .then(dados => {
            const container = document.getElementById('lista-historico');

            if (dados.length === 0) {
                container.innerHTML = "<p>Nenhum cálculo salvo ainda.</p>";
                return;
            }
            // Encontrar o melhor custo no array
            const menorCusto = Math.min(...dados.map(item => item.costByMl));

            // Criando uma tabela simples para os dados
            let html = '<table border="1" style="width:100%; text-align:left;">';
            html += '<tr><th>Volume</th><th>Teor</th><th>Preço</th><th>Custo/ml</th></tr>';

            dados.reverse().forEach(item => { // .reverse() para mostrar o mais recente primeiro
                // Verificamos se este item é o campeão de custo-benefício
                const eOMelhor = item.costByMl === menorCusto;
                const classeDestaque = eOMelhor ? 'class="melhor-escolha"' : '';
                const medalha = eOMelhor ? '<span class="medalha">🏆</span>' : '';
                html += `
                    <tr ${classeDestaque}>
                        <td>${item.volumeMl}ml</td>
                        <td>${item.alcoholicContent}%</td>
                        <td>R$ ${item.price}</td>
                        <td>${medalha}<strong>R$ ${item.costByMl.toFixed(2)}</strong></td>
                    </tr>`;
            });

            html += '</table>';
            container.innerHTML = html;
        })
        .catch(error => console.error("Erro ao carregar histórico:", error));
}

//3. Função para limpar o histórico
function limparHistorico() {
    if (confirm('Tem certeza que deseja apagar todo o histórico?')) {
        fetch(`${API_URL}/limpar`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                console.log('Sucesso:', data);
                carregarHistorico(); // Atualiza a tela
            })
            .catch(error => {
                console.error('Erro:', error);
            });
    }
}