from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from .extensions import db
from .routes import calculos_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configuração do Banco de Dados
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'historico.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Inicializa as extensões
    db.init_app(app)

    # Registra as rotas (Blueprints)
    app.register_blueprint(calculos_bp)

    with app.app_context():
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)