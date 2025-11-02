from sqlalchemy.orm import Session
from models.models import Base
from typing import Type, TypeVar, List

# T representa qualquer classe de modelo que herde de Base (ex: Produto, Cliente)
T = TypeVar('T', bound=Base)

class BaseRepository:
    def __init__(self, session: Session, model: Type[T]):
        """
        Método construtor da classe BaseRepository.
        
        Args:
            session (Session): A sessão de banco de dados, injetada pela aplicação.
            model (Type[T]): A classe do modelo (ex: Clientes) que o repositório irá gerenciar.
        """
        # A sessão é armazenada para ser usada em todos os métodos do repositório.
        # Ela já vem com a conexão aberta e pronta para uso.
        self.session = session
        
        # O modelo é armazenado para que o repositório saiba com qual tabela trabalhar.
        # Isso torna a classe genérica e reutilizável para qualquer tabela.
        self.model = model

    def get_all(self) -> List[T]:
        """
        Busca e retorna todos os registros da tabela do modelo.
        
        O trecho "-> List[T]" é uma anotação de tipo que não faz parte da lógica, mas diz ao Python
        o que o método retornará. O "T" é um tipo genérico, portanto o método pode retornar uma lista
        de objetos de qualquer tabela do banco de dados, tornando o método get_all() universal.
        """
        # A sessão já está aberta e disponível via self.session
        # O .query(self.model) constrói a consulta SQL SELECT
        # O .all() executa a consulta e retorna os resultados

        resultados = self.session.query(self.model).all()

        return resultados
    
    def get_by_id(self, entity_id: int) -> T:
        """Busca uma entidade pelo sei ID."""
        return self.session.get(self.model, entity_id)
    
    def find_by(self, **kwargs) -> List[T]:
        """
        Busca registros na tabela com base em filtros dinâmicos.
        Ex: find_by(status='Ativo', tipo_cliente='PJ')
        """
        return self.session.query(self.model).filter_by(**kwargs).all()

    def create(self, entity: T) -> T:
        """Adiciona e salva uma nova entidade no banco de dados."""
        self.session.add(entity)
        self.session.commit()
        self.session.refresh(entity)
        return entity
    
    def update(self, entity: T) -> T:
            """Atualiza uma entidade existente."""
            self.session.add(entity)
            self.session.commit()
            self.session.refresh(entity)
            return entity

    def delete(self, entity: T) -> None:
         """Deleta uma entidade do banco de dados"""
         self.session.delete(entity)
         self.session.commit()
         

    
        