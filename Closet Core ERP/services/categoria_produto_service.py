from .base_service import BaseService
from repository import CategoriaProdutosRepository
from sqlalchemy.orm import Session
from models import CategoriaProdutos
from fastapi import HTTPException
from typing import Optional

class ServiceCategoriaProdutos(BaseService[CategoriaProdutosRepository]):
    def __init__(self, session: Session):
        repository = CategoriaProdutosRepository(session)
        super().__init__(repository)

    def cadastrar_categoria(self, dados_categoria: dict):
        """
        Valida e cria uma nova categoria de produto.
        """
        descricao = dados_categoria.get('descricao')
        
        categoria_existente = self.repository.find_by_descricao(descricao=descricao)
        if categoria_existente:
            raise HTTPException(status_code=409, detail="Já existe uma categoria com esta descrição.")
        
        nova_categoria = CategoriaProdutos(**dados_categoria)
        return super().create(nova_categoria)

    def listar_categorias(self, descricao: Optional[str] = None, status: Optional[str] = None):
        """
        Busca categorias com base em filtros.
        """
        if status and status.lower() == 'todos':
             return self.repository.get_all()
        
        return self.repository.buscar(descricao=descricao, status=status)
    
    # Os métodos get_by_id, update e inativar são herdados automaticamente!