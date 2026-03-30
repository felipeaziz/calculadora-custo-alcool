from flask import Blueprint, request, jsonify
from .extensions import db
from .models import Calculo

# Criamos um Blueprint (um "pedaço" da nossa aplicação)
calculos_bp = Blueprint('calculos', __name__)

@calculos_bp.route('/salvar', methods=['POST'])
def salvar_calculo():
    data = request.json
    campos_obrigatorios = ['price', 'volumeMl', 'alcoholicContent', 'costByMl']
    
    for campo in campos_obrigatorios:
        if campo not in data:
            return jsonify({'erro': f'O campo {campo} é obrigatório.'}), 400

    try:
        price = float(data['price'])
        volume = float(data['volumeMl'])
        content = float(data['alcoholicContent'])
        cost = float(data['costByMl'])

        if price <= 0 or volume <= 0 or content < 0 or content > 100:
            return jsonify({'erro': 'Valores numéricos inválidos ou fora do intervalo.'}), 400

        novo_calculo = Calculo(
            price=price,
            volumeMl=volume,
            alcoholicContent=content,
            costByMl=cost
        )
        db.session.add(novo_calculo)
        db.session.commit()
        return jsonify({'status': 'sucesso', 'mensagem': 'Cálculo salvo!'}), 201

    except (ValueError, TypeError):
        return jsonify({'erro': 'Os dados enviados devem ser números válidos.'}), 400

@calculos_bp.route('/historico', methods=['GET'])
def buscar_historico():
    historico = Calculo.query.order_by(Calculo.id.desc()).all()
    return jsonify([item.to_dict() for item in historico])

@calculos_bp.route('/limpar', methods=['DELETE'])
def limpar_historico():
    try:
        db.session.query(Calculo).delete()
        db.session.commit()
        return jsonify({'status': 'sucesso', 'mensagem': 'Histórico limpo!'})
    except Exception as e:
        return jsonify({'erro': str(e)}), 500