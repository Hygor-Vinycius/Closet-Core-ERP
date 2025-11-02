from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import ServiceEmpresa  # Importe o serviço específico da empresa
from fastapi.encoders import jsonable_encoder
from typing import Optional

router = APIRouter()

@router.post("/empresas", status_code=201)
def cadastrar_empresa_api(dados_empresa: dict, db: Session = Depends(get_db)):
    """Endpoint da API: Cria uma nova empresa."""
    service = ServiceEmpresa(session=db)
    nova_empresa = service.cadastrar_empresa(dados_empresa)
    return jsonable_encoder(nova_empresa)

@router.get("/empresas")
def listar_empresas_api(search: Optional[str] = None, db: Session = Depends(get_db)):
    """Endpoint da API: Lista as empresas, com busca opcional por nome."""
    service = ServiceEmpresa(session=db)
    # Nota: Assumindo que você criará o método 'listar_empresas' no seu serviço.
    lista_de_empresas = service.listar_empresas(nome=search)
    return jsonable_encoder(lista_de_empresas)

@router.put("/empresas/{id_empresa}")
def atualizar_empresa_api(id_empresa: int, dados_empresa: dict, db: Session = Depends(get_db)):
    """Endpoint da API: Atualiza os dados de uma empresa existente."""
    service = ServiceEmpresa(session=db)
    # Chama o método 'update' herdado da BaseService
    empresa_atualizada = service.update(id_empresa, dados_empresa)
    return jsonable_encoder(empresa_atualizada)

