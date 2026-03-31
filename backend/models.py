from .extensions import db
from datetime import datetime

class Calculo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    price = db.Column(db.Float, nullable=False)
    volumeMl = db.Column(db.Float, nullable=False)
    alcoholicContent = db.Column(db.Float, nullable=False)
    costByMl = db.Column(db.Float, nullable=False)
    data_calculo = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "price": self.price,
            "volumeMl": self.volumeMl,
            "alcoholicContent": self.alcoholicContent,
            "costByMl": self.costByMl,
            "data_calculo": self.data_calculo.isoformat() if self.data_calculo else None
        }