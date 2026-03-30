from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Instanciamos sem passar o app ainda para evitar importação circular
db = SQLAlchemy()
migrate = Migrate()