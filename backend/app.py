from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from .extensions import db, migrate
from .routes import calculos_bp

load_dotenv()  # Carrega as variáveis do arquivo .env

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configuração do Banco de Dados
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(basedir, 'historico.db'))
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Inicializa as extensões
    db.init_app(app)
    migrate.init_app(app, db)

    # Registra as rotas (Blueprints)
    app.register_blueprint(calculos_bp)

    with app.app_context():
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    
    host = os.getenv('FLASK_HOST', '127.0.0.1')
    port = int(os.getenv('FLASK_PORT', 5000))
    
    app.run(host=host, port=port, debug=True)