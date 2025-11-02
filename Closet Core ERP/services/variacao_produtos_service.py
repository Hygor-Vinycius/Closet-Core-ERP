from .base_service import BaseService
from repository import VariacaoProdutosRepository
from sqlalchemy.orm import Session
from models import VariacaoProdutos
from fastapi import HTTPException
from typing import Optional

class ServiceVariacaoProdutos(BaseService[VariacaoProdutosRepository]):
    def __init__(self, session: Session):
        repository = VariacaoProdutosRepository(session)
        super().__init__(repository)

    def cadastrar_variacao(self, dados_variacao: dict):
        """
        Valida e cria uma nova variação de produto.
        """
        sku = dados_variacao.get('sku')
        ean = dados_variacao.get('ean')
        
        if sku or ean:
            variacao_existente = self.repository.find_by_unique_identifier(sku=sku, ean=ean)
            if variacao_existente:
                raise HTTPException(status_code=409, detail="Já existe uma variação com este SKU ou EAN.")
        
        nova_variacao = VariacaoProdutos(**dados_variacao)
        return super().create(nova_variacao)

    def listar_variacoes(self, produto_id: Optional[int] = None, status: Optional[str] = None):
        """
        Busca variações com base em filtros.
        """
        if status and status.lower() == 'todos':
            # Se quer todos os status, passa None para o filtro de status
            return self.repository.buscar(produto_id=produto_id, status=None)
        
        return self.repository.buscar(produto_id=produto_id, status=status)
    
    # Os métodos get_by_id, update e inativar são herdados automaticamente!