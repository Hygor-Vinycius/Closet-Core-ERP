from .base_service import BaseService  
from repository import ClienteRepository
from sqlalchemy.orm import Session
from models import Clientes
from fastapi import HTTPException
from typing import Optional

# 2. Faça a classe herdar de BaseService, passando o tipo do repositório
class ServiceCliente(BaseService[ClienteRepository]):
    def __init__(self, session: Session):
        # 3. Crie o repositório específico e passe para o construtor da classe pai
        repository = ClienteRepository(session)
        super().__init__(repository)

    def cadastrar_cliente(self, dados_cliente: dict):
        """
        Este método é específico para Clientes porque contém a validação
        de duplicidade de CPF, CNPJ e E-mail.
        """
        cpf = dados_cliente.get('cpf')
        cnpj = dados_cliente.get('cnpj')
        email = dados_cliente.get('email')

        cliente_existente = self.repository.find_by_unique_identifier(cpf=cpf, cnpj=cnpj, email=email)
        
        if cliente_existente:
            mensagem = f'Já existe um cliente com estes dados. Status: {cliente_existente.status} ID: {cliente_existente.id_cliente}'
            raise HTTPException(status_code=409, detail=mensagem)
        
        novo_cliente = Clientes(**dados_cliente)
        
        # 4. Chama o método 'create' da classe pai (BaseService) para salvar
        return super().create(novo_cliente)

    def listar_clientes(self, nome: Optional[str] = None, status: Optional[str] = None):
        """
        A lógica de listagem com filtros de nome e status é específica para Clientes,
        então ela permanece aqui.
        """
        if status and status.lower() == 'todos':
            return self.repository.get_all()
        
        return self.repository.buscar(nome=nome, status=status)
    
    # OS MÉTODOS ABAIXO FORAM REMOVIDOS DESTE ARQUIVO!
    # A lógica deles agora é herdada automaticamente da BaseService.
    #
    # def consultar_cliente_por_id(...)  -> agora é herdado como self.get_by_id(...)
    # def atualizar_cliente(...)       -> agora é herdado como self.update(...)
    # def inativar_cliente(...)        -> agora é herdado como self.inativar(...)