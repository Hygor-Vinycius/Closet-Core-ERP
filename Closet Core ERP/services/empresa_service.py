from .base_service import BaseService
from repository import EmpresaRepository
from sqlalchemy.orm import Session
from models import Empresa
from fastapi import HTTPException
from typing import Optional

# 1. A classe herda BaseService, passando o tipo do repositório
class ServiceEmpresa(BaseService[EmpresaRepository]):
    def __init__(self, session: Session):
        # 2. Cria o repositório específico e passa para o construtor da classe pai
        repository = EmpresaRepository(session)
        super().__init__(repository)
    
    def cadastrar_empresa(self, dados_empresa: dict):
        """
        Método específico para Empresas porque contém a validação de duplicidade de CNPJ, Razão Social e E-mail.
        """
        cnpj = dados_empresa.get('cnpj')
        razao_social = dados_empresa.get('razao_social')
        email = dados_empresa.get('email')

        empresa_existente = self.repository.find_by_unique_identifier(cnpj=cnpj, razao_social=razao_social, email=email)

        if empresa_existente:
            mensagem = f'Já existe uma empresa com estes dados. ID: {empresa_existente.id_empresa} - Nome: {empresa_existente.razao_social}'
            raise HTTPException(status_code=409, detail=mensagem)
        
        nova_empresa = Empresa(**dados_empresa)

        # 4. Chama o método 'create' da classe pai (BaseService) para salvar
        return super().create(nova_empresa)
    
    def listar_empresas(self, nome: Optional[str] = None):
        """
        A lógica de listagem/busca com filtro por nome é específica,
        então ela permanece aqui.
        """
        # A tabela empresa não tem status, então a lógica é mais simples.
        if nome:
            return self.repository.buscar(nome=nome)
        
        # Se não houver busca, retorna todas as empresas.
        return self.repository.get_all()