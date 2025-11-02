from .base_service import BaseService
from repository import FornecedorRepository
from sqlalchemy.orm import Session
from models import Fornecedor
from fastapi import HTTPException
from typing import Optional

# 2. Faça a classe herdar de BaseService, passando o tipo do repositório
class ServiceFornecedor(BaseService[FornecedorRepository]):
    def __init__(self, session: Session):
        # 3. Crie o repositório específico e passe para o construtor da classe pai
        repository = FornecedorRepository(session)
        super().__init__(repository)

    def cadastrar_fornecedor(self, dados_fornecedor: dict):
        """
        Este método é específico para Fornecedores porque contém a validação
        de duplicidade de CNPJ, Razão Social e E-mail.
        """
        cnpj = dados_fornecedor.get('cnpj')
        razao_social = dados_fornecedor.get('razao_social')
        email = dados_fornecedor.get('email')

        fornecedor_existente = self.repository.find_by_unique_identifier(cnpj=cnpj, razao_social=razao_social, email=email)

        if fornecedor_existente:
            mensagem = f'Já existe um fornecedor com estes dados. Status: {fornecedor_existente.status} - ID: {fornecedor_existente.id_fornecedor}'
            raise HTTPException(status_code=409, detail=mensagem)
        
        novo_fornecedor = Fornecedor(**dados_fornecedor)
        
        # 4. Chama o método 'create' da classe pai (BaseService) para salvar
        return super().create(novo_fornecedor)

    def listar_fornecedores(self, nome: Optional[str] = None, status: Optional[str] = None):
        """
        A lógica de listagem com filtros de nome e status é específica para Fornecedores,
        então ela permanece aqui. (Renomeado para plural 'fornecedores' para consistência)
        """
        if status and status.lower() == 'todos':
            return self.repository.get_all()
        
        return self.repository.buscar(nome=nome, status=status)

    # OS MÉTODOS ABAIXO FORAM REMOVIDOS DESTE ARQUIVO!
    # A lógica deles agora é herdada automaticamente da BaseService.
    #
    # def consultar_fornecedor_por_id(...)
    # def atualizar_fornecedor(...)
    # def inativar_fornecedor(...)