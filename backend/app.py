from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
CORS(app)

# Configuração do Banco de Dados
# O SQLite criará um arquivo chamado 'historico.db' na mesma pasta do projeto
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'historico.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Definição do Modelo (Tabela)
class Calculo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    price = db.Column(db.Float, nullable=False)
    volumeMl = db.Column(db.Float, nullable=False)
    alcoholicContent = db.Column(db.Float, nullable=False)
    costByMl = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "price": self.price,
            "volumeMl": self.volumeMl,
            "alcoholicContent": self.alcoholicContent,
            "costByMl": self.costByMl
        }

# Cria o banco de dados e as tabelas automaticamente
with app.app_context():
    db.create_all()

@app.route('/salvar', methods=['POST'])
def salvar_calculo():
    data = request.json
    novo_calculo = Calculo(
        price=data['price'],
        volumeMl=data['volumeMl'],
        alcoholicContent=data['alcoholicContent'],
        costByMl=data['costByMl']
    )
    db.session.add(novo_calculo)
    db.session.commit()
    return jsonify({'status': 'sucesso', 'mensagem': 'Cálculo salvo no histórico!'})

@app.route('/historico', methods=['GET'])
def buscar_historico():
    # Buscamos todos os cálculos e ordenamos pelo ID decrescente (mais recentes primeiro)
    historico = Calculo.query.order_by(Calculo.id.desc()).all()
    return jsonify([item.to_dict() for item in historico])

@app.route('/limpar', methods=['DELETE'])
def limpar_historico():
    db.session.query(Calculo).delete()
    db.session.commit()
    return jsonify({'status': 'sucesso', 'mensagem': 'Histórico limpo!'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)