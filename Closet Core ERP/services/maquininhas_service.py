from .base_service import BaseService
from repository import MaquininhasRepository
from sqlalchemy.orm import Session
from models import Maquininhas
from fastapi import HTTPException
from typing import Optional

class ServiceMaquininhas(BaseService[MaquininhasRepository]):
    def __init__(self, session: Session):
        repository = MaquininhasRepository(session)
        super().__init__(repository)

    def cadastrar_maquininha(self, dados_maquininha: dict):
        """
        Valida e cria uma nova maquininha.
        """
        nome_maquininha = dados_maquininha.get('nome_maquininha')
        
        if nome_maquininha:
            maquininha_existente = self.repository.find_by_nome(nome_maquininha=nome_maquininha)
            if maquininha_existente:
                raise HTTPException(status_code=409, detail="Já existe uma maquininha com este nome.")
        
        nova_maquininha = Maquininhas(**dados_maquininha)
        return super().create(nova_maquininha)

    def listar_maquininhas(self, nome: Optional[str] = None, status: Optional[str] = None):
        """
        Busca maquininhas com base em filtros.
        """
        if status and status.lower() == 'todos':
             return self.repository.get_all()
        
        return self.repository.buscar(nome=nome, status=status)
    
    # Os métodos get_by_id, update e inativar são herdados automaticamente!