from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import Maquininhas
from typing import Optional

class MaquininhasRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, Maquininhas)

    def find_by_nome(self, nome_maquininha: str) -> Optional[Maquininhas]:
        """
        Busca uma maquininha pelo nome exato (case-insensitive).
        Usado para a validação de duplicidade.
        """
        return self.session.query(Maquininhas).filter(Maquininhas.nome_maquininha.ilike(nome_maquininha)).first()

    def buscar(self, nome: Optional[str] = None, status: Optional[str] = None) -> list[Maquininhas]:
        """
        Busca maquininhas de forma dinâmica, permitindo filtrar por nome e/ou status.
        """
        query = self.session.query(Maquininhas)

        if status:
            query = query.filter(Maquininhas.status == status)

        if nome:
            termo_busca = f"%{nome}%"
            query = query.filter(Maquininhas.nome_maquininha.ilike(termo_busca))
        
        return query.all()