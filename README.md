# 🍷 Calculadora de Custo-Benefício de Álcool

Uma aplicação web moderna (PWA) projetada para calcular o custo por ml de álcool puro em diferentes bebidas, permitindo que o usuário identifique a opção mais econômica. O projeto conta com um histórico persistente e uma interface otimizada para dispositivos móveis.

## 🚀 Funcionalidades

- **Cálculo Preciso**: Processa preço, volume e teor alcoólico para determinar o custo real.
- **Histórico Persistente**: Armazenamento de cálculos anteriores em banco de dados relacional.
- **Destaque Inteligente**: Identifica automaticamente no histórico qual foi a melhor escolha de custo-benefício.
- **Interface Mobile-First**: Design limpo e responsivo utilizando CSS moderno.
- **PWA (Progressive Web App)**: Instalável no celular e preparado para funcionamento offline via Service Workers.
- **Arquitetura Modular**: Backend organizado com Blueprints e Application Factory para facilitar a manutenção.

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.x**
- **Flask**: Micro-framework web.
- **Flask-SQLAlchemy**: ORM para manipulação do banco de dados.
- **Flask-CORS**: Gerenciamento de permissões de acesso.
- **SQLite**: Banco de dados relacional leve.

### Frontend
- **HTML5 & CSS3**: Estrutura e estilização com variáveis modernas e animações.
- **JavaScript (ES6+)**: Lógica assíncrona utilizando `async/await` e manipulação de DOM.
- **Service Workers & Manifest**: Implementação de recursos de PWA.

## 📦 Como Instalar e Rodar

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/calculadora-custo-alcool.git
cd calculadora-custo-alcool
```

### 2. Configurar o Backend
Recomenda--se o uso de um ambiente virtual:
```bash
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Inicie o servidor Flask:
```bash
python -m backend.app
```
O servidor estará rodando em `http://localhost:5000`.

### 3. Configurar o Frontend
Para que o PWA e o Manifest funcionem corretamente devido às políticas de CORS, utilize um servidor local:
```bash
cd frontend
python -m http.server 8000
```
Acesse a aplicação em `http://localhost:8000`.

## 📂 Estrutura do Projeto
- `/backend`: Contém a lógica da API, modelos de dados e rotas.
- `/frontend`: Arquivos estáticos (HTML, CSS, JS) e configuração do PWA.

## 📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.