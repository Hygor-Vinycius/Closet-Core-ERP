from .base_service import BaseService
from repository import ProdutoRepository
from sqlalchemy.orm import Session
from models import Produtos
from fastapi import HTTPException
from typing import Optional

class ServiceProduto(BaseService[ProdutoRepository]):
    def __init__(self, session: Session):
        repository = ProdutoRepository(session)
        super().__init__(repository)

    def cadastrar_produto(self, dados_produto: dict):
        """
        Valida e cria um novo produto.
        """
        nome_produto = dados_produto.get('nome_produto')
        
        if nome_produto:
            produto_existente = self.repository.find_by_nome(nome_produto=nome_produto)
            if produto_existente:
                raise HTTPException(status_code=409, detail="Já existe um produto com este nome.")
        
        novo_produto = Produtos(**dados_produto)
        return super().create(novo_produto)

    def listar_produtos(self, nome: Optional[str] = None, status: Optional[str] = None):
        """
        Busca produtos com base em filtros.
        """
        if status and status.lower() == 'todos':
            return self.repository.get_all()
        
        return self.repository.buscar(nome=nome, status=status)
    
    # get_by_id, update e inativar são herdados automaticamente!