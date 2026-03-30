from .extensions import db

class Calculo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    price = db.Column(db.Float, nullable=False)
    volumeMl = db.Column(db.Float, nullable=False)
    alcoholicContent = db.Column(db.Float, nullable=False)
    costByMl = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "price": self.price,
            "volumeMl": self.volumeMl,
            "alcoholicContent": self.alcoholicContent,
            "costByMl": self.costByMl
        }