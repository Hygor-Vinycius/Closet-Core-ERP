from fastapi import HTTPException
from repository.base_repository import BaseRepository
from typing import TypeVar, Generic

# T representa o tipo do Repositório, ex: ClienteRepository
Repo = TypeVar('Repo', bound=BaseRepository)

class BaseService(Generic[Repo]):
    def __init__(self, repository: Repo):
        self.repository = repository

    def get_by_id(self, entity_id: int):
        """
        Busca uma entidade pelo ID, levantando erro 404 se não encontrar.
        Esta lógica é genérica e pode ser reutilizada por todos os serviços.
        """
        entity = self.repository.get_by_id(entity_id)
        if entity is None:
            # Usa o nome do modelo do repositório para a mensagem de erro
            model_name = self.repository.model.__name__
            raise HTTPException(status_code=404, detail=f"{model_name} não encontrado(a)")
        return entity

    def update(self, entity_id: int, data: dict):
        """
        Lógica genérica para atualização.
        """
        entity_db = self.get_by_id(entity_id) # Reutiliza a busca com erro 404
        
        for key, value in data.items():
            setattr(entity_db, key, value)
            
        return self.repository.update(entity_db)

    def inativar(self, entity_id: int):
        """
        Lógica genérica para exclusão lógica (soft delete).
        Assume que o modelo tem um atributo 'status'.
        """
        entity_db = self.get_by_id(entity_id)
        entity_db.status = 'Inativo'
        return self.repository.update(entity_db)

    def create(self, entity_obj):
        """
        Método base para criação. Apenas delega para o repositório.
        Serviços específicos devem sobrescrevê-lo para adicionar validações.
        """
        return self.repository.create(entity_obj)