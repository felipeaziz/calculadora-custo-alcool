from flask_sqlalchemy import SQLAlchemy

# Instanciamos sem passar o app ainda para evitar importação circular
db = SQLAlchemy()