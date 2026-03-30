import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Libera o acesso do seu HTML ao Python

ARQUIVO_JSON = 'backend/historico.json'
def carregar_historico():
    if not os.path.exists(ARQUIVO_JSON) or os.stat(ARQUIVO_JSON).st_size == 0:
        return []
    with open(ARQUIVO_JSON, 'r', encoding='utf-8') as f:
        return json.load(f)

def salvar_historico(dados):
    with open(ARQUIVO_JSON, 'w', encoding='utf-8') as f:
        json.dump(dados, f, indent=4)

@app.route('/salvar', methods=['POST'])
def salvar_calculo():
    newData = request.json

    historico = carregar_historico() #Lê o que já existe no arquivo
    historico.append(newData) #Adiciona o novo cálculo
    salvar_historico(historico) #Salva o arquivo
    
    print(f"Salvo no arquivo: {newData}")
    return jsonify({'status': 'sucesso', 'mensagem': 'Cálculo salvo no histórico!'})

@app.route('/historico', methods=['GET'])
def buscar_historico():
    historico = carregar_historico()
    return jsonify(historico)

@app.route('/limpar', methods=['DELETE'])
def limpar_historico():
    salvar_historico([])
    return jsonify({'status': 'sucesso', 'mensagem': 'Histórico limpo!'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) # Inicia o servidor na porta 5000