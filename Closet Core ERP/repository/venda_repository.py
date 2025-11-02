from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import Vendas

class VendaRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, Vendas)

